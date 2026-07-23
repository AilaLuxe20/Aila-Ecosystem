"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginForm() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setLoading(true);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            toast.error("Invalid email or password");
            return;
        }

        toast.success("Welcome back!");

        router.push("/");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white/80"
                >
                    Email
                </label>

                <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-cyan-400"
                    required
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-white/80"
                >
                    Password
                </label>

                <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-cyan-400"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? "Signing In..." : "Sign In"}
            </button>
        </form>
    );
}