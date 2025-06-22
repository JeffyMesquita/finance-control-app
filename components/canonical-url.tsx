import Head from "next/head";

interface CanonicalUrlProps {
  path: string;
}

export function CanonicalUrl({ path }: CanonicalUrlProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com";
  const canonicalUrl = `${baseUrl}${path}`;

  return (
    <Head>
      <link rel="canonical" href={canonicalUrl} />
    </Head>
  );
}

