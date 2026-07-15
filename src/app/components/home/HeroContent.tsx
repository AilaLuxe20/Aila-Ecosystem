"use client";

import HeroBadge from "../ui/HeroBadge";
import GradientText from "../ui/GradientText";
import HeroButtons from "./HeroButtons";

export default function HeroContent() {
  return (
    <div className="mx-auto max-w-5xl text-center">

      <HeroBadge />

      <h1 className="mt-10 text-7xl font-black leading-tight md:text-8xl">
        Building
        <br />
        <GradientText>
          The Future
        </GradientText>
        <br />
        With AI
      </h1>

      <p className="mx-auto mt-10 max-w-3xl text-lg leading-9 text-slate-400">
        Premium Artificial Intelligence,
        Enterprise Software,
        Automation and Digital Products.
      </p>

      <HeroButtons />

    </div>
  );
}