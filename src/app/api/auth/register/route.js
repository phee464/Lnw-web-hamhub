export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/model/User";
import bcrypt from "bcryptjs";

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

    return NextResponse.json(
      {
        message: "Registered",
        user: { id: user._id, username: user.username, email: user.email, role: user.role },
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json({ message: "Server error", error: e.message }, { status: 500 });
  }
}
