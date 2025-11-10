"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import LiffAuthWrapper from "@/components/LiffAuthWrapper";
import WechatAuthWrapper from "@/components/WechatAuthWrapper";
import FacebookAuthWrapper from "@/components/FacebookAuthWrapper";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <LiffAuthWrapper />
      <WechatAuthWrapper />
      <FacebookAuthWrapper />
      {children}
    </SessionProvider>
  );
}
