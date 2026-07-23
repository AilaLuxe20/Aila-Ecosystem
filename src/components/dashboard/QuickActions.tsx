"use client";

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
        title: "New AI Chat",
        description: "Start an intelligent conversation",
        icon: Bot,
    },
    {
        title: "Upload Document",
        description: "Analyze PDFs and files",
        icon: FileText,
    },
    {
        title: "Legal Review",
        description: "Review contracts instantly",
        icon: Scale,
    },
    {
        title: "New Automation",
        description: "Create a workflow",
        icon: Workflow,
    },
    {
        title: "Build Website",
        description: "Launch a new web project",
        icon: Globe,
    },
    {
        title: "Create App",
        description: "Start a mobile or web app",
        icon: Smartphone,
    },
];

export default function QuickActions() {
    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">
                    Quick Actions
                </h2>

                <p className="mt-1 text-white/50">
                    Launch your most common tasks.
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {actions.map((action) => {
                    const Icon = action.icon;

                    return (
                        <button
                            key={action.title}
                            className="group rounded-3xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/10"
                        >
                            <div className="mb-5 inline-flex rounded-2xl bg-cyan-500/10 p-4 text-cyan-400">
                                <Icon size={28} />
                            </div>

                            <h3 className="text-lg font-semibold text-white">
                                {action.title}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-white/50">
                                {action.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}