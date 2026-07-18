"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { track } from "@vercel/analytics";
import { useAilaLegal } from "@/app/components/AilaLegalContext";

type UploadState = "idle" | "uploading" | "ready" | "error";

export default function DocumentAnalyzer() {
  const {
    setDocumentContext,
    setUploadState: setContextUploadState,
    clearDocument,
  } = useAilaLegal();

  const [localUploadState, setLocalUploadState] = useState<UploadState>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analyzedFileName, setAnalyzedFileName] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isUploading = localUploadState === "uploading";
  const isReady = localUploadState === "ready";

  async function handleFile(file: File) {
    const name = file.name.toLowerCase();

    if (!name.endsWith(".pdf") && !name.endsWith(".txt")) {
      setUploadError("Only PDF and TXT files are supported.");
      setLocalUploadState("error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File must be smaller than 10 MB.");
      setLocalUploadState("error");
      return;
    }

    setLocalUploadState("uploading");
    setContextUploadState("uploading");
    setUploadError(null);
    setAnalysis(null);
    setAnalyzedFileName(null);
    clearDocument();

    track("ailalegal_document_uploaded", { fileType: file.type });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/legal-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "AilaLegal could not analyze this document."
        );
      }

      setDocumentContext({
        fileName: file.name,
        fileType: file.type || "unknown",
        analysis: data.analysis,
        legalDocumentId: data.legalDocumentId ?? null,
      });

      setAnalysis(data.analysis);
      setAnalyzedFileName(file.name);
      setLocalUploadState("ready");
      setContextUploadState("ready");
    } catch (error) {
      console.error("DocumentAnalyzer Error:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Document analysis failed. Please try again."
      );
      setLocalUploadState("error");
      setContextUploadState("error");
    }
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function reset() {
    clearDocument();
    setLocalUploadState("idle");
    setUploadError(null);
    setAnalysis(null);
    setAnalyzedFileName(null);
  }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-3xl border border-white/[0.08] bg-[#080808]/80 backdrop-blur-xl"
      >
        <div className="border-b border-white/[0.07] px-8 py-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Document Intelligence
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Upload a contract or legal document for AI analysis.
              </p>
            </div>

            {isReady && (
              <button
                type="button"
                onClick={reset}
                className="text-xs uppercase tracking-widest text-neutral-600 transition hover:text-red-400"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          {!isReady && (
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-8 py-14 text-center transition ${
                dragOver
                  ? "border-violet-400/40 bg-violet-400/[0.04]"
                  : "border-white/10 bg-black/20 hover:border-violet-400/25 hover:bg-violet-400/[0.02]"
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                {isUploading ? (
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                ) : (
                  <svg
                    className="h-6 w-6 text-neutral-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-white/70">
                  {isUploading
                    ? "Analyzing document..."
                    : "Drop your document here or click to upload"}
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  PDF or TXT · Max 10 MB
                </p>
              </div>

              {isUploading && (
                <div className="flex flex-col items-center gap-1 text-xs text-violet-400/70">
                  <span>Scanning clauses...</span>
                  <span>Extracting obligations...</span>
                  <span>Detecting risks...</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={onFileInput}
                className="hidden"
              />
            </div>
          )}

          {uploadError && localUploadState === "error" && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-5 py-4">
              <p className="text-sm text-red-400">{uploadError}</p>
              <button
                type="button"
                onClick={reset}
                className="mt-2 text-xs text-neutral-600 underline transition hover:text-white"
              >
                Try again
              </button>
            </div>
          )}

          {isReady && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-violet-400/15 bg-violet-400/[0.04] px-5 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10">
                  <svg
                    className="h-4 w-4 text-violet-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {analyzedFileName}
                  </p>
                  <p className="text-xs text-neutral-600">
                    Analysis complete · Connected to chat
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-black/30 px-6 py-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-neutral-500">
                  AI Analysis Report
                </h3>
                <div className="whitespace-pre-wrap text-sm leading-7 text-neutral-300">
                  {analysis}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}