import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { LandingPage } from "@/components/landing-page";
import { SchemaOrg } from "@/components/schema-org";
import { websiteData, organizationData } from "@/lib/schema-data";
import { handleReferral } from "./actions/referrals";

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

  let referralMessage = "";

  // Se tiver um ID de referência, processa o referral
  if (searchParams.ref) {
    const result = await handleReferral(searchParams.ref);
    referralMessage = result.message;
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
      {referralMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-stone-800 p-4 rounded-lg shadow-lg z-50">
          {referralMessage}
        </div>
      )}
      <LandingPage />
    </>
  );
}
