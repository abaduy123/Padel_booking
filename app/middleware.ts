import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;

  // No session → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/admin/adminLogin", req.url));
  }

  // Verify token
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/admin/adminLogin", req.url));
  }
}

export const config = {
  matcher: [
    "/admin/:path*",      // protect all admin routes
  ],
};
