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
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  icons: [
    { rel: "apple-touch-icon", url: "/web-app-manifest-192x192.png" },
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", url: "/favicon-16x16.png", sizes: "16x16" },
    { rel: "icon", url: "/favicon-32x32.png", sizes: "32x32" },
    { rel: "icon", url: "/favicon-96x96.png", sizes: "96x96" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "FinanceTrack",
    startupImage: "/splash.png",
  },
  applicationName: "FinanceTrack",
  category: "finance",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://financetrack.jeffymesquita.dev"
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
    url:
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://financetrack.jeffymesquita.dev",
    title: "FinanceTrack - Controle Financeiro",
    description:
      "Sistema de controle financeiro pessoal, para gerenciar suas finanças de forma eficiente.",
    siteName: "FinanceTrack",
    images: [
      {
        url: "/opengraph-image.png",
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
    images: ["/twitter-image.png"],
    creator: "@_Jeferson___",
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
    google: "zpAWDLeUMoSZEiQWPVTibvM5lSBM2TeArXwRmbd9IvI",
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
        <meta
          name="google-site-verification"
          content="zpAWDLeUMoSZEiQWPVTibvM5lSBM2TeArXwRmbd9IvI"
        />
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
