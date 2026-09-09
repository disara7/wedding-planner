import jwt from "jsonwebtoken";

const COOKIE_NAME = "wp_session";
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s === "change-me-to-a-long-random-string") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be set to a strong value in production");
    }
    console.warn("⚠  JWT_SECRET is not set — using an insecure dev fallback");
    return "insecure-dev-fallback-secret";
  }
  return s;
}

export function issueSession(res, user) {
  const token = jwt.sign({ sub: user.id, email: user.email }, secret(), {
    expiresIn: "30d",
  });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: THIRTY_DAYS,
    path: "/",
  });
}

export function clearSession(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

/** Populates req.userId, or 401s. */
export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const payload = jwt.verify(token, secret());
    req.userId = payload.sub;
    next();
  } catch {
    clearSession(res);
    return res.status(401).json({ error: "Session expired" });
  }
}
