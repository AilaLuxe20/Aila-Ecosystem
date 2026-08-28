"use client";

import {
  ChangeEvent,
  DragEvent,
  useRef,
  useState,
} from "react";

type AnalysisState =
  | "idle"
  | "ready"
  | "analyzing"
  | "complete"
  | "error";

const acceptedFileTypes =
  ".pdf,.txt";

export default function DocumentUpload() {
  const [file, setFile] =
    useState<File | null>(null);

  const [status, setStatus] =
    useState<AnalysisState>("idle");

  const [analysis, setAnalysis] =
    useState("");

  const [dragging, setDragging] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  function selectFile(
    selectedFile: File | null
  ) {
    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setAnalysis("");
    setStatus("ready");
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    selectFile(
      event.target.files?.[0] || null
    );
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setDragging(false);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setDragging(false);

    selectFile(
      event.dataTransfer.files?.[0] || null
    );
  }

  function removeFile() {
    setFile(null);
    setAnalysis("");
    setStatus("idle");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
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

      const response = await fetch(
        "/api/ai/document",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Document analysis failed."
        );
      }

      setAnalysis(
        data?.message ||
          "Document analysis completed."
      );

      setStatus("complete");
    } catch (error) {
      console.error(
        "Aila Document Upload Error:",
        error
      );

      setAnalysis(
        error instanceof Error
          ? error.message
          : "Document analysis failed."
      );

      setStatus("error");
    }
  }

  return (
    <div className="overflow-hidden rounded-[36px] border border-white/[0.09] bg-[#080808]/90 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
      {/* HEADER */}
      <div className="border-b border-white/[0.07] px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">
              Document Intelligence
            </p>

            <p className="mt-1 text-xs text-neutral-600">
              AI-powered document analysis
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.04]">
            <div className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* UPLOAD AREA */}
        {!file && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex min-h-[290px] flex-col items-center justify-center overflow-hidden rounded-[28px] border border-dashed p-8 text-center transition duration-300 ${
              dragging
                ? "border-cyan-300/50 bg-cyan-300/[0.07]"
                : "border-white/[0.12] bg-white/[0.02] hover:border-cyan-300/25 hover:bg-cyan-300/[0.025]"
            }`}
          >
            <div className="pointer-events-none absolute left-1/2 top-[-120px] h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/[0.08] blur-[80px]" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.035]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="h-7 w-7 text-neutral-400"
                >
                  <path
                    d="M12 16V4M12 4L7.5 8.5M12 4L16.5 8.5M5 14V18C5 19.1046 5.89543 20 7 20H17C18.1046 20 19 19.1046 19 18V14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h3 className="mt-6 text-lg font-medium text-white">
                Upload document
              </h3>

              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-neutral-600">
                Drop a contract, agreement or
                legal document here for
                intelligent analysis.
              </p>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="mt-6 rounded-full border border-white/[0.09] bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.03]"
              >
                Choose Document
              </button>

              <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-neutral-700">
                PDF · TXT · MAX 10 MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          aria-label="Upload document"
          className="hidden"
        />

        {/* SELECTED FILE */}
        {file && (
          <div>
            <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.04]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-6 w-6 text-cyan-300/70"
                  >
                    <path
                      d="M7 3H14L19 8V21H7V3Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M14 3V8H19"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M10 13H16M10 17H16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-neutral-600">
                    {formatFileSize(file.size)}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        status === "analyzing"
                          ? "animate-pulse bg-purple-400"
                          : status === "complete"
                            ? "bg-green-400"
                            : status === "error"
                              ? "bg-red-400"
                              : "bg-cyan-300"
                      }`}
                    />

                    <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-600">
                      {status === "analyzing"
                        ? "Analyzing"
                        : status === "complete"
                          ? "Analysis Complete"
                          : status === "error"
                            ? "Analysis Failed"
                            : "Ready for Analysis"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  disabled={status === "analyzing"}
                  aria-label="Remove document"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-neutral-600 transition hover:border-red-400/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ×
                </button>
              </div>
            </div>

            {/* ANALYZE BUTTON */}
            {status !== "complete" && (
              <button
                type="button"
                onClick={upload}
                disabled={status === "analyzing"}
                className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "analyzing" && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                )}

                {status === "analyzing"
                  ? "Aila is analyzing..."
                  : status === "error"
                    ? "Try Analysis Again"
                    : "Analyze Document"}
              </button>
            )}

            {/* ANALYSIS RESULT */}
            {analysis && (
              <div
                className={`mt-4 overflow-hidden rounded-[28px] border ${
                  status === "error"
                    ? "border-red-400/15 bg-red-400/[0.03]"
                    : "border-cyan-300/10 bg-cyan-300/[0.025]"
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        status === "error"
                          ? "bg-red-400"
                          : "bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.8)]"
                      }`}
                    />

                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                      {status === "error"
                        ? "Analysis Error"
                        : "Aila Analysis"}
                    </p>
                  </div>

                  {status === "complete" && (
                    <span className="text-[9px] uppercase tracking-[0.16em] text-green-400/60">
                      Complete
                    </span>
                  )}
                </div>

                <div className="max-h-[430px] overflow-y-auto p-5">
                  <div className="whitespace-pre-wrap text-sm leading-7 text-neutral-400">
                    {analysis}
                  </div>
                </div>
              </div>
            )}

            {/* NEW DOCUMENT */}
            {status === "complete" && (
              <button
                type="button"
                onClick={removeFile}
                className="mt-4 w-full rounded-2xl border border-white/[0.08] bg-white/[0.025] px-6 py-4 text-sm text-neutral-400 transition hover:border-cyan-300/20 hover:text-white"
              >
                Analyze Another Document
              </button>
            )}
          </div>
        )}

        {/* SECURITY NOTE */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-black/30 p-4">
          <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400/70" />

          <p className="text-[11px] leading-5 text-neutral-700">
            Documents are processed for analysis.
            AilaLegal provides general information
            and document assistance, not legal
            advice.
          </p>
        </div>
      </div>
    </div>
  );
}
