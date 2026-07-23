"use client";

import {
    Brain,
    Scale,
    Briefcase,
    Bot,
    HeartPulse,
    Globe,
} from "lucide-react";

const stats = [
    {
        title: "Aila Intelligence",
        value: "Online",
        subtitle: "Enterprise AI",
        icon: Brain,
        color: "text-cyan-400",
    },
    {
        title: "Aila Legal",
        value: "Ready",
        subtitle: "Legal Intelligence",
        icon: Scale,
        color: "text-violet-400",
    },
    {
        title: "Aila Business",
        value: "Ready",
        subtitle: "Business Platform",
        icon: Briefcase,
        color: "text-emerald-400",
    },
    {
        title: "Aila Automation",
        value: "Ready",
        subtitle: "AI Workflows",
        icon: Bot,
        color: "text-orange-400",
    },
    {
        title: "Aila Health",
        value: "Ready",
        subtitle: "Healthcare AI",
        icon: HeartPulse,
        color: "text-red-400",
    },
    {
        title: "Platform Status",
        value: "Operational",
        subtitle: "Aila Ecosystem",
        icon: Globe,
        color: "text-green-400",
    },
];

export default function StatsGrid() {
    return (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <div
                        key={stat.title}
                        className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/10"
                    >
                        <div className="flex items-start justify-between">

                            <div>

                                <p className="text-sm text-white/50">
                                    {stat.title}
                                </p>

                                <h2 className="mt-3 text-3xl font-bold text-white">
                                    {stat.value}
                                </h2>

                                <p className={`mt-2 text-sm ${stat.color}`}>
                                    {stat.subtitle}
                                </p>

                            </div>

                            <div
                                className={`rounded-2xl border border-white/10 bg-black/20 p-4 ${stat.color}`}
                            >
                                <Icon size={28} />
                            </div>

                        </div>
                    </div>
                );
            })}
        </section>
    );
}