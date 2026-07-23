interface ProductQuickActionsProps {
    actions: string[];
}

export default function ProductQuickActions({
    actions,
}: ProductQuickActionsProps) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold">
                Quick Actions
            </h2>

            <div className="flex flex-wrap gap-3">
                {actions.map((action) => (
                    <button
                        key={action}
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/10"
                    >
                        {action}
                    </button>
                ))}
            </div>
        </div>
    );
}