"use client";

import { Columns3, FileSearch, Highlighter, Maximize2 } from "lucide-react";
import type { LegalDocumentContext } from "./DocumentUpload";

type DocumentViewerProps = {
  documentContext: LegalDocumentContext | null;
};

export default function DocumentViewer({ documentContext }: DocumentViewerProps) {
  return (
    <section className="enterprise-card min-h-[420px] rounded-[16px] p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--aila-gold)]">
            Document Viewer
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {documentContext ? documentContext.fileName : "No document selected"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {[
            { label: "Split layout", icon: Columns3 },
            { label: "Annotations", icon: Highlighter },
            { label: "Expand", icon: Maximize2 },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                aria-label={item.label}
                className="enterprise-focus flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] text-white/55 transition hover:border-[var(--aila-gold)]/40 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 pt-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="flex min-h-[300px] items-center justify-center rounded-[14px] border border-dashed border-white/12 bg-black/20 p-6">
          <div className="max-w-sm text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.05]">
              <FileSearch className="h-6 w-6 text-[var(--aila-gold)]" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-white">
              {documentContext ? "PDF preview placeholder" : "Upload a document"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/55">
              {documentContext
                ? "The viewer is prepared for PDF rendering, annotation layers and side-by-side clause review."
                : "The document viewer will activate after analysis and keep future annotation support ready."}
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          {[
            ["Viewer mode", "Split review"],
            ["Annotations", "Ready"],
            ["Panel sizing", "Resizable roadmap"],
            ["Context", documentContext ? "Attached" : "Empty"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[12px] border border-white/10 bg-white/[0.04] p-4"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-white/38">
                {label}
              </p>
              <p className="mt-2 text-sm font-medium text-white/78">{value}</p>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
