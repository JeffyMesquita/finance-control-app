import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type React from "react";
import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { brand } from "@/lib/brand";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: brand.colors.offWhite },
    { media: "(prefers-color-scheme: dark)", color: brand.colors.charcoal },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  manifest: "/manifest.webmanifest",
  applicationName: brand.name,
  category: "finance",
  title: {
    default: `${brand.name} — organização financeira pessoal`,
    template: `%s | ${brand.name}`,
  },
  description: brand.description,
  authors: [{ name: "Jeferson Mesquita" }],
  creator: "Jeferson Mesquita",
  publisher: "Jeferson Mesquita",
  alternates: { canonical: "/" },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/brand/ajeitagrana-symbol.svg", type: "image/svg+xml" },
      { url: "/brand/ajeitagrana-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/ajeitagrana-96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: { url: "/brand/ajeitagrana-180.png", sizes: "180x180" },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: brand.name,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: brand.url,
    title: `${brand.name} — organização financeira pessoal`,
    description: brand.description,
    siteName: brand.name,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: `${brand.name} — organização financeira pessoal`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — organização financeira pessoal`,
    description: brand.description,
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
