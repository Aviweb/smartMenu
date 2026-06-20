import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./src/lib/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/public/") ||
    pathname.startsWith("/menu/") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Protect all other API routes
  if (pathname.startsWith("/api/")) {
    const authHeader = req.headers.get("authorization");
    const cookieToken = req.cookies.get("token")?.value;

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : cookieToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await verifyToken(token);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/menu/:path*"],
};
