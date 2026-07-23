import Link from "next/link";

interface AuthFooterProps {
    text: string;
    linkText: string;
    href: string;
}

export default function AuthFooter({
    text,
    linkText,
    href,
}: AuthFooterProps) {
    return (
        <div className="mt-8 text-center text-sm text-white/60">
            <span>{text} </span>

            <Link
                href={href}
                className="font-medium text-cyan-400 transition hover:text-cyan-300"
            >
                {linkText}
            </Link>
        </div>
    );
}