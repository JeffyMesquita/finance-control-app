import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

const publicCrawlers = [
  "GPTBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "Google-Extended",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/dashboard/", "/settings/", "/profile/"],
      },
      ...publicCrawlers.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/api/", "/auth/", "/dashboard/", "/settings/", "/profile/"],
      })),
    ],
    sitemap: `${brand.url}/sitemap.xml`,
  };
}
