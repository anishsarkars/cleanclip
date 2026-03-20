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
          {/* Silence MetaMask/Extension errors that appear in Next.js 16 dev overlay */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const originalError = console.error;
                  console.error = function() {
                    const msg = arguments[0];
                    if (typeof msg === 'string' && (
                        msg.includes('MetaMask') || 
                        msg.includes('Failed to connect to MetaMask') ||
                        msg.includes('nkbihfbeogaeaoehlefnkodbefgpgknn')
                    )) {
                      return;
                    }
                    originalError.apply(console, arguments);
                  };
                  window.addEventListener('error', (event) => {
                    if (event.filename && event.filename.includes('nkbihfbeogaeaoehlefnkodbefgpgknn')) {
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
