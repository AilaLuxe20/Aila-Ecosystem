"use client";

import { useEffect, useState, type ReactNode } from "react";
import { InstallAilaPrompt } from "@/components/pwa/InstallAilaPrompt";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { registerAilaServiceWorker } from "@/components/pwa/register-sw";

export function PwaProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    void registerAilaServiceWorker();
  }, []);

  return (
    <>
      {children}
      {ready ? (
        <>
          <OfflineBanner />
          <InstallAilaPrompt />
        </>
      ) : null}
    </>
  );
}
