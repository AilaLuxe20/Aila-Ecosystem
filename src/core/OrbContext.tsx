"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface WorkspaceSession {
  productId: string;
  workspace: string;
}

interface OrbContextType {
  // UI
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;

  // Conversation
  messages: Message[];
  addMessage: (
    role: "user" | "assistant",
    content: string
  ) => void;
  clearMessages: () => void;

  conversationId: string | null;
  setConversationId: (id: string | null) => void;

  // Loading
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Errors
  error: string | null;
  setError: (error: string | null) => void;

  // Voice
  isSpeaking: boolean;
  setSpeaking: (value: boolean) => void;

  isListening: boolean;
  setListening: (value: boolean) => void;

  // Platform
  activeProduct: string;
  setActiveProduct: (product: string) => void;

  activeWorkspace: string;
  setActiveWorkspace: (workspace: string) => void;

  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;

  session: WorkspaceSession | null;
  setSession: (
    session: WorkspaceSession | null
  ) => void;
}

const OrbContext = createContext<
  OrbContextType | undefined
>(undefined);

export function OrbProvider({
  children,
}: {
  children: ReactNode;
}) {
  // UI
  const [isOpen, setIsOpen] = useState(false);

  // Conversation
  const [messages, setMessages] = useState<Message[]>([]);

  const [conversationId, setConversationId] =
    useState<string | null>(null);

  // Status
  const [isLoading, setLoading] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // Voice
  const [isSpeaking, setSpeaking] = useState(false);

  const [isListening, setListening] =
    useState(false);

  // Platform
  const [activeProduct, setActiveProduct] =
    useState("intelligence");

  const [activeWorkspace, setActiveWorkspace] =
    useState("dashboard");

  const [theme, setTheme] = useState<
    "light" | "dark"
  >("dark");

  const [session, setSession] =
    useState<WorkspaceSession | null>(null);

  const addMessage = useCallback(
    (
      role: "user" | "assistant",
      content: string
    ) => {
      setMessages((previous) => [
        ...previous,
        {
          role,
          content,
          timestamp: new Date(),
        },
      ]);
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  return (
    <OrbContext.Provider
      value={{
        // UI
        isOpen,
        setIsOpen,

        // Conversation
        messages,
        addMessage,
        clearMessages,

        conversationId,
        setConversationId,

        // Loading
        isLoading,
        setLoading,

        // Errors
        error,
        setError,

        // Voice
        isSpeaking,
        setSpeaking,

        isListening,
        setListening,

        // Platform
        activeProduct,
        setActiveProduct,

        activeWorkspace,
        setActiveWorkspace,

        theme,
        setTheme,

        session,
        setSession,
      }}
    >
      {children}
    </OrbContext.Provider>
  );
}

export function useOrb() {
  const context = useContext(OrbContext);

  if (!context) {
    throw new Error(
      "useOrb must be used inside OrbProvider."
    );
  }

  return context;
}