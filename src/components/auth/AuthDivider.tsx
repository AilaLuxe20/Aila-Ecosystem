interface AuthDividerProps {
    text?: string;
}

export default function AuthDivider({
    text = "or continue with",
}: AuthDividerProps) {
    return (
        <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />

            <span className="whitespace-nowrap text-sm text-white/40">
                {text}
            </span>

            <div className="h-px flex-1 bg-white/10" />
        </div>
    );
}