export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/model/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth/jwt";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: "Missing email or password" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ message: "Server JWT not configured (JWT_SECRET missing)" }, { status: 500 });
    }

    const token = signToken({
      id: user._id.toString(),
      role: user.role,
      username: user.username || user.email.split("@")[0],
      email: user.email,
    });

    const res = NextResponse.json({
      message: "Logged in",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 วัน
    });

    return res;
  } catch (e) {
    console.error("[LOGIN_ERROR]", e);
    return NextResponse.json({ message: "Server error", error: e.message }, { status: 500 });
  }
}
