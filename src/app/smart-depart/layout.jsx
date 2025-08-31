// src/app/smart-depart/layout.jsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function SmartDepartProtectedLayout({ children }) {
  // อ่านคุกกี้ 'token' ที่เซ็ตตอน login (/api/auth/login)
  const token = cookies().get('token')?.value;

  // ถ้าไม่มี token -> เด้งไปหน้า login พร้อม ?next=/smart-depart
  if (!token) {
    redirect(`/login?next=${encodeURIComponent('/smart-depart')}`);
  }

  // มี token แล้วให้แสดงหน้าได้ตามปกติ
  return children;
}
