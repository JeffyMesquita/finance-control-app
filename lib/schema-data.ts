import type { Organization, WebPage, WebSite } from "schema-dts";
import { brand } from "@/lib/brand";

export const organizationData: Organization = {
  "@type": "Organization",
  name: brand.name,
  url: brand.url,
  logo: `${brand.url}/brand/ajeitagrana-512.png`,
  email: brand.contacts.general,
};

export const websiteData: WebSite = {
  "@type": "WebSite",
  name: brand.name,
  url: brand.url,
  description: brand.description,
};

export const createWebPageData = (
  title: string,
  description: string,
  path: string,
  breadcrumbs: Array<{ name: string; path: string }>
): WebPage => ({
  "@type": "WebPage",
  name: title,
  description,
  url: brand.url + path,
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: brand.name, item: brand.url },
      ...breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem" as const,
        position: index + 2,
        name: crumb.name,
        item: brand.url + crumb.path,
      })),
    ],
  },
});
