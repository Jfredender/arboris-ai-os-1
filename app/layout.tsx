
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import NotificationsPanel from "@/components/notifications-panel";
import { LanguageSelectorEnhanced } from "@/components/language-selector-enhanced";
import { GoogleAnalytics } from "@/components/google-analytics";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: "ARBORIS AI OS 1 - Advanced Plant Intelligence System",
  description: "Professional plant analysis and AI consultation platform powered by advanced artificial intelligence",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "ARBORIS AI OS 1 - Advanced Plant Intelligence System",
    description: "Professional plant analysis and AI consultation platform powered by advanced artificial intelligence",
    url: "/",
    siteName: "ARBORIS AI OS 1",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ARBORIS AI OS 1",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARBORIS AI OS 1 - Advanced Plant Intelligence System",
    description: "Professional plant analysis and AI consultation platform powered by advanced artificial intelligence",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
      </head>
      <body className={`${inter.className} bg-[#242424] min-h-screen smooth-scroll high-dpi-text`}>
        <Providers>
          <LanguageSelectorEnhanced />
          {children}
          <Toaster />
          <NotificationsPanel />
          <GoogleAnalytics />
        </Providers>
      </body>
    </html>
  );
}
