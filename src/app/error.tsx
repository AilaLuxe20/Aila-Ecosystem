"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#030303] px-6 text-center text-white">
      <p className="text-xs uppercase tracking-[0.28em] text-neutral-600">Error</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
        Something went wrong.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-neutral-500">
        The page failed to load. You can try again, or return to the homepage.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-neutral-300"
        >
          Back to Aila
        </a>
      </div>
    </main>
  );
}
