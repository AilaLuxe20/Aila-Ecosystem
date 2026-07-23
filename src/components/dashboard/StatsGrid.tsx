"use client";

import {
    Brain,
    Scale,
    Briefcase,
    Bot,
    Activity,
    ArrowUpRight,
} from "lucide-react";

const stats = [
    {
        title: "AI Conversations",
        value: "2,847",
        change: "+18%",
        icon: Brain,
        color: "text-cyan-400",
    },
    {
        title: "Legal Analyses",
        value: "314",
        change: "+12%",
        icon: Scale,
        color: "text-violet-400",
    },
    {
        title: "Business Reports",
        value: "126",
        change: "+9%",
        icon: Briefcase,
        color: "text-emerald-400",
    },
    {
        title: "Automations",
        value: "48",
        change: "+22%",
        icon: Bot,
        color: "text-orange-400",
    },
    {
        title: "System Health",
        value: "99.9%",
        change: "Stable",
        icon: Activity,
        color: "text-green-400",
    },
    {
        title: "Workspace Growth",
        value: "+31%",
        change: "This Month",
        icon: ArrowUpRight,
        color: "text-pink-400",
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
                        className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/10"
                    >
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm text-white/50">
                                    {stat.title}
                                </p>

                                <h2 className="mt-3 text-4xl font-bold text-white">
                                    {stat.value}
                                </h2>

                                <p className={`mt-2 text-sm font-medium ${stat.color}`}>
                                    {stat.change}
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