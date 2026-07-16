"use client";

import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  BookOpen,
  Boxes,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Library,
  Scale,
  Settings,
  ShieldCheck,
  SquareStack,
  X,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, active: true },
  { name: "Documents", icon: FileText, active: false },
  { name: "Projects", icon: FolderKanban, active: false },
  { name: "Analysis", icon: BarChart3, active: false },
  { name: "Contracts", icon: BriefcaseBusiness, active: false },
  { name: "Clause Intelligence", icon: SquareStack, active: false },
  { name: "Risk Analysis", icon: ShieldCheck, active: false },
  { name: "Legal Research", icon: BookOpen, active: false },
  { name: "Templates", icon: Library, active: false },
  { name: "Recent Files", icon: Boxes, active: false },
  { name: "Reports", icon: BarChart3, active: false },
  { name: "Assistant", icon: Bot, active: false },
  { name: "Settings", icon: Settings, active: false },
];

type LegalSidebarProps = {
  activeDocument?: string;
  mobileOpen: boolean;
  onCloseAction: () => void;
};

export default function LegalSidebar({
  activeDocument,
  mobileOpen,
  onCloseAction,
}: LegalSidebarProps) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={onCloseAction}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#08090c]/95 text-white shadow-[24px_0_80px_rgba(0,0,0,0.36)] backdrop-blur-2xl transition-transform duration-300 lg:z-40 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--aila-gold)] text-black">
              <Scale className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold tracking-tight">AilaLegal</p>
              <p className="text-xs text-white/45">Enterprise AI counsel</p>
            </div>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={onCloseAction}
              className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-white/10 text-white/58 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                type="button"
                onClick={onCloseAction}
                className={`enterprise-focus flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm transition ${
                  item.active
                    ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.08)]"
                    : "text-white/58 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="space-y-4 p-4">
          <div className="rounded-[14px] border border-white/10 bg-white/[0.05] p-4">
            <div className="flex items-center gap-3">
              <BriefcaseBusiness className="h-4 w-4 text-[#f0d98c]" />
              <p className="text-sm font-semibold">Matter Workspace</p>
            </div>
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/45">
              {activeDocument || "No active document. Upload a file to begin."}
            </p>
          </div>

          <div className="rounded-[14px] border border-[var(--aila-gold)]/25 bg-[var(--aila-gold)]/10 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#f7e8ad]">
              Secure Session
            </p>
            <p className="mt-2 text-sm leading-6 text-white/62">
              AI document review is available for uploaded matters.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
