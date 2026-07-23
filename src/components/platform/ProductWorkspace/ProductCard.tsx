import { ReactNode } from "react";

interface ProductCardProps {
    title: string;
    children: ReactNode;
}

export default function ProductCard({
    title,
    children,
}: ProductCardProps) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold">
                {title}
            </h2>

            {children}
        </div>
    );
}