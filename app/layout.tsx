import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com"
  ),
  title: {
    default: "FinanceTrack - Controle Financeiro",
    template: "%s | FinanceTrack",
  },
  description:
    "Sistema de controle financeiro pessoal, para gerenciar suas finanças de forma eficiente.",
  keywords: [
    "financial management",
    "expense tracking",
    "budget planning",
    "personal finance",
    "business finance",
  ],
  authors: [{ name: "Jeferson Mesquita" }],
  creator: "Jeferson Mesquita",
  publisher: "Jeferson Mesquita",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com",
    title: "FinanceTrack - Controle Financeiro",
    description:
      "Sistema de controle financeiro pessoal, para gerenciar suas finanças de forma eficiente.",
    siteName: "FinanceTrack",
    images: [
      {
        url: "/opengraph-image.png", // Add your OG image
        width: 1200,
        height: 630,
        alt: "FinanceTrack - Controle Financeiro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FinanceTrack - Controle Financeiro",
    description:
      "Sistema de controle financeiro pessoal, para gerenciar suas finanças de forma eficiente.",
    images: ["/twitter-image.png"], // Add your Twitter image
    creator: "@_Jeferson___", // TODO: Replace with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification", // TODO: Replace with your verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />

        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />

        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PerformanceMonitor />
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
