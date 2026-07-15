"use client";

import Link from "next/link";

type Props = {
  open: boolean;
  close(): void;
  navigation: {
    label: string;
    href: string;
  }[];
};

export default function MobileMenu({
  open,
  close,
  navigation,
}: Props) {
  if (!open) return null;

  return (
    <div className="glass mt-4 rounded-3xl p-6 lg:hidden">

      <div className="flex flex-col gap-5">

        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={close}
            className="text-lg text-white/80 hover:text-cyan-400"
          >
            {item.label}
          </Link>
        ))}

      </div>

    </div>
  );
}