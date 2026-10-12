import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export async function proxy(request: NextRequest) {
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