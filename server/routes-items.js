import { Router } from "express";
import { randomUUID } from "node:crypto";
import { pool } from "./db.js";
import { seedSampleItems } from "./sample-items.js";
import { requireAuth } from "./auth-middleware.js";

const router = Router();
router.use(requireAuth);

const CATEGORY_RE = /^[a-z0-9-]{1,64}$/;
const MAX_IMAGE_CHARS = 9_000_000; // ~6.5 MB decoded, matches the client cap

function rowToItem(r) {
  return {
    id: r.id,
    category: r.category,
    type: r.type,
    url: r.url ?? undefined,
    title: r.title ?? undefined,
    description: r.description ?? undefined,
    image: r.image ?? undefined,
    favicon: r.favicon ?? undefined,
    domain: r.domain ?? undefined,
    note: r.note ?? undefined,
    pinned: !!r.pinned,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

function clampText(value, max = 2000) {
  if (value == null) return null;
  const s = String(value);
  return s.length > max ? s.slice(0, max) : s;
}

// GET /api/items  — every item for the signed-in user
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM planning_items WHERE user_id = ? ORDER BY pinned DESC, created_at DESC",
      [req.userId]
    );
    res.json({ items: rows.map(rowToItem) });
  } catch (err) {
    next(err);
  }
});

// POST /api/items  — create one
router.post("/", async (req, res, next) => {
  try {
    const b = req.body || {};
    const category = String(b.category || "");
    const type = b.type === "image" ? "image" : "link";

    if (!CATEGORY_RE.test(category)) {
      return res.status(400).json({ error: "Invalid category." });
    }
    if (type === "link" && !b.url) {
      return res.status(400).json({ error: "A link item needs a url." });
    }
    if (type === "image") {
      if (!b.image || typeof b.image !== "string") {
        return res.status(400).json({ error: "An image item needs image data." });
      }
      if (b.image.length > MAX_IMAGE_CHARS) {
        return res.status(413).json({ error: "That image is too large." });
      }
    }

    const id = randomUUID();
    await pool.query(
      `INSERT INTO planning_items
         (id, user_id, category, type, url, title, description, image, favicon, domain, note, pinned)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        req.userId,
        category,
        type,
        clampText(b.url, 2048),
        clampText(b.title, 512),
        clampText(b.description, 2000),
        type === "image" ? b.image : null,
        clampText(b.favicon, 2048),
        clampText(b.domain, 255),
        clampText(b.note, 2000),
        b.pinned ? 1 : 0,
      ]
    );
    const [rows] = await pool.query("SELECT * FROM planning_items WHERE id = ?", [id]);
    res.status(201).json({ item: rowToItem(rows[0]) });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/items/:id  — update a subset of fields
router.patch("/:id", async (req, res, next) => {
  try {
    const b = req.body || {};
    const sets = [];
    const values = [];

    const textFields = {
      title: 512,
      description: 2000,
      note: 2000,
      url: 2048,
      favicon: 2048,
      domain: 255,
      image: MAX_IMAGE_CHARS,
    };
    for (const [field, max] of Object.entries(textFields)) {
      if (field in b) {
        sets.push(`${field} = ?`);
        values.push(b[field] == null ? null : clampText(b[field], max));
      }
    }
    if ("pinned" in b) {
      sets.push("pinned = ?");
      values.push(b.pinned ? 1 : 0);
    }
    if ("category" in b) {
      if (!CATEGORY_RE.test(String(b.category))) {
        return res.status(400).json({ error: "Invalid category." });
      }
      sets.push("category = ?");
      values.push(String(b.category));
    }
    if (sets.length === 0) {
      return res.status(400).json({ error: "No updatable fields provided." });
    }

    values.push(req.params.id, req.userId);
    const [result] = await pool.query(
      `UPDATE planning_items SET ${sets.join(", ")} WHERE id = ? AND user_id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found." });
    }
    const [rows] = await pool.query("SELECT * FROM planning_items WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ item: rowToItem(rows[0]) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/items/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM planning_items WHERE id = ? AND user_id = ?",
      [req.params.id, req.userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found." });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/items  — clear all for this user
router.delete("/", async (req, res, next) => {
  try {
    await pool.query("DELETE FROM planning_items WHERE user_id = ?", [req.userId]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/items/reset-samples  — wipe and re-seed the sample board
router.post("/reset-samples", async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM planning_items WHERE user_id = ?", [req.userId]);
    await seedSampleItems(conn, req.userId);
    await conn.commit();
    const [rows] = await pool.query(
      "SELECT * FROM planning_items WHERE user_id = ? ORDER BY pinned DESC, created_at DESC",
      [req.userId]
    );
    res.json({ items: rows.map(rowToItem) });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

export default router;
