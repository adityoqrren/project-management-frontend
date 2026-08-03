import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("refreshToken"); // cookie dari backend

  const { pathname } = request.nextUrl;

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const isProtectedRoute = !isAuthRoute

  // ❌ BELUM LOGIN tapi akses halaman protected
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // ✅ SUDAH LOGIN tapi akses halaman auth
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// 🔥 IMPORTANT: exclude static files
export const config = {
  matcher: [
    /*
      Apply proxy to all routes EXCEPT:
      - API routes
      - Next.js internal assets
      - Static files (images, icons, etc.)
    */
    "/((?!api|_next/static|_next/image|favicon.ico|icons|.*\\..*).*)",
  ],
};