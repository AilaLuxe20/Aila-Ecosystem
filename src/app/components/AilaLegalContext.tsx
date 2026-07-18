"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type LegalDocumentContext = {
  fileName: string;
  fileType: string;
  analysis: string;
  legalDocumentId: string | null;
};

type UploadState = "idle" | "uploading" | "ready" | "error";

interface AilaLegalContextType {
  documentContext: LegalDocumentContext | null;
  setDocumentContext: (ctx: LegalDocumentContext | null) => void;
  clearDocument: () => void;

  uploadState: UploadState;
  setUploadState: (state: UploadState) => void;

  uploadError: string | null;
  setUploadError: (error: string | null) => void;

  conversationId: string | null;
  setConversationId: (id: string | null) => void;

  hasDocument: boolean;
  isAnalyzing: boolean;
}

const AilaLegalContext = createContext<AilaLegalContextType | undefined>(
  undefined
);

export function AilaLegalProvider({ children }: { children: ReactNode }) {
  const [documentContext, setDocumentContext] =
    useState<LegalDocumentContext | null>(null);

  const [uploadState, setUploadState] = useState<UploadState>("idle");

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const clearDocument = useCallback(() => {
    setDocumentContext(null);
    setUploadState("idle");
    setUploadError(null);
    setConversationId(null);
  }, []);

  const hasDocument = documentContext !== null && uploadState === "ready";
  const isAnalyzing = uploadState === "uploading";

  return (
    <AilaLegalContext.Provider
      value={{
        documentContext,
        setDocumentContext,
        clearDocument,
        uploadState,
        setUploadState,
        uploadError,
        setUploadError,
        conversationId,
        setConversationId,
        hasDocument,
        isAnalyzing,
      }}
    >
      {children}
    </AilaLegalContext.Provider>
  );
}

export function useAilaLegal() {
  const context = useContext(AilaLegalContext);
  if (!context) {
    throw new Error("useAilaLegal must be used inside AilaLegalProvider");
  }
  return context;
}