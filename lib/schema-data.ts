import { Organization, WebSite, WebPage } from "schema-dts";

export const organizationData: Organization = {
  "@type": "Organization",
  name: "Financial Management System",
  url:
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://financetrack.jeffymesquita.dev",
  logo: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
  sameAs: [
    "https://twitter.com/yourhandle",
    "https://linkedin.com/company/yourcompany",
  ],
};

export const websiteData: WebSite = {
  "@type": "WebSite",
  name: "Financial Management System",
  url:
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://financetrack.jeffymesquita.dev",
  potentialAction: {
    "@type": "SearchAction",
    target: `${process.env.NEXT_PUBLIC_BASE_URL}/search?q={search_term_string}`,
  },
};

export const createWebPageData = (
  title: string,
  description: string,
  path: string,
  breadcrumbs: Array<{ name: string; path: string }>
): WebPage => {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://financetrack.jeffymesquita.dev";

  return {
    "@type": "WebPage",
    name: title,
    description: description,
    url: `${baseUrl}${path}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        ...breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem" as const,
          position: index + 2,
          name: crumb.name,
          item: `${baseUrl}${crumb.path}`,
        })),
      ],
    },
  };
};
