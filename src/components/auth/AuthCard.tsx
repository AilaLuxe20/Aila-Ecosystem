import { ReactNode } from "react";

interface AuthCardProps {
    children: ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
    return (
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10" />

            {children}
        </div>
    );
}