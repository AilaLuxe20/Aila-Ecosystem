export default function Loading() {
  return (
    <main
      className="flex min-h-[50vh] items-center justify-center bg-[#030303] text-white"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-sm text-neutral-500">Loading Aila…</p>
    </main>
  );
}
