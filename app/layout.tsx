import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
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
    // Termos gerais da área
    "controle financeiro",
    "gestão financeira",
    "controle de gastos",
    "organização financeira",
    "planejamento financeiro",
    "sistema financeiro",
    "app financeiro",
    "aplicativo financeiro",

    // Especialização - Progressão (Pessoal/Familiar)
    "controle financeiro pessoal",
    "gestão financeira pessoal",
    "controle de gastos pessoais",
    "orçamento pessoal",
    "orçamento familiar",
    "finanças pessoais",
    "controle de despesas",
    "controle de receitas",
    "planilha financeira",

    // Tipos de controle/funcionalidades
    "controle de contas",
    "controle de cartão de crédito",
    "acompanhamento de gastos",
    "categorização de gastos",
    "relatórios financeiros",
    "dashboard financeiro",
    "análise de gastos",
    "histórico financeiro",

    // Objetivos/Benefícios
    "como controlar gastos",
    "como organizar finanças",
    "como fazer orçamento",
    "economizar dinheiro",
    "reduzir gastos",
    "controlar dívidas",
    "planejamento de metas",
    "educação financeira",

    // Público-alvo específico
    "controle financeiro para iniciantes",
    "gestão financeira familiar",
    "orçamento doméstico",
    "finanças para jovens",
    "controle de gastos estudantil",
    "planejamento financeiro familiar",

    // Tipos de produto/solução
    "software de controle financeiro",
    "aplicativo de orçamento",
    "ferramenta financeira",
    "sistema de gestão pessoal",
    "plataforma financeira",
    "app de finanças",
    "calculadora financeira",

    // Modalidades/Características
    "controle financeiro online",
    "gestão financeira digital",
    "controle financeiro gratuito",
    "sistema financeiro web",
    "app financeiro mobile",
    "controle financeiro em tempo real",

    // Nome do produto - Progressão
    "FinanceTrack",
    "FinanceTrack app",
    "FinanceTrack controle financeiro",
    "FinanceTrack sistema",
    "FinanceTrack Brasil",

    // Localização geográfica
    "controle financeiro Brasil",
    "gestão financeira Brasil",
    "app financeiro brasileiro",
    "sistema financeiro nacional",
    "controle de gastos BR",

    // Funcionalidades específicas
    "categorias de gastos",
    "metas financeiras",
    "alertas de gastos",
    "relatórios mensais",
    "gráficos financeiros",
    "exportar dados financeiros",
    "backup financeiro",
    "sincronização de contas",

    // Termos relacionados - Português
    "conta corrente",
    "poupança",
    "investimentos",
    "cartão de débito",
    "cartão de crédito",
    "PIX",
    "transferências",
    "pagamentos",

    // Combinações qualificativas
    "melhor app financeiro",
    "controle financeiro eficiente",
    "gestão financeira inteligente",
    "sistema financeiro confiável",
    "app financeiro completo",
    "controle financeiro simples",

    // Variações com preposições
    "controle de finanças pessoais",
    "gestão de orçamento familiar",
    "aplicativo para controle financeiro",
    "sistema para organizar gastos",
    "ferramenta de planejamento financeiro",

    // Problemas que resolve
    "desorganização financeira",
    "gastos excessivos",
    "falta de controle financeiro",
    "dificuldade em poupar",
    "endividamento pessoal",
    "orçamento apertado",

    // Resultados esperados
    "vida financeira organizada",
    "estabilidade financeira",
    "economia doméstica",
    "consciência financeira",
    "disciplina financeira",
    "independência financeira",

    // Termos técnicos da área
    "fluxo de caixa pessoal",
    "receitas e despesas",
    "balanço financeiro",
    "análise de custos",
    "projeção financeira",
    "indicadores financeiros",

    // Variações em inglês (SEO internacional)
    "personal finance",
    "expense tracking",
    "budget planning",
    "financial management",
    "money management",
    "financial control",
    "budgeting app",
    "expense tracker",

    // Long-tail keywords
    "como fazer controle financeiro pessoal",
    "aplicativo para controlar gastos mensais",
    "sistema para organizar orçamento familiar",
    "ferramenta gratuita de controle financeiro",
    "app brasileiro de gestão financeira",
    "controle financeiro para celular",
    "planilha digital de orçamento pessoal",
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
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "FinanceTrack - Controle Financeiro",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FinanceTrack - Controle Financeiro",
    description:
      "Sistema de controle financeiro pessoal, para gerenciar suas finanças de forma eficiente.",
    images: ["/twitter-image"],
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
        {/* Additional WhatsApp/Social Media compatibility */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />
        {/* Canonical URL */}
        <link
          rel="canonical"
          href={
            process.env.NEXT_PUBLIC_BASE_URL ||
            "https://financetrack.jeffymesquita.dev"
          }
        />
      </head>
      <body className={inter.className}>
        <QueryProvider>
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
        </QueryProvider>
      </body>
    </html>
  );
}
