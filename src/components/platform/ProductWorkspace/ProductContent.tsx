import { ReactNode } from "react";

interface ProductContentProps {
    children: ReactNode;
}

export default function ProductContent({
    children,
}: ProductContentProps) {
    return (
        <section className="space-y-6">
            {children}
        </section>
    );
}