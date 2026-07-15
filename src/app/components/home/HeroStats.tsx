"use client";

import StatCard from "../ui/StatCard";

export default function HeroStats() {
  return (
    <div className="mt-24 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

      <StatCard
        value="20+"
        title="AI Products"
        description="Enterprise software."
      />

      <StatCard
        value="24/7"
        title="Automation"
        description="Always available."
      />

      <StatCard
        value="Global"
        title="Reach"
        description="Worldwide clients."
      />

      <StatCard
        value="AI"
        title="Enterprise"
        description="Premium solutions."
      />

    </div>
  );
}