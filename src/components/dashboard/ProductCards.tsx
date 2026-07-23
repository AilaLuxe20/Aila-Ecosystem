"use client";

import Link from "next/link";
import {
    Brain,
    Scale,
    Briefcase,
    Workflow,
    Globe,
    Smartphone,
    ArrowRight,
} from "lucide-react";

const products = [
    {
        title: "Aila Intelligence",
        description: "Enterprise AI workspace and intelligent conversations.",
        href: "/products/intelligence",
        icon: Brain,
    },
    {
        title: "AilaLegal",
        description: "Contract review, legal AI and document intelligence.",
        href: "/products/ailalegal",
        icon: Scale,
    },
    {
        title: "Aila Business",
        description: "CRM, reports, finance and business management.",
        href: "/products/business",
        icon: Briefcase,
    },
    {
        title: "Aila Automation",
        description: "Workflow automation and AI agents.",
        href: "/products/automation",
        icon: Workflow,
    },
    {
        title: "Aila Sites",
        description: "Professional website creation and deployment.",
        href: "/products/sites",
        icon: Globe,
    },
    {
        title: "Aila Apps",
        description: "Build and manage web and mobile applications.",
        href: "/products/apps",
        icon: Smartphone,
    },
];

export default function ProductCards() {
    return (
        <section className="space-y-6">

            <div>
                <h2 className="text-2xl font-bold text-white">
                    Products
                </h2>

                <p className="mt-1 text-white/50">
                    Launch any Aila product from one workspace.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                {products.map((product) => {
                    const Icon = product.icon;

                    return (
                        <Link
                            key={product.title}
                            href={product.href}
                            className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/10"
                        >
                            <div className="mb-5 flex items-center justify-between">

                                <div className="rounded-2xl bg-cyan-500/10 p-4 text-cyan-400">
                                    <Icon size={30} />
                                </div>

                                <ArrowRight
                                    className="text-white/30 transition group-hover:translate-x-1 group-hover:text-cyan-400"
                                    size={20}
                                />

                            </div>

                            <h3 className="text-xl font-semibold text-white">
                                {product.title}
                            </h3>

                            <p className="mt-3 leading-7 text-white/55">
                                {product.description}
                            </p>

                        </Link>
                    );
                })}

            </div>

        </section>
    );
}