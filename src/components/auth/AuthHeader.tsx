interface AuthHeaderProps {
    title: string;
    subtitle: string;
    highlight?: string;
}

export default function AuthHeader({
    title,
    subtitle,
    highlight,
}: AuthHeaderProps) {
    return (
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white">
                {title}{" "}
                {highlight && (
                    <span className="text-cyan-400">
                        {highlight}
                    </span>
                )}
            </h1>

            <p className="mt-3 text-white/60 text-base">
                {subtitle}
            </p>
        </div>
    );
}