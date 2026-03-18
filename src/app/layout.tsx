import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Cleanclip — Remove Video Background in Seconds",
  description:
    "Remove background from videos & GIFs automatically using AI with Cleanclip. No editing skills needed. Export transparent WebM or replace with custom background.",
  keywords: "Cleanclip, video background remover, remove video background, AI background removal, transparent video",
  openGraph: {
    title: "Cleanclip — Remove Video Background in Seconds",
    description: "AI-powered video background removal by Cleanclip. Upload, process, download.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const pkLooksValid =
    typeof pk === "string" &&
    (pk.startsWith("pk_test_") || pk.startsWith("pk_live_")) &&
    !pk.includes("your_key_here");

  if (!pkLooksValid) {
    return (
      <html lang="en">
        <body className="antialiased" suppressHydrationWarning>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              padding: "10px 14px",
              background: "#111827",
              color: "#fff",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.01em",
            }}
          >
            Clerk is not configured. Set a valid <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
            in <code>frontend/.env.local</code> (must start with <code>pk_test_</code> or{" "}
            <code>pk_live_</code>), then restart <code>next dev</code>.
          </div>
          <div style={{ paddingTop: 44 }}>{children}</div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased" suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
