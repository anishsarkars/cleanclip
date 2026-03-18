"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

export default function NavbarAuthClerk() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <>
        <Link
          href="/sign-in"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#6b7280",
            background: "none",
            border: "none",
            padding: "8px 0",
            cursor: "pointer",
            fontFamily: "inherit",
            textDecoration: "none",
          }}
        >
          Log in
        </Link>
        <Link
          href="/sign-up"
          style={{
            fontSize: 13,
            fontWeight: 600,
            background: "#111827",
            color: "#fff",
            border: "none",
            padding: "8px 18px",
            borderRadius: 50,
            cursor: "pointer",
            fontFamily: "inherit",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Sign up
        </Link>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Link
          href="/sign-in"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#6b7280",
            background: "none",
            border: "none",
            padding: "8px 0",
            cursor: "pointer",
            fontFamily: "inherit",
            textDecoration: "none",
          }}
        >
          Log in
        </Link>
        <Link
          href="/sign-up"
          style={{
            fontSize: 13,
            fontWeight: 600,
            background: "#111827",
            color: "#fff",
            border: "none",
            padding: "8px 18px",
            borderRadius: 50,
            cursor: "pointer",
            fontFamily: "inherit",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Sign up
        </Link>
      </>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>
          {user.primaryEmailAddress?.emailAddress?.split("@")[0] || "Account"}
        </div>
        <div style={{ fontSize: 10, color: "#6b7280" }}>Signed in</div>
      </div>
      <UserButton />
    </div>
  );
}

