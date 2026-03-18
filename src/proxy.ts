import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasValidSecretKey() {
  const sk = process.env.CLERK_SECRET_KEY;
  return (
    typeof sk === "string" &&
    (sk.startsWith("sk_test_") || sk.startsWith("sk_live_")) &&
    !sk.includes("ROTATE_ME") &&
    !sk.includes("your_key_here")
  );
}

export const proxy = hasValidSecretKey()
  ? clerkMiddleware()
  : (_req: NextRequest) => NextResponse.next();

export default proxy;

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|.*\\..*).*)",
  ],
};

