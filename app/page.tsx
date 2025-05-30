import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { LandingPage } from "@/components/landing-page";
import { SchemaOrg } from "@/components/schema-org";
import { websiteData, organizationData } from "@/lib/schema-data";
import { handleReferral } from "./actions/referrals";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

interface HomeProps {
  searchParams: {
    ref?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se tiver um ID de referência, processa o referral
  if (searchParams.ref) {
    await handleReferral(searchParams.ref);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("pixAlertDismissed", "false");
    localStorage.setItem("shareAlertDismissed", "false");
  }

  if (session) {
    redirect("/dashboard");
  }

  return (
    <>
      <SchemaOrg type="Organization" data={organizationData} />
      <SchemaOrg type="WebSite" data={websiteData} />
      <ServiceWorkerRegistration />

      <LandingPage />
    </>
  );
}
