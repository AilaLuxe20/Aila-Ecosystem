interface ProductStatusProps {
    status: string;
}

export default function ProductStatus({
    status,
}: ProductStatusProps) {
    return (
        <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400">
            {status}
        </div>
    );
}