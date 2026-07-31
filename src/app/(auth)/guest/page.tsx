import Link from "next/link";

export default function GuestPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Guest Access</h1>
        <p className="mt-4 text-neutral-400">
          This area requires authentication.
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <Link
            href="/sign-in"
            className="rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:scale-105"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-neutral-300 transition hover:bg-white/10"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
