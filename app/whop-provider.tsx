"use client";
import { WhopIframeSdkProvider } from "@whop/react";

type Props = { children: React.ReactNode };

export function WhopProvider({ children }: Props) {
  const appId = process.env.NEXT_PUBLIC_WHOP_APP_ID || "dev_app_placeholder";
  return <WhopIframeSdkProvider options={{ appId }}>{children}</WhopIframeSdkProvider>;
}


