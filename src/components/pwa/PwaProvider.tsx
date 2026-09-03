"use client";

import { useEffect, type ReactNode } from "react";
import { InstallAilaPrompt } from "@/components/pwa/InstallAilaPrompt";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { registerAilaServiceWorker } from "@/components/pwa/register-sw";

export function PwaProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void registerAilaServiceWorker();
  }, []);

  return (
    <>
      {children}
      <OfflineBanner />
      <InstallAilaPrompt />
    </>
  );
}
