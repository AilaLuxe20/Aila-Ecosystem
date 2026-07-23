"use client";

import { useEffect } from "react";
import { usePlatformContext } from "@/core/platform/providers/PlatformProvider";

export default function GlobalHotkeys() {
    const { state, openLauncher, closeLauncher } = usePlatformContext();

    const launcherOpen = state.launcherOpen;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isShortcut =
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k";

            if (!isShortcut) return;

            event.preventDefault();

            console.log("Ctrl+K detected");

            if (launcherOpen) {
                closeLauncher();
            } else {
                openLauncher();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [launcherOpen, openLauncher, closeLauncher]);

    return null;
}