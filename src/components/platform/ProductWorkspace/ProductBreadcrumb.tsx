interface ProductBreadcrumbProps {
    items: string[];
}

export default function ProductBreadcrumb({
    items,
}: ProductBreadcrumbProps) {
    return (
        <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-400">
            {items.map((item, index) => (
                <div key={item} className="flex items-center gap-2">
                    <span>{item}</span>

                    {index < items.length - 1 && (
                        <span>/</span>
                    )}
                </div>
            ))}
        </nav>
    );
}