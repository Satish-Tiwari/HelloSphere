import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const currentUrl = request.nextUrl;
  const authedUser = request.cookies.get("saas_microservices_authed_user");
  console.log(`[Proxy] Processing: ${currentUrl.pathname}`);

  if (request.nextUrl.pathname.startsWith("/api")) {
    console.log(`[Proxy] Skipping API route: ${currentUrl.pathname}`);
    return NextResponse.next();
  }

  if (!authedUser && request.nextUrl.pathname !== "/auth/login" && !request.nextUrl.pathname.startsWith("/auth")) {
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
