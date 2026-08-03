export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import AuthDebugLoader from "./auth-debug-loader";

export default function AuthDebugPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <AuthDebugLoader />;
}
