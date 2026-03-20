import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

function hasValidSecretKey() {
  const sk = process.env.CLERK_SECRET_KEY;
  return (
    typeof sk === "string" &&
    (sk.startsWith("sk_test_") || sk.startsWith("sk_live_")) &&
    !sk.includes("ROTATE_ME")
  );
}

export default hasValidSecretKey() 
  ? clerkMiddleware() 
  : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
