"use client";

import {
    CheckCircle2,
    FileText,
    Bot,
    Globe,
    Briefcase,
} from "lucide-react";

const activities = [
    {
        title: "Contract analyzed",
        description: "Employment Agreement.pdf",
        time: "5 minutes ago",
        icon: FileText,
    },
    {
        title: "AI conversation completed",
        description: "Aila Intelligence",
        time: "18 minutes ago",
        icon: Bot,
    },
    {
        title: "Business report generated",
        description: "Monthly Revenue",
        time: "1 hour ago",
        icon: Briefcase,
    },
    {
        title: "Website deployed",
        description: "Aila Portfolio",
        time: "Yesterday",
        icon: Globe,
    },
];

export default function RecentActivity() {
    return (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Recent Activity
                    </h2>

                    <p className="mt-1 text-white/50">
                        Latest actions across your workspace.
                    </p>
                </div>

                <CheckCircle2 className="text-green-400" size={28} />
            </div>

            <div className="space-y-5">
                {activities.map((activity) => {
                    const Icon = activity.icon;

                    return (
                        <div
                            key={activity.title}
                            className="flex items-start gap-5 rounded-2xl border border-white/5 bg-black/20 p-5 transition hover:border-cyan-400/20"
                        >
                            <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                                <Icon size={22} />
                            </div>

                            <div className="flex-1">
                                <h3 className="font-semibold text-white">
                                    {activity.title}
                                </h3>

                                <p className="mt-1 text-sm text-white/50">
                                    {activity.description}
                                </p>
                            </div>

                            <span className="text-xs text-white/40">
                                {activity.time}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}