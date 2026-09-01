"use client";

import Link from "next/link";
import ChatInterface from "@/components/ai/ChatInterface";
import DocumentUpload from "@/components/ai/DocumentUpload";
import { AilaLegalProvider } from "@/components/ai/AilaLegalContext";
import { LegalLibrary } from "@/components/legal/LegalLibrary";

const legalCapabilities = [
  {
    number: "01",
    title: "Document Analysis",
    description:
      "Upload a PDF or TXT contract. Aila extracts the text, analyzes it, and stores the result on your account.",
  },
  {
    number: "02",
    title: "Clause Intelligence",
    description:
      "Ask about clauses in the latest document you uploaded. Aila explains the wording that is actually in the file.",
  },
  {
    number: "03",
    title: "Risk Detection",
    description:
      "The analysis flags unusual obligations, dates, and review points. It does not decide whether a contract is enforceable.",
  },
  {
    number: "04",
    title: "Legal Questions",
    description:
      "Ask about contracts, agreements, and legal terminology in chat. This is not a case-law research database.",
  },
];

export function LegalExperience() {
  return (
    <AilaLegalProvider>
      <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="pointer-events-none absolute left-1/2 top-[-350px] h-[900px] w-[1100px] -translate-x-1/2 rounded-full bg-blue-500/[0.1] blur-[200px]" />
        <div className="pointer-events-none absolute right-[-300px] top-[700px] h-[600px] w-[600px] rounded-full bg-cyan-500/[0.07] blur-[180px]" />

        <section className="relative mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:min-h-[calc(100vh-8rem)]">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-blue-300/15 bg-blue-300/[0.04] px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
              </span>
              <span className="text-xs uppercase tracking-[0.24em] text-blue-200/70">
                Aila Legal
              </span>
            </div>

            <p className="mt-10 text-sm uppercase tracking-[0.3em] text-neutral-600">
              Aila Ecosystem / Aila Legal
            </p>

            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
              Legal intelligence.
              <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                Made clear.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-neutral-400">
              Upload a contract, store the analysis on your account, and ask
              follow-up questions in legal-mode chat.
            </p>

            <p className="mt-6 max-w-xl rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm leading-6 text-neutral-500">
              Aila Legal provides general information and document analysis. It
              is not a lawyer and is not a substitute for qualified legal advice.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="#document-upload"
                className="rounded-full bg-white px-8 py-4 font-semibold text-black transition duration-300 hover:scale-105"
              >
                Upload a Document
              </Link>
              <Link
                href="#legal-chat"
                className="rounded-full border border-white/[0.1] bg-white/[0.03] px-8 py-4 text-neutral-300 transition duration-300 hover:bg-white/[0.07]"
              >
                Talk to Aila Legal
              </Link>
            </div>
          </div>

          <div id="legal-chat" className="relative">
            <div className="pointer-events-none absolute inset-0 rounded-full bg-blue-500/[0.08] blur-[110px]" />
            <ChatInterface
              mode="legal"
              containerClassName="h-[600px]"
              messagesHeight="h-[400px]"
            />
          </div>
        </section>

        <section id="document-upload" className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300/60">
              Document Intelligence
            </p>
            <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Upload a legal document.
              <span className="block text-neutral-600">Get an AI-powered analysis.</span>
            </h2>
          </div>
          <div className="mt-16">
            <DocumentUpload />
          </div>
        </section>

        <section id="legal-library" className="relative mx-auto max-w-7xl px-6 pb-24">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300/60">Your library</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Stored analyses</h2>
          <p className="mt-3 max-w-2xl text-neutral-400">
            Documents you upload stay on your account. Open one to reread the
            analysis without uploading again.
          </p>
          <div className="mt-10">
            <LegalLibrary />
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 py-28">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300/60">
                Legal Technology
              </p>
              <h2 className="mt-6 max-w-lg text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
                Analysis, not advice.
                <span className="block text-neutral-600">Built for clarity.</span>
              </h2>
              <p className="mt-7 max-w-md leading-8 text-neutral-500">
                Aila Legal explains documents you upload and answers questions
                from that text. It does not file documents, represent you, or
                replace a qualified lawyer.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {legalCapabilities.map((capability) => (
                <div
                  key={capability.title}
                  className="group rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-1 hover:border-blue-300/20 hover:bg-blue-300/[0.035]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-700">{capability.number}</span>
                    <div className="h-2 w-2 rounded-full border border-neutral-700 transition group-hover:border-blue-300 group-hover:bg-blue-300 group-hover:shadow-[0_0_15px_rgba(147,197,253,0.8)]" />
                  </div>
                  <h3 className="mt-12 text-xl font-medium">{capability.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-neutral-500">
                    {capability.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl px-6 py-32">
          <div className="relative overflow-hidden rounded-[40px] border border-white/[0.09] bg-white/[0.025] px-6 py-20 text-center backdrop-blur-2xl sm:px-12">
            <div className="pointer-events-none absolute left-1/2 top-[-300px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/[0.1] blur-[170px]" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-300/60">
                Begin with Aila Legal
              </p>
              <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
                Need document clarity?
                <span className="block text-neutral-600">Start with a file you own.</span>
              </h2>
              <p className="mx-auto mt-7 max-w-xl leading-8 text-neutral-400">
                Upload a PDF or TXT document, then ask about the clauses that
                were extracted. For decisions that affect your rights, speak with
                a qualified lawyer.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  href="#document-upload"
                  className="inline-flex rounded-full bg-white px-10 py-4 font-semibold text-black transition hover:scale-105"
                >
                  Upload a Document
                </Link>
                <Link
                  href="/#start-project"
                  className="inline-flex rounded-full border border-white/10 bg-white/5 px-10 py-4 font-semibold text-white transition hover:bg-white/10"
                >
                  Start a Project
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </AilaLegalProvider>
  );
}
