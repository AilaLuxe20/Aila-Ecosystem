"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DocumentUpload, { type LegalDocumentContext } from "./DocumentUpload";
import LegalSidebar from "./LegalSidebar";
import LegalTopbar from "./LegalTopbar";
import AssistantPanel, { type LegalMessage } from "./AssistantPanel";
import DocumentList from "./DocumentList";
import InsightCards from "./InsightCards";
import RecentDocuments from "./RecentDocuments";
import DocumentViewer from "./DocumentViewer";

const generalSuggestions = [
  "What should I check before signing a contract?",
  "Explain a termination clause",
  "What are common contract risks?",
];

const documentSuggestions = [
  "Summarize this document",
  "What are the biggest risks?",
  "Explain the termination terms",
  "What should I review carefully?",
  "Find missing clauses",
  "Rewrite this clause",
];

const starterMessages: LegalMessage[] = [
  {
    role: "assistant",
    content:
      "Welcome to AilaLegal AI. I can help you understand contracts, documents, clauses and potential review points. Upload a document or ask me a legal information question.",
  },
];

export default function AilaLegalDashboard() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<LegalMessage[]>(starterMessages);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [documentContext, setDocumentContext] =
    useState<LegalDocumentContext | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  function handleDocumentAnalyzed(document: LegalDocumentContext) {
    setDocumentContext(document);
    setMessages((previous) => [
      ...previous,
      {
        role: "assistant",
        content: `Document connected successfully: ${document.fileName}. I now have the document analysis in context. Ask me to summarize it, explain clauses, identify risks or highlight important review points.`,
      },
    ]);
  }

  function handleDocumentRemoved() {
    setDocumentContext(null);
  }

  async function sendMessage(customMessage?: string) {
    const messageToSend = (customMessage || input).trim();

    if (!messageToSend || loading) {
      return;
    }

    const userMessage: LegalMessage = {
      role: "user",
      content: messageToSend,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/legal-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          documentContext: documentContext
            ? {
                fileName: documentContext.fileName,
                fileType: documentContext.fileType,
                analysis: documentContext.analysis,
              }
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "AilaLegal could not respond.",
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            data?.message ||
            data?.reply ||
            "I am ready to help you review the legal information.",
        },
      ]);
    } catch (error) {
      console.error("AilaLegal Chat Error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "I could not connect to AilaLegal Intelligence right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const activeSuggestions = documentContext
    ? documentSuggestions
    : generalSuggestions;

  const documentMetrics = useMemo(
    () => ({
      documents: documentContext ? 1 : 0,
      riskScore: documentContext ? 72 : 18,
      clauses: documentContext ? 14 : 0,
      missingClauses: documentContext ? 3 : 0,
      highRisk: documentContext ? 2 : 0,
      mediumRisk: documentContext ? 5 : 0,
      lowRisk: documentContext ? 7 : 0,
      confidence: documentContext ? 91 : 0,
      status: documentContext ? "Review ready" : "Awaiting document",
    }),
    [documentContext],
  );

  return (
    <main className="enterprise-page min-h-screen text-white">
      <div className="flex min-h-screen">
        <LegalSidebar
          activeDocument={documentContext?.fileName}
          mobileOpen={sidebarOpen}
          onCloseAction={() => setSidebarOpen(false)}
        />

        <div className="min-w-0 flex-1 lg:pl-72">
          <LegalTopbar
            documentContext={documentContext}
            onMenuClickAction={() => setSidebarOpen(true)}
          />

          <div className="mx-auto w-full max-w-[1680px] px-4 pb-8 pt-24 sm:px-8 lg:pt-8">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_432px]"
            >
              <div className="min-w-0 space-y-12">
                <section className="enterprise-card rounded-[16px] p-6 md:p-8">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--aila-gold)]">
                        AilaLegal Command Center
                      </p>
                      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white md:text-5xl">
                        Enterprise legal intelligence, designed for review velocity.
                      </h1>
                      <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 md:text-base md:leading-7">
                        Upload contracts, inspect risk, summarize obligations,
                        and keep AilaLegal in context while your team moves
                        through matter work.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:min-w-[360px]">
                      {[
                        ["Risk", `${documentMetrics.riskScore}`],
                        ["Clauses", `${documentMetrics.clauses}`],
                        ["Confidence", `${documentMetrics.confidence}%`],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-[12px] border border-white/10 bg-white/[0.045] p-4"
                        >
                          <p className="text-xs text-white/45">{label}</p>
                          <p className="mt-2 text-2xl font-semibold text-white">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.65fr)]">
                  <DocumentUpload
                    documentAnalyzedAction={handleDocumentAnalyzed}
                    documentRemovedAction={handleDocumentRemoved}
                  />

                  <DocumentList documentContext={documentContext} />
                </div>

                <InsightCards
                  documentContext={documentContext}
                  metrics={documentMetrics}
                />

                <div className="grid gap-6 2xl:grid-cols-[minmax(0,0.9fr)_minmax(380px,0.65fr)]">
                  <DocumentViewer documentContext={documentContext} />
                  <RecentDocuments documentContext={documentContext} />
                </div>
              </div>

              <div className="min-w-0">
                <AnimatePresence mode="popLayout">
                  <AssistantPanel
                    key="assistant-panel"
                    activeSuggestions={activeSuggestions}
                    chatEndRef={chatEndRef}
                    clearChatAction={() => setMessages(starterMessages)}
                    documentContext={documentContext}
                    input={input}
                    loading={loading}
                    messages={messages}
                    setInputAction={setInput}
                    sendMessageAction={sendMessage}
                  />
                </AnimatePresence>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </main>
  );
}
