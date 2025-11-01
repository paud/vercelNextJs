"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LineBridge() {
  const params = useSearchParams();
  const router = useRouter();
  const json = params?.get("json") || null;
  const callbackUrl = params?.get("callbackUrl") || "/";

  useEffect(() => {
    if (!json) {
      router.replace("/");
      return;
    }
    signIn("credentials", {
      json,
      callbackUrl,
      redirect: true,
    });
  }, [json, callbackUrl, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-700">Signing you in...</div>
    </div>
  );
}
