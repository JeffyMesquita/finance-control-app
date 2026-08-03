import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: brand.url, changeFrequency: "weekly", priority: 1 },
    { url: `${brand.url}/login`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${brand.url}/politica-de-privacidade`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${brand.url}/termos-de-servico`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
