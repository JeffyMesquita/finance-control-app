import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { LandingPage } from "@/components/landing-page";
import { SchemaOrg } from "@/components/schema-org";
import { websiteData, organizationData } from "@/lib/schema-data";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { useEffect } from "react";

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Não processa referral aqui! Apenas redireciona se já estiver logado
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
