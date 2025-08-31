export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/model/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth/jwt"; // ⬅️ ใช้ตัวเดียวกับ login

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();
    if (!username || !email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });

    // ต้องมี JWT_SECRET
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { message: "Server JWT not configured (JWT_SECRET missing)" },
        { status: 500 }
      );
    }

    // ✅ ออก token ให้เลยเหมือน login
    const token = signToken({
      id: user._id.toString(),
      role: user.role,
      username: user.username,
    });

    // เซ็ตคุกกี้ httpOnly
    const res = NextResponse.json(
      {
        message: "Registered & logged in",
        token, // ส่งกลับไปให้ client เก็บ localStorage ได้ถ้าต้องการ
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      },
      { status: 201 }
    );

    // อายุคุกกี้ 7 วัน (ปรับได้)
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (e) {
    console.error("[REGISTER_ERROR]", e);
    return NextResponse.json({ message: "Server error", error: e.message }, { status: 500 });
  }
}
