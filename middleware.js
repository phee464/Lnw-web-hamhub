// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // หน้าปลายทางที่ต้องล็อกอินก่อนเข้า
  const protectedPaths = ['/smart-depart'];

  const { pathname, search } = req.nextUrl;
  const isProtected = protectedPaths.some((p) =>
    pathname === p || pathname.startsWith(p + '/')
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // เช็ค token จาก cookie (ตั้งมาใน /api/auth/login แล้ว)
  const token = req.cookies.get('token')?.value;

  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    // ส่ง path ปัจจุบันไปในพารามิเตอร์ next เพื่อกลับมาหน้าเดิมหลังล็อกอินสำเร็จ
    const current = pathname + (search || '');
    loginUrl.searchParams.set('next', current);
    return NextResponse.redirect(loginUrl);
  }

  // มี token ให้ผ่านได้
  return NextResponse.next();
}

// ให้ Middleware ทำงานเฉพาะ /smart-depart (และลูก)
export const config = {
  matcher: ['/smart-depart/:path*'],
};
