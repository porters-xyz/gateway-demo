import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
export function middleware(request: NextRequest) {
  cookies().get("session") ||
    NextResponse.redirect(new URL("/login", request.url));

  const response = NextResponse.next();

  return response;
}
