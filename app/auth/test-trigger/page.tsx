export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import TestTrigger from "../test-trigger";

export default function TestTriggerPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <TestTrigger />;
}
