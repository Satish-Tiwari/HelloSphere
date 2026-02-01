import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const currentUrl = request.nextUrl;

  // Check for NextAuth session token
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  console.log(`[Proxy] Processing: ${currentUrl.pathname}`);

  if (request.nextUrl.pathname.startsWith("/api")) {
    console.log(`[Proxy] Skipping API route: ${currentUrl.pathname}`);
    return NextResponse.next();
  }

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (token && request.nextUrl.pathname.startsWith("/auth")) {
    console.log(`[Proxy] Redirecting auth user to dashboard`);
    return NextResponse.redirect(new URL("/", currentUrl));
  }

  // Allow access to auth pages (login, signup, etc.) if not authenticated
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  if (!token && request.nextUrl.pathname !== "/auth/login") {
    console.log(`[Proxy] Redirecting unauth user to login`);
    return NextResponse.redirect(new URL("/auth/login", currentUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
