import AuthDebugLoader from "./auth-debug-loader";
import { notFound } from "next/navigation";

export default function AuthDebugPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <AuthDebugLoader />;
}
