"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileSignature,
  Gavel,
  HeartPulse,
  ListChecks,
  ScanSearch,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { LegalDocumentContext } from "./DocumentUpload";

type InsightCardsProps = {
  documentContext: LegalDocumentContext | null;
  metrics: {
    documents: number;
    riskScore: number;
    clauses: number;
    missingClauses: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    confidence: number;
    status: string;
  };
};

const clauses = [
  {
    title: "Termination",
    note: "Review notice period, cause triggers and renewal language.",
    severity: "Medium",
  },
  {
    title: "Liability Cap",
    note: "Confirm exclusions, indemnity interaction and monetary limits.",
    severity: "High",
  },
  {
    title: "Data Use",
    note: "Validate retention, processing and confidentiality obligations.",
    severity: "Low",
  },
];

export default function InsightCards({
  documentContext,
  metrics,
}: InsightCardsProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.72fr_0.58fr_0.7fr]">
      <div className="enterprise-card rounded-[16px] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--aila-gold)]">
              Contract Summary
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Review Snapshot
            </h2>
          </div>
          <Sparkles className="h-5 w-5 text-[var(--aila-gold)]" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          {[
            {
              label: "Documents",
              value: metrics.documents,
              icon: FileSignature,
            },
            {
              label: "Clauses",
              value: metrics.clauses,
              icon: Gavel,
            },
            {
              label: "Status",
              value: metrics.status,
              icon: CheckCircle2,
            },
            {
              label: "Missing",
              value: metrics.missingClauses,
              icon: ScanSearch,
            },
            {
              label: "Health",
              value: documentContext ? "Good" : "Pending",
              icon: HeartPulse,
            },
            {
              label: "Confidence",
              value: `${metrics.confidence}%`,
              icon: ListChecks,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-[14px] border border-white/10 bg-white/[0.04] p-4 transition hover:border-[var(--aila-gold)]/25"
              >
                <Icon className="h-4 w-4 text-white/45" />
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-white/38">
                  {item.label}
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-sm leading-6 text-white/58">
          {documentContext
            ? "AilaLegal has generated a working summary and is ready for focused follow-up questions."
            : "Upload a document to generate executive summaries, obligations and review notes."}
        </p>
      </div>

      <div className="enterprise-card rounded-[16px] p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--aila-gold)]">
              Risk Score
            </p>
            <h2 className="mt-2 text-xl font-semibold">Contract Exposure</h2>
          </div>
          <ShieldAlert className="h-5 w-5 text-[var(--aila-gold)]" />
        </div>

        <div className="mt-6 flex items-end gap-4">
          <p className="text-6xl font-semibold tracking-tight">
            {metrics.riskScore}
          </p>
          <div className="pb-2">
            <p className="text-sm font-medium text-[var(--aila-gold)]">
              {documentContext ? "Medium" : "Baseline"}
            </p>
            <p className="mt-1 text-xs text-white/45">out of 100</p>
          </div>
        </div>

        <div className="mt-6 h-2 rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-[var(--aila-gold)]"
            style={{ width: `${metrics.riskScore}%` }}
          />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            ["High", metrics.highRisk, "text-red-300"],
            ["Medium", metrics.mediumRisk, "text-amber-200"],
            ["Low", metrics.lowRisk, "text-emerald-300"],
          ].map(([label, value, color]) => (
            <div
              key={label}
              className="rounded-[12px] border border-white/10 bg-white/[0.04] p-3"
            >
              <p className={`text-lg font-semibold ${color}`}>{value}</p>
              <p className="mt-1 text-xs text-white/38">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-[12px] border border-white/10 bg-white/[0.06] p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--aila-gold)]" />
          <p className="text-sm leading-6 text-white/62">
            {documentContext
              ? "Prioritize liability, termination and data handling language."
              : "Risk scoring activates after document analysis."}
          </p>
        </div>
      </div>

      <div className="enterprise-card rounded-[16px] p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--aila-gold)]">
            Clause Analysis
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Priority Terms
          </h2>
        </div>

        <div className="mt-6 space-y-4">
          {clauses.map((clause) => (
            <div
              key={clause.title}
              className="rounded-[14px] border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/18"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">
                  {clause.title}
                </p>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/45">
                  {clause.severity}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/55">
                {clause.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
