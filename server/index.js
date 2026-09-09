import express from "express";
import cookieParser from "cookie-parser";
import { waitForDatabase } from "./db.js";
import { migrate } from "./schema.js";
import authRoutes from "./routes-auth.js";
import itemRoutes from "./routes-items.js";

const PORT = Number(process.env.PORT || 4000);

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "12mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/config", (_req, res) =>
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || "" })
);

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);

// JSON 404 for unknown API routes.
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ error: "Payload too large." });
  }
  res.status(500).json({ error: "Something went wrong on the server." });
});

async function start() {
  await waitForDatabase();
  await migrate();
  app.listen(PORT, () => {
    console.log(`✓ API listening on http://localhost:${PORT}`);
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.warn("⚠  GOOGLE_CLIENT_ID not set — Google sign-in will be disabled.");
    }
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
