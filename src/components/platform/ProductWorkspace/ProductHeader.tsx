interface ProductHeaderProps {
    title: string;
    description: string;
}

export default function ProductHeader({
    title,
    description,
}: ProductHeaderProps) {
    return (
        <header className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight">
                {title}
            </h1>

            <p className="mt-3 max-w-3xl text-neutral-400">
                {description}
            </p>
        </header>
    );
}