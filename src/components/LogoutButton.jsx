'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function LogoutButton({ className = '' }) {
  const router = useRouter();

  const doLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      try { localStorage.removeItem('token'); } catch {}
      await Swal.fire({
        title: 'ออกจากระบบแล้ว',
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
      });
      router.push('/login');
    } catch (e) {
      console.error(e);
      router.push('/login');
    }
  };

  return (
    <button
      onClick={doLogout}
      className={`px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 ${className}`}
    >
      ออกจากระบบ
    </button>
  );
}
