"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";

type AnalysisState = "idle" | "ready" | "analyzing" | "complete" | "error";

export type LegalDocumentContext = {
  fileName: string;
  fileType: string;
  fileSize: number;
  analysis: string;
};

type DocumentUploadProps = {
  documentAnalyzedAction?: (document: LegalDocumentContext) => void;
  documentRemovedAction?: () => void;
};

const acceptedFileTypes = ".pdf,.txt";

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentUpload({
  documentAnalyzedAction,
  documentRemovedAction,
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AnalysisState>("idle");
  const [analysis, setAnalysis] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function selectFile(selectedFile: File | null) {
    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setAnalysis("");
    setStatus("ready");
    documentRemovedAction?.();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0] || null);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files?.[0] || null);
  }

  function removeFile() {
    setFile(null);
    setAnalysis("");
    setStatus("idle");
    documentRemovedAction?.();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function upload() {
    if (!file || status === "analyzing") {
      return;
    }

    setStatus("analyzing");
    setAnalysis("");

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
          data?.message || data?.error || "Document analysis failed.",
        );
      }

      const analysisResult =
        data?.analysis ||
        data?.message ||
        data?.result ||
        "Document analysis completed.";

      setAnalysis(analysisResult);
      setStatus("complete");
      documentAnalyzedAction?.({
        fileName: file.name,
        fileType: file.type || "Unknown document type",
        fileSize: file.size,
        analysis: analysisResult,
      });
    } catch (error) {
      console.error("AilaLegal Upload Error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Document analysis failed.";

      setAnalysis(errorMessage);
      setStatus("error");
      documentRemovedAction?.();
    }
  }

  return (
    <section className="enterprise-card overflow-hidden rounded-[16px]">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--aila-gold)]">
            Intake
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Document Upload
          </h2>
        </div>

        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/55">
          PDF / TXT
        </span>
      </div>

      <div className="p-6">
        {!file && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex min-h-[336px] flex-col items-center justify-center rounded-[14px] border border-dashed p-6 text-center transition ${
              dragging
                ? "border-[var(--aila-gold)] bg-[var(--aila-gold)]/12"
                : "border-white/14 bg-black/20 hover:border-[var(--aila-gold)]/45 hover:bg-white/[0.035]"
            }`}
          >
            <motion.div
              animate={{ y: dragging ? -4 : 0, scale: dragging ? 1.03 : 1 }}
              transition={{ duration: 0.2 }}
              className="flex h-16 w-16 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.06]"
            >
              <UploadCloud className="h-7 w-7 text-[var(--aila-gold)]" />
            </motion.div>

            <h3 className="mt-6 text-xl font-semibold text-white">
              Drop contract files here
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/55">
              Upload a contract, agreement or legal document for secure AI
              analysis and clause-level review.
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="enterprise-focus mt-6 rounded-[10px] bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[var(--aila-gold)]"
            >
              Choose Document
            </button>

            <p className="mt-4 text-xs text-white/38">Maximum size 10 MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          aria-label="Upload legal document"
          className="hidden"
        />

        {file && (
          <div>
            <div className="rounded-[14px] border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-white/[0.08] text-[var(--aila-gold)]">
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    {formatFileSize(file.size)}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        status === "analyzing"
                          ? "animate-pulse bg-[#b08d2c]"
                          : status === "complete"
                            ? "bg-emerald-500"
                            : status === "error"
                              ? "bg-red-500"
                              : "bg-[#111312]"
                      }`}
                    />
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-white/45">
                      {status === "analyzing"
                        ? "Analyzing"
                        : status === "complete"
                          ? "Connected"
                          : status === "error"
                            ? "Analysis failed"
                            : "Ready"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  disabled={status === "analyzing"}
                  aria-label="Remove document"
                  className="enterprise-focus flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/10 text-white/45 transition hover:border-red-300/40 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {status !== "complete" && (
              <button
                type="button"
                onClick={upload}
                disabled={status === "analyzing"}
                className="enterprise-focus mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-[var(--aila-gold)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "analyzing" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {status === "analyzing"
                  ? "AilaLegal is analyzing..."
                  : status === "error"
                    ? "Try Analysis Again"
                    : "Analyze Document"}
              </button>
            )}

            {status === "complete" && (
              <div className="mt-4 rounded-[14px] border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Document connected to AilaLegal
                    </p>
                    <p className="mt-1 text-sm leading-6 text-white/55">
                      Analysis is complete. The assistant can now answer
                      questions against this document context.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analysis && (
              <div
                className={`mt-4 overflow-hidden rounded-[14px] border ${
                  status === "error"
                    ? "border-red-300/25 bg-red-400/10"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                    {status === "error" ? "Analysis Error" : "AI Analysis"}
                  </p>
                </div>
                <div className="max-h-[240px] overflow-y-auto p-4">
                  <div className="whitespace-pre-wrap text-sm leading-6 text-white/68">
                    {analysis}
                  </div>
                </div>
              </div>
            )}

            {status === "complete" && (
              <button
                type="button"
                onClick={removeFile}
                className="enterprise-focus mt-4 w-full rounded-[10px] border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-[var(--aila-gold)]/35 hover:bg-white/[0.07]"
              >
                Analyze Another Document
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
