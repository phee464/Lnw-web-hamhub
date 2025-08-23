"use client";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await axios.post("/api/auth/register", { username, email, password });
      Swal.fire("สำเร็จ", "สมัครสมาชิกเรียบร้อย", "success");
    } catch (err) {
      Swal.fire(
        "ผิดพลาด",
        err.response?.data?.message || "Register failed",
        "error"
      );
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">สมัครสมาชิก</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
          สมัครสมาชิก
        </button>
      </form>
    </div>
  );
}
