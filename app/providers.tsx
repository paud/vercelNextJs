"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import LiffAuthWrapper from "@/components/LiffAuthWrapper";
import WechatAuthWrapper from "@/components/WechatAuthWrapper";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <LiffAuthWrapper />
      <WechatAuthWrapper />
      {children}
    </SessionProvider>
  );
}
