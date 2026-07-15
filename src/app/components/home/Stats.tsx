"use client";

import StatCard from "../ui/StatCard";

export default function Stats() {
  return (
    <section className="py-28">
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

        <StatCard value="20+" title="Products" description="Growing ecosystem." />

        <StatCard value="24/7" title="Automation" description="Always online." />

        <StatCard value="100%" title="Custom" description="Tailored solutions." />

        <StatCard value="Global" title="Clients" description="Worldwide delivery." />

      </div>
    </section>
  );
}