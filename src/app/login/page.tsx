"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030303] px-6 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-white/[0.08] bg-white/[0.025] p-8 backdrop-blur-2xl"
      >
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to Aila</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Enter your credentials to continue.
        </p>

        <div className="mt-8 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-neutral-700 focus:border-cyan-300/30"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-neutral-700 focus:border-cyan-300/30"
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}