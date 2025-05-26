import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FinanceTrack - Controle Financeiro",
    short_name: "FinanceTrack",
    description:
      "Sistema de controle financeiro pessoal, para gerenciar suas finanças de forma eficiente.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
    ],
    orientation: "portrait",
    categories: ["finance", "productivity", "utilities"],
    dir: "ltr",
    lang: "pt-BR",
    prefer_related_applications: false,
    related_applications: [],
    screenshots: [
      {
        src: "/screenshots/dashboard.png",
        sizes: "1280x720",
        type: "image/png",
        platform: "windows",
        label: "Dashboard do FinanceTrack",
      },
      {
        src: "/screenshots/mobile.png",
        sizes: "750x1334",
        type: "image/png",
        platform: "ios",
        label: "Versão Mobile do FinanceTrack",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Acesse seu dashboard financeiro",
        url: "/dashboard",
        icons: [{ src: "/web-app-manifest-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Nova Transação",
        short_name: "Nova Transação",
        description: "Adicione uma nova transação",
        url: "/transactions",
        icons: [{ src: "/web-app-manifest-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Relatórios",
        short_name: "Relatórios",
        description: "Visualize seus relatórios financeiros",
        url: "/reports",
        icons: [{ src: "/web-app-manifest-192x192.png", sizes: "192x192" }],
      },
    ],
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    launch_handler: {
      client_mode: ["focus-existing", "auto"],
    },
  };
}
