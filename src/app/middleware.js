import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export function middleware(req) {
  const adminPaths = ["/admin"];
  const userPaths = ["/user"];
  const url = req.nextUrl;
  const path = url.pathname;
  const token = req.cookies.get("token")?.value;

  const isAdminPath = adminPaths.some((p) => path.startsWith(p));
  const isUserPath = userPaths.some((p) => path.startsWith(p));

  if ((isAdminPath || isUserPath) && !token) {
    return NextResponse.redirect(new URL("/login", url));
  }

  if (token && isAdminPath) {
    try {
      const payload = verify(token, process.env.JWT_SECRET);
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", url));
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/user/:path*"] };
