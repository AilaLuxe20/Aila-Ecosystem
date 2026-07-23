"use client";

import Link from "next/link";
import {
    Bot,
    FileText,
    Scale,
    Workflow,
    Globe,
    Smartphone,
} from "lucide-react";

const actions = [
    {
        title: "AI Assistant",
        description: "Chat with Aila Intelligence",
        href: "/products/intelligence",
        icon: Bot,
        color: "text-cyan-400",
    },
    {
        title: "Document Analysis",
        description: "Upload and analyze legal documents",
        href: "/products/ailalegal/analyze",
        icon: FileText,
        color: "text-violet-400",
    },
    {
        title: "Legal Workspace",
        description: "Open Aila Legal",
        href: "/products/ailalegal",
        icon: Scale,
        color: "text-indigo-400",
    },
    {
        title: "Automation Studio",
        description: "Create AI workflows",
        href: "/products/automation",
        icon: Workflow,
        color: "text-orange-400",
    },
    {
        title: "Website Studio",
        description: "Manage websites",
        href: "/products/sites",
        icon: Globe,
        color: "text-blue-400",
    },
    {
        title: "App Studio",
        description: "Build web & mobile apps",
        href: "/products/apps",
        icon: Smartphone,
        color: "text-pink-400",
    },
];

export default function QuickActions() {
    return (
        <section className="space-y-6">

            <div>

                <h2 className="text-2xl font-bold text-white">
                    Command Center
                </h2>

                <p className="mt-1 text-white/50">
                    Launch every Aila workspace from one place.
                </p>

            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {actions.map((action) => {
                    const Icon = action.icon;

                    return (
                        <Link
                            key={action.title}
                            href={action.href}
                            className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/10"
                        >
                            <div className="mb-5 flex items-center justify-between">

                                <div
                                    className={`rounded-2xl border border-white/10 bg-black/20 p-4 ${action.color}`}
                                >
                                    <Icon size={28} />
                                </div>

                                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                                    Open
                                </span>

                            </div>

                            <h3 className="text-lg font-semibold text-white">
                                {action.title}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-white/50">
                                {action.description}
                            </p>

                        </Link>
                    );
                })}

            </div>

        </section>
    );
}