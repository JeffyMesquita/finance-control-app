"use client";

import dynamic from "next/dynamic";

const AuthDebugClient = dynamic(() => import("./auth-debug-client"), {
  ssr: false,
});

export default function AuthDebugLoader() {
  return <AuthDebugClient />;
}
