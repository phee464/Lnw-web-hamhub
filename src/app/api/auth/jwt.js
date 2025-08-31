import jwt from "jsonwebtoken";

export function signToken(payload, opts = {}) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set");
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d", ...opts });
}

export function verifyToken(token) {
  try {
    if (!process.env.JWT_SECRET) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
