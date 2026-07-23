"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function WelcomeHero() {
    return (
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10 p-10">

            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">

                <div className="max-w-3xl">

                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
                        <Sparkles size={16} />
                        Aila Ecosystem
                    </div>

                    <h1 className="text-5xl font-bold leading-tight text-white">
                        Your Enterprise
                        <span className="block bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                            AI Ecosystem
                        </span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
                        Manage every Aila product from one intelligent platform.
                        Build software, automate workflows, analyze legal
                        documents, manage healthcare solutions, and scale your
                        business with AI.
                    </p>

                    <div className="mt-10 flex flex-wrap gap-4">

                        <Link
                            href="/products/intelligence"
                            className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400"
                        >
                            Open Intelligence
                        </Link>

                        <Link
                            href="/products/ailalegal"
                            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-white transition hover:bg-white/10"
                        >
                            Open Legal
                        </Link>

                    </div>

                </div>

                <div className="grid w-full max-w-md grid-cols-2 gap-5">

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <p className="text-sm text-white/50">
                            Products
                        </p>

                        <h2 className="mt-3 text-4xl font-bold text-cyan-400">
                            6
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <p className="text-sm text-white/50">
                            AI Modules
                        </p>

                        <h2 className="mt-3 text-4xl font-bold text-violet-400">
                            20+
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <p className="text-sm text-white/50">
                            Platform
                        </p>

                        <h2 className="mt-3 text-2xl font-bold text-white">
                            Enterprise
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <p className="text-sm text-white/50">
                            Status
                        </p>

                        <h2 className="mt-3 text-xl font-bold text-green-400">
                            Operational
                        </h2>
                    </div>

                </div>

            </div>

        </section>
    );
}