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
        <head>
          {/* Hardened Silence for MetaMask/Noise Extension errors in Next.js 16 Overlay */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  // Filter console errors
                  const originalError = console.error;
                  console.error = function(...args) {
                    const msg = String(args[0] || "");
                    if (msg.includes('MetaMask') || 
                        msg.includes('Failed to connect') ||
                        msg.includes('nkbihfbeogaeaoehlefnkodbefgpgknn')) {
                      return;
                    }
                    originalError.apply(console, args);
                  };

                  // Filter global window errors
                  window.onerror = function(message, source, lineno, colno, error) {
                    const msg = String(message || "");
                    const src = String(source || "");
                    if (msg.includes('MetaMask') || src.includes('nkbihfbeogaeaoehlefnkodbefgpgknn')) {
                      return true; // Stop propagation
                    }
                  };

                  // Filter unhandled promise rejections (Extensions often do this)
                  window.addEventListener('unhandledrejection', (event) => {
                    const reason = String(event.reason || "");
                    if (reason.includes('MetaMask') || reason.includes('nkbihfbeogaeaoehlefnkodbefgpgknn')) {
                      event.stopImmediatePropagation();
                      event.preventDefault();
                    }
                  }, true);

                  // Aggressive event blocking for extension scripts
                  window.addEventListener('error', (event) => {
                    if (event.filename && (
                        event.filename.includes('nkbihfbeogaeaoehlefnkodbefgpgknn') ||
                        event.filename.includes('chrome-extension')
                    )) {
                      event.stopImmediatePropagation();
                    }
                  }, true);
                })();
              `
            }}
          />
        </head>
        <body className="antialiased" suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
