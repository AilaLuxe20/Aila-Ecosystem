"use client";

import { Clock3, FileText, Filter, MoreHorizontal, Search } from "lucide-react";
import type { LegalDocumentContext } from "./DocumentUpload";

type RecentDocumentsProps = {
  documentContext: LegalDocumentContext | null;
};

const baselineDocuments = [
  {
    name: "Mutual NDA Template",
    owner: "Legal Ops",
    risk: "Low",
    updated: "2h ago",
  },
  {
    name: "Enterprise SaaS Agreement",
    owner: "Commercial",
    risk: "Medium",
    updated: "Yesterday",
  },
  {
    name: "Data Processing Addendum",
    owner: "Privacy",
    risk: "Medium",
    updated: "Jul 12",
  },
];

export default function RecentDocuments({
  documentContext,
}: RecentDocumentsProps) {
  const rows = documentContext
    ? [
        {
          name: documentContext.fileName,
          owner: "Current workspace",
          risk: "Medium",
          updated: "Just now",
        },
        ...baselineDocuments,
      ]
    : baselineDocuments;

  return (
    <section className="enterprise-card rounded-[16px]">
      <div className="flex flex-col gap-4 border-b border-white/10 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--aila-gold)]">
            Activity
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Recent Documents
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-[10px] border border-white/10 bg-black/20 px-3 py-2 md:flex">
            <Search className="h-4 w-4 text-white/38" />
            <span className="text-sm text-white/38">Search recent files</span>
          </div>
          <button
            type="button"
            className="enterprise-focus flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] text-white/55 transition hover:text-white"
            aria-label="Filter documents"
          >
            <Filter className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="More document actions"
            className="enterprise-focus flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] text-white/55 transition hover:text-white"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-white/10">
        {rows.map((row) => (
          <article
            key={`${row.name}-${row.updated}`}
            className="grid gap-3 px-6 py-4 text-sm transition hover:bg-white/[0.035] sm:grid-cols-[minmax(0,1fr)_150px_120px_100px]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white/[0.06]">
                <FileText className="h-4 w-4 text-white/45" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">
                  {row.name}
                </p>
                <p className="mt-1 text-xs text-white/42">{row.owner}</p>
              </div>
            </div>

            <div className="flex items-center text-white/45">{row.owner}</div>

            <div>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  row.risk === "Low"
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-[var(--aila-gold)]/15 text-[#f7e8ad]"
                }`}
              >
                {row.risk}
              </span>
            </div>

            <div className="flex items-center gap-2 text-white/45">
              <Clock3 className="h-4 w-4" />
              {row.updated}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
