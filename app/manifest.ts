import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: brand.url,
    name: "AjeitaGrana — organização financeira pessoal",
    short_name: brand.name,
    description: brand.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: brand.colors.offWhite,
    theme_color: brand.colors.charcoal,
    lang: "pt-BR",
    dir: "ltr",
    categories: ["finance", "productivity"],
    icons: [
      {
        src: "/brand/ajeitagrana-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/brand/ajeitagrana-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        url: "/dashboard",
        icons: [{ src: "/brand/ajeitagrana-192.png", sizes: "192x192" }],
      },
      {
        name: "Nova transação",
        short_name: "Transação",
        url: "/transactions",
        icons: [{ src: "/brand/ajeitagrana-192.png", sizes: "192x192" }],
      },
    ],
  };
}
