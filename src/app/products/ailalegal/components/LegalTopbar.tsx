"use client";

import {
  Bell,
  ChevronDown,
  Command,
  FileText,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import type { LegalDocumentContext } from "./DocumentUpload";

type LegalTopbarProps = {
  documentContext: LegalDocumentContext | null;
  onMenuClickAction: () => void;
};

export default function LegalTopbar({
  documentContext,
  onMenuClickAction,
}: LegalTopbarProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-[#08090c]/86 backdrop-blur-2xl lg:left-72 lg:static lg:border-b-0 lg:bg-transparent lg:px-8 lg:pt-8">
      <div className="enterprise-card mx-auto flex h-16 w-full max-w-[1680px] items-center justify-between gap-4 px-4 lg:h-auto lg:rounded-[16px] lg:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={onMenuClickAction}
            className="enterprise-focus flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white/[0.06] text-white sm:flex">
            <Sparkles className="h-5 w-5 text-[var(--aila-gold)]" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white sm:text-base">
              Legal Intelligence Workspace
            </p>
            <p className="hidden text-xs text-white/45 sm:block">
              Contract review, clause analysis and AI-assisted matter work.
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/70 xl:flex">
          Aila Enterprise
          <ChevronDown className="h-4 w-4 text-white/38" />
        </div>

        <div className="hidden min-w-[280px] max-w-md flex-1 items-center gap-2 rounded-[10px] border border-white/10 bg-black/20 px-3 py-2 xl:flex">
          <Search className="h-4 w-4 text-white/45" />
          <span className="text-sm text-white/38">
            Search documents, risks, clauses
          </span>
          <span className="ml-auto inline-flex items-center gap-1 rounded border border-white/10 px-2 py-0.5 text-[11px] text-white/38">
            <Command className="h-3 w-3" /> K
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="enterprise-focus hidden items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white/70 transition hover:border-[var(--aila-gold)]/35 hover:text-white md:flex"
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>

          <button
            type="button"
            className="enterprise-focus hidden items-center gap-2 rounded-[10px] bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-[var(--aila-gold)] md:flex"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>

          {documentContext && (
            <div className="hidden max-w-[220px] items-center gap-2 rounded-[10px] border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-emerald-200 md:flex">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs font-medium">
                {documentContext.fileName}
              </span>
            </div>
          )}

          <div className="hidden items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/62 sm:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Secure
          </div>

          <button
            type="button"
            aria-label="Notifications"
            className="enterprise-focus flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] text-white/55 transition hover:text-white"
          >
            <Bell className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Profile"
            className="enterprise-focus flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--aila-gold)] to-[#8aa4ff] text-sm font-semibold text-black"
          >
            AI
          </button>
        </div>
      </div>
    </header>
  );
}
