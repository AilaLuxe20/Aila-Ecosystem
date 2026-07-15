"use client";

import Card from "./Card";

type Props = {
  value: string;
  title: string;
  description: string;
};

export default function StatCard({
  value,
  title,
  description,
}: Props) {
  return (
    <Card className="p-10">
      <h2 className="text-6xl font-black text-cyan-400">
        {value}
      </h2>

      <h3 className="mt-6 text-2xl font-bold">
        {title}
      </h3>

      <p className="mt-4 leading-8 text-slate-400">
        {description}
      </p>
    </Card>
  );
}