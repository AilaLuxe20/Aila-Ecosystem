"use client";

export default function AppTopbar() {
    return (
        <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between px-8">
            <div>
                <h2 className="text-xl font-semibold">
                    Aila Workspace
                </h2>
            </div>

            <div className="text-sm text-white/60">
                Enterprise AI
            </div>
        </header>
    );
}