import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const SECRET = process.env.ADMIN_JWT_SECRET || "temidayo-admin-secret-change-in-production";

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try { return jwt.verify(token, SECRET); } catch { return null; }
}

export function isAdminAuthenticated(req: NextRequest): boolean {
  const cookie = req.cookies.get("admin_token")?.value;
  const header = req.headers.get("authorization")?.replace("Bearer ", "");
  const token = cookie || header;
  if (!token) return false;
  return !!verifyToken(token);
}
