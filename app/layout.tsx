import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NO_FLASH_SCRIPT } from "@/lib/theme";
import { pageMetadata } from "@/lib/seo/metadata";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { MatrixRain } from "@/components/fx/MatrixRain";

export const metadata: Metadata = pageMetadata({});

export const viewport: Viewport = {
  themeColor: "#060a08",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="matrix" suppressHydrationWarning>
      <head>
        {/* Apply saved theme before paint to avoid a flash of the wrong colors. */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-bg text-fg antialiased">
        <MatrixRain />
        {/* faint grid backdrop */}
        <div
          className="pointer-events-none fixed inset-0 -z-20 bg-grid opacity-[0.18] [background-size:44px_44px]"
        />
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <CommandPalette />
      </body>
    </html>
  );
}
