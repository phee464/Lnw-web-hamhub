import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth/jwt';
import LogoutButton from '@/components/LogoutButton';

export default function UserPage() {
  const token = cookies().get('token')?.value || null;
  const user = token ? verifyToken(token) : null;

  if (!user) redirect('/login?next=/user');

  return (
    <div className="min-h-[60vh] px-6 py-10">
      <div className="max-w-3xl mx-auto rounded-xl border bg-white/70 backdrop-blur p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">บัญชีผู้ใช้</h1>
        <div className="space-y-2 text-sm text-gray-700">
          <div><span className="font-medium">ชื่อผู้ใช้:</span> {user.username}</div>
          <div><span className="font-medium">อีเมล:</span> {user.email}</div>
          <div><span className="font-medium">บทบาท:</span> {user.role}</div>
          <div><span className="font-medium">User ID:</span> {user.id}</div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <LogoutButton />
          <a href="/" className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
            กลับหน้าแรก
          </a>
        </div>
      </div>
    </div>
  );
}
