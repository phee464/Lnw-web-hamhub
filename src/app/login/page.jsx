"use client";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/auth/login", { email, password });
      Swal.fire("สำเร็จ", "เข้าสู่ระบบแล้ว", "success");
      if (data.token) localStorage.setItem("token", data.token);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Login failed",
        "error"
      );
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">เข้าสู่ระบบ</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-black text-white p-2 rounded">
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}
