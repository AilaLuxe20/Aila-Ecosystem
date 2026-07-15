"use client";

export default function SectionBadge({
  children,
}:{
  children:React.ReactNode;
}) {
  return (
    <div className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.4em] text-cyan-300">
      {children}
    </div>
  );
}