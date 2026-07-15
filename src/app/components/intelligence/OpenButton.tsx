import Link from "next/link";

export default function IntelligenceButton() {
  return (
    <Link
      href="/intelligence"
      className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-black transition hover:scale-105 hover:bg-cyan-400"
    >
      Open Aila Intelligence
    </Link>
  );
}
