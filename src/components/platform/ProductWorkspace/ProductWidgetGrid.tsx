import { ReactNode } from "react";

interface ProductWidgetGridProps {
    children: ReactNode;
}

export default function ProductWidgetGrid({
    children,
}: ProductWidgetGridProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {children}
        </div>
    );
}