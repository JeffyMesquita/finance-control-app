import { Suspense } from "react";

import { LandingPage } from "@/components/landing-page";
import { SchemaOrg } from "@/components/schema-org";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { organizationData, websiteData } from "@/lib/schema-data";

export default function Home() {
  return (
    <>
      <SchemaOrg type="Organization" data={organizationData} />
      <SchemaOrg type="WebSite" data={websiteData} />
      <ServiceWorkerRegistration />
      <Suspense fallback={null}>
        <LandingPage />
      </Suspense>
    </>
  );
}
