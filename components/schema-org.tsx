import { JsonLd } from "react-schemaorg";
import type { FAQPage, Organization, WebPage, WebSite } from "schema-dts";

interface SchemaOrgProps {
  type: "Organization" | "WebSite" | "WebPage" | "FAQPage";
  data: Organization | WebSite | WebPage | FAQPage;
}

export function SchemaOrg({ type, data }: SchemaOrgProps) {
  return (
    <JsonLd
      item={{
        "@context": "https://schema.org",
        "@type": type,
        ...(data as object),
      }}
    />
  );
}
