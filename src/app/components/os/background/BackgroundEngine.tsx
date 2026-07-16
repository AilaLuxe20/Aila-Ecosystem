"use client";

import Nebula from "./Nebula";
import Particles from "./Particles";
import LightRays from "./LightRays";
import MouseGlow from "./MouseGlow";
import NoiseOverlay from "./NoiseOverlay";

export default function BackgroundEngine() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#060709]">

      <Nebula />

      <Particles />

      <LightRays />

      <MouseGlow />

      <NoiseOverlay />

    </div>
  );
}
