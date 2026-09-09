import { Router } from "express";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { pool } from "./db.js";
import { seedSampleItems } from "./sample-items.js";
import { issueSession, clearSession, requireAuth } from "./auth-middleware.js";

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Precomputed valid hash used for a decoy comparison when an email is unknown,
// so login timing doesn't reveal whether an account exists.
const DUMMY_HASH = bcrypt.hashSync("decoy-password-not-used", 12);

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url || null,
    hasPassword: !!row.password_hash,
  };
}

async function findByEmail(email) {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ? LIMIT 1", [
    email,
  ]);
  return rows[0] || null;
}

/** Create the user row and seed their sample board in one transaction. */
async function createUser({ email, name, passwordHash = null, googleId = null, avatarUrl = null }) {
  const id = randomUUID();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO users (id, email, name, password_hash, google_id, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, email, name || email.split("@")[0], passwordHash, googleId, avatarUrl]
    );
    await seedSampleItems(conn, id);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
}

// ---- Email + password ------------------------------------------------------

router.post("/register", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const name = String(req.body?.name || "").trim().slice(0, 120);

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }
    if (await findByEmail(email)) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser({ email, name, passwordHash });
    issueSession(res, user);
    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    const user = await findByEmail(email);
    const matches = await bcrypt.compare(password, user?.password_hash || DUMMY_HASH);

    if (!user || !user.password_hash || !matches) {
      return res.status(401).json({
        error: user && !user.password_hash
          ? "This account was created with Google. Use “Continue with Google”."
          : "Email or password is incorrect.",
      });
    }
    issueSession(res, user);
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// ---- Google --------------------------------------------------------------

router.post("/google", async (req, res, next) => {
  try {
    if (!googleClient) {
      return res
        .status(503)
        .json({ error: "Google sign-in is not configured on the server." });
    }
    const credential = String(req.body?.credential || "");
    if (!credential) return res.status(400).json({ error: "Missing Google credential." });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ error: "Google account email is not verified." });
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;

    let [rows] = await pool.query(
      "SELECT * FROM users WHERE google_id = ? OR email = ? LIMIT 1",
      [googleId, email]
    );
    let user = rows[0];

    if (!user) {
      user = await createUser({
        email,
        name: payload.name || "",
        googleId,
        avatarUrl: payload.picture || null,
      });
    } else if (!user.google_id) {
      // Link Google to an existing email/password account.
      await pool.query(
        "UPDATE users SET google_id = ?, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?",
        [googleId, payload.picture || null, user.id]
      );
      user.google_id = googleId;
    }

    issueSession(res, user);
    res.json({ user: publicUser(user) });
  } catch (err) {
    if (err?.message?.includes("Token used too late") || err?.message?.includes("Invalid token")) {
      return res.status(401).json({ error: "Google sign-in failed. Please try again." });
    }
    next(err);
  }
});

// ---- Session ------------------------------------------------------------

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.userId]);
    if (!rows[0]) {
      clearSession(res);
      return res.status(401).json({ error: "Account not found" });
    }
    res.json({ user: publicUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

export default router;
