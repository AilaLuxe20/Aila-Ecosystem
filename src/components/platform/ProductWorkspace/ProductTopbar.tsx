"use client";

export default function ProductTopbar() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-neutral-950 px-8">
            <div>
                <h1 className="text-lg font-semibold text-white">
                    Aila Workspace
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <button className="rounded-xl border border-white/10 px-4 py-2 text-sm text-neutral-300 transition hover:bg-white/10">
                    Notifications
                </button>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-semibold">
                    A
                </div>
            </div>
        </header>
    );
}