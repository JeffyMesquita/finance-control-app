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
  themeColor: brand.colors.emerald,
};

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  manifest: "/manifest.json",
  applicationName: brand.name,
  category: "finance",
  title: {
    default: `${brand.name} — Controle financeiro sem complicação`,
    template: `%s | ${brand.name}`,
  },
  description: brand.description,
  authors: [{ name: "Jeferson Mesquita" }],
  creator: "Jeferson Mesquita",
  publisher: "Jeferson Mesquita",
  alternates: { canonical: "/" },
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
    title: `${brand.name} — Controle financeiro sem complicação`,
    description: brand.description,
    siteName: brand.name,
    images: [{ url: "/brand/ajeitagrana-512.png", width: 512, height: 512, alt: brand.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — Controle financeiro sem complicação`,
    description: brand.description,
    images: ["/brand/ajeitagrana-512.png"],
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
