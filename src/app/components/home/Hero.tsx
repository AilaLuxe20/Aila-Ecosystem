"use client";

import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";
import HeroPortal from "./HeroPortal";
import HeroStats from "./HeroStats";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-36">

      <HeroBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-6">

        <HeroContent />

        <HeroPortal />

        <HeroStats />

      </div>

    </section>
  );
}