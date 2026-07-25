"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Bell,
  Settings,
  UserCircle2,
} from "lucide-react";

import AIOrb from "@/components/AIOrb";
import { products } from "@/config/products";
import "../../../styles/workspace.css";

type Props = {
  children: React.ReactNode;
};

const navigation = products
  .filter((product) => product.status === "live")
  .map((product) => ({
    title: product.name.replace("Aila ", ""),
    href: product.href,
    icon: product.icon,
  }));

export default function WorkspaceShell({ children }: Props) {
  const pathname = usePathname();

  const pageTitle = useMemo(() => {
    return (
      navigation.find((item) => pathname.startsWith(item.href))?.title ??
      "The Aila"
    );
  }, [pathname]);

  return (
    <div className="aila-shell">
      <aside className="aila-sidebar">
        <div className="aila-logo">
          <div className="aila-logo-ring" />
          <div>
            <h1>THE AILA</h1>
            <p>AI OPERATING SYSTEM</p>
          </div>
        </div>

        <nav className="aila-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`aila-nav-item ${
                  active ? "aila-nav-active" : ""
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="active-pill"
                    className="aila-active-pill"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 28,
                    }}
                  />
                )}

                <Icon size={19} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="aila-sidebar-bottom">
          <Link href="/settings" className="aila-mini-btn">
            <Settings size={18} />
            <span>Settings</span>
          </Link>

          <Link href="/profile" className="aila-profile">
            <UserCircle2 size={42} />

            <div>
              <strong>Aila User</strong>
              <p>Enterprise</p>
            </div>
          </Link>
        </div>
      </aside>

      <section className="aila-main">
        <header className="aila-topbar">
          <div>
            <p className="aila-overline">THE AILA</p>
            <h2>{pageTitle}</h2>
          </div>

          <div className="aila-actions">
            <button className="aila-icon-button">
              <Search size={18} />
            </button>

            <button className="aila-icon-button">
              <Bell size={18} />
            </button>

            <div className="aila-status">
              <span className="aila-status-dot" />
              Online
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            className="aila-page"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
            transition={{
              duration: 0.35,
            }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </section>

      <AIOrb />
    </div>
  );
}


