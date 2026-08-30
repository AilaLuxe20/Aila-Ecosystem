"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import type { LegalDocumentDto, LegalDocumentListItem } from "@/core/legal/service";
import { workspaceFetch } from "@/components/workspace/api";
import { Button, EmptyState, ToastProvider, useToast } from "@/components/ui";

function LegalLibraryInner(): React.JSX.Element {
  const { isSignedIn, getToken } = useAuth();
  const toast = useToast();
  const [documents, setDocuments] = useState<LegalDocumentListItem[]>([]);
  const [selected, setSelected] = useState<LegalDocumentDto | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isSignedIn) return;
    const response = (await workspaceFetch("/api/legal/documents", { method: "GET" }, undefined, getToken)) as {
      data?: { documents?: LegalDocumentListItem[] };
    };
    setDocuments(response.data?.documents ?? []);
    setLoading(false);
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void load().catch(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
      });
    }, 0);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [isSignedIn, load]);

  async function open(id: string) {
    const response = (await workspaceFetch(`/api/legal/documents/${id}`, { method: "GET" }, undefined, getToken)) as {
      data?: { document?: LegalDocumentDto };
    };
    setSelected(response.data?.document ?? null);
  }

  async function remove(id: string) {
    await workspaceFetch(`/api/legal/documents/${id}`, { method: "DELETE" }, undefined, getToken);
    if (selected?.id === id) setSelected(null);
    toast.success("Document removed");
    await load();
  }

  if (!isSignedIn) {
    return (
      <EmptyState
        title="Sign in to see your library"
        description="Analyzed contracts are stored on your account."
      />
    );
  }

  if (loading) {
    return <p className="text-sm text-white/50">Loading your legal documents…</p>;
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        title="No stored documents"
        description="Upload a contract above. Aila stores the extracted text and analysis on your account."
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ul className="space-y-2">
        {documents.map((document) => (
          <li key={document.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <button type="button" className="w-full text-left" onClick={() => void open(document.id)}>
              <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                {document.hasSummary ? "Analyzed" : "Stored"}
              </p>
              <p className="mt-1 text-sm font-medium">{document.fileName}</p>
            </button>
            <Button size="sm" variant="secondary" className="mt-3" onClick={() => void remove(document.id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
      {selected ? (
        <article className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <h3 className="text-xl font-medium">{selected.fileName}</h3>
          {selected.summary ? (
            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/70">{selected.summary}</div>
          ) : null}
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-white/50">Extracted text</summary>
            <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap text-xs text-white/45">
              {selected.content}
            </pre>
          </details>
        </article>
      ) : (
        <p className="text-sm text-white/45">Select a document to read the stored analysis.</p>
      )}
    </div>
  );
}

export function LegalLibrary(): React.JSX.Element {
  return (
    <ToastProvider>
      <LegalLibraryInner />
    </ToastProvider>
  );
}
