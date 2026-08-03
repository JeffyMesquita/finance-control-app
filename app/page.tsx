import { LandingPage } from "@/components/landing-page";
import { SchemaOrg } from "@/components/schema-org";
import { faqData, organizationData, websiteData } from "@/lib/schema-data";

export default function Home() {
  return (
    <>
      <SchemaOrg type="Organization" data={organizationData} />
      <SchemaOrg type="WebSite" data={websiteData} />
      <SchemaOrg type="FAQPage" data={faqData} />
      <LandingPage />
    </>
  );
}
