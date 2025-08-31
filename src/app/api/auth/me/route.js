import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ authenticated: false }, { status: 401 });

  return NextResponse.json({
    authenticated: true,
    user: {
      id: payload.id,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    },
  });
}
