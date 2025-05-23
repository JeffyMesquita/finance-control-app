import { Organization, WebSite, WebPage } from "schema-dts";
import { JsonLd } from "react-schemaorg";

interface SchemaOrgProps {
  type: "Organization" | "WebSite" | "WebPage";
  data: Organization | WebSite | WebPage;
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
