"use client";

import { signIn } from "next-auth/react";

export default function SocialLogin() {
    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full rounded-xl border border-white/10 py-3 transition hover:bg-white/5"
            >
                Continue with Google
            </button>

            <button
                type="button"
                onClick={() => signIn("github", { callbackUrl: "/" })}
                className="w-full rounded-xl border border-white/10 py-3 transition hover:bg-white/5"
            >
                Continue with GitHub
            </button>
        </div>
    );
}