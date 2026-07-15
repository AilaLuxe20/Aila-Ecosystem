"use client";

import PortalGlow from "./PortalGlow";
import PortalRing from "./PortalRing";
import PortalCore from "./PortalCore";
import PortalParticles from "./PortalParticles";

export default function PortalEngine() {
  return (
    <div className="relative mx-auto h-[520px] w-[520px]">

      <PortalGlow />

      <PortalParticles />

      <PortalRing />

      <PortalCore />

    </div>
  );
}