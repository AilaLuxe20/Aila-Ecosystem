"use client";

import HeroGlow from "../ui/HeroGlow";
import HeroGrid from "../ui/HeroGrid";
import FloatingOrb from "../ui/FloatingOrb";

export default function HeroBackground() {
  return (
    <>
      <HeroGrid />
      <HeroGlow />
      <FloatingOrb />
    </>
  );
}