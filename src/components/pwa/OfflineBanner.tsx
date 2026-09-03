"use client";

import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    function sync() {
      setOffline(!navigator.onLine);
    }
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[120] border-b border-amber-300/20 bg-amber-950/95 px-4 py-[max(0.65rem,env(safe-area-inset-top))] text-center text-xs text-amber-100 backdrop-blur-md"
    >
      You&apos;re offline. Aila needs a connection for AI, uploads, and account actions.
    </div>
  );
}
