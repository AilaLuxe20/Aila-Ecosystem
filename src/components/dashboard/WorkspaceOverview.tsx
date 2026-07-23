"use client";

import {
    Cpu,
    ShieldCheck,
    Database,
    Zap,
} from "lucide-react";

export default function WorkspaceOverview() {
    return (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">
                    Workspace Overview
                </h2>

                <p className="mt-2 text-white/50">
                    Real-time status of your Aila OS ecosystem.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">

                <div className="flex items-center gap-4 rounded-2xl bg-black/20 p-5">
                    <Cpu className="text-cyan-400" size={28} />

                    <div>
                        <p className="text-sm text-white/50">
                            AI Engine
                        </p>

                        <h3 className="text-xl font-semibold text-white">
                            Operational
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-black/20 p-5">
                    <ShieldCheck className="text-green-400" size={28} />

                    <div>
                        <p className="text-sm text-white/50">
                            Security
                        </p>

                        <h3 className="text-xl font-semibold text-white">
                            Protected
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-black/20 p-5">
                    <Database className="text-violet-400" size={28} />

                    <div>
                        <p className="text-sm text-white/50">
                            Database
                        </p>

                        <h3 className="text-xl font-semibold text-white">
                            Connected
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-black/20 p-5">
                    <Zap className="text-yellow-400" size={28} />

                    <div>
                        <p className="text-sm text-white/50">
                            Automation Engine
                        </p>

                        <h3 className="text-xl font-semibold text-white">
                            Active
                        </h3>
                    </div>
                </div>

            </div>

        </section>
    );
}