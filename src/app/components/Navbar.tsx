"use client";

import Link from "next/link";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const { user } = useUser();
  const { openSignIn, openSignUp } = useClerk();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/85 backdrop-blur-xl">
      <div className="section-container flex h-18 items-center justify-between">
        <Link href="/" className="text-[18px] font-semibold tracking-[-0.04em] text-zinc-950 no-underline">
          CleanClip
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#pricing" className="text-sm font-medium text-zinc-500 no-underline transition-colors hover:text-zinc-950">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <UserButton appearance={{ elements: { userButtonAvatarBox: "h-9 w-9" } }} />
          ) : (
            <>
              <button
                onClick={() => openSignIn()}
                suppressHydrationWarning
                className="cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
              >
                Login
              </button>
              <button
                onClick={() => openSignUp()}
                suppressHydrationWarning
                className="cursor-pointer rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black"
              >
                Signup
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
