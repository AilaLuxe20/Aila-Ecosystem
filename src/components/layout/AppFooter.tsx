"use client";

export default function AppFooter() {
    return (
        <footer className="border-t border-white/10 bg-black/40 px-8 py-4 text-center text-sm text-white/50">
            © {new Date().getFullYear()} Aila Ecosystem
        </footer>
    );
}