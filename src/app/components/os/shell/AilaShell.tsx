"use client";

import BackgroundEngine from "../background/BackgroundEngine";

export default function AilaShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BackgroundEngine />

      <div className="relative min-h-screen overflow-hidden text-white">
        {children}
      </div>
    </>
  );
}