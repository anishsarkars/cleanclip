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
