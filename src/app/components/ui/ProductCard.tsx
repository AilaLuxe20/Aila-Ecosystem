"use client";

import Link from "next/link";
import Card from "./Card";
import { ArrowUpRight, LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
};

export default function ProductCard({
  icon: Icon,
  title,
  description,
  href,
}: Props) {
  return (
    <Link href={href}>
      <Card className="group p-9">

        <Icon className="h-10 w-10 text-cyan-400" />

        <h3 className="mt-8 text-3xl font-black">
          {title}
        </h3>

        <p className="mt-5 text-slate-400 leading-8">
          {description}
        </p>

        <ArrowUpRight className="mt-10 h-6 w-6 transition group-hover:rotate-45" />

      </Card>
    </Link>
  );
}