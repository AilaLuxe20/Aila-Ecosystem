"use client";

import { FileCheck2, FileClock, FileText } from "lucide-react";
import type { LegalDocumentContext } from "./DocumentUpload";

type DocumentListProps = {
  documentContext: LegalDocumentContext | null;
};

const queuedDocuments = [
  {
    name: "Vendor Services MSA.pdf",
    meta: "Template library",
    status: "Ready",
  },
  {
    name: "NDA Review Pack.txt",
    meta: "Knowledge base",
    status: "Indexed",
  },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList({ documentContext }: DocumentListProps) {
  const documents = documentContext
    ? [
        {
          name: documentContext.fileName,
          meta: `${documentContext.fileType} / ${formatFileSize(
            documentContext.fileSize,
          )}`,
          status: "Active",
        },
        ...queuedDocuments,
      ]
    : queuedDocuments;

  return (
    <section className="enterprise-card rounded-[16px]">
      <div className="border-b border-white/10 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--aila-gold)]">
          Matter Files
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Document List
        </h2>
      </div>

      <div className="space-y-4 p-6">
        {documents.map((document) => {
          const active = document.status === "Active";
          const Icon = active ? FileCheck2 : FileText;

          return (
            <article
              key={`${document.name}-${document.status}`}
              className={`rounded-[14px] border p-4 transition ${
                active
                  ? "border-[var(--aila-gold)]/35 bg-[var(--aila-gold)]/10 text-white"
                  : "border-white/10 bg-white/[0.04] text-white hover:border-white/18 hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] ${
                    active ? "bg-[var(--aila-gold)]/12" : "bg-white/[0.06]"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${active ? "text-[var(--aila-gold)]" : "text-white/45"}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {document.name}
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      active ? "text-white/55" : "text-white/45"
                    }`}
                  >
                    {document.meta}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    active
                      ? "bg-[var(--aila-gold)] text-black"
                      : "border border-white/10 text-white/45"
                  }`}
                >
                  {document.status}
                </span>
              </div>
            </article>
          );
        })}

        <div className="flex items-center gap-3 rounded-[14px] border border-dashed border-white/14 bg-black/20 p-4 text-white/45">
          <FileClock className="h-5 w-5" />
          <p className="text-sm">New uploads appear here after intake.</p>
        </div>
      </div>
    </section>
  );
}
