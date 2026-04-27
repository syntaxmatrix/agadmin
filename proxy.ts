import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIX = "/dashboard";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_token")?.value;
  const email = request.cookies.get("admin_email")?.value;
  const role = request.cookies.get("admin_role")?.value;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const emailAllowed = !admins.length || (email ? admins.includes(email.toLowerCase()) : false);
  const isAuthorized = Boolean(token && email && role === "Admin" && emailAllowed);

  if (isAuthorized) {
    return NextResponse.next();
  }

  const url = new URL("/login", request.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
