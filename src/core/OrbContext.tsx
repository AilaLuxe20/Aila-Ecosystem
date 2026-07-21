"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface OrbContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  messages: Message[];
  addMessage: (role: "user" | "assistant", content: string) => void;
  clearMessages: () => void;
  isSpeaking: boolean;
  setSpeaking: (speaking: boolean) => void;
  isListening: boolean;
  setListening: (listening: boolean) => void;
}

const OrbContext = createContext<OrbContextType | undefined>(undefined);

export function OrbProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setSpeaking] = useState(false);
  const [isListening, setListening] = useState(false);

  const addMessage = useCallback(
    (role: "user" | "assistant", content: string) => {
      setMessages((prev) => [
        ...prev,
        { role, content, timestamp: new Date() },
      ]);
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <OrbContext.Provider
      value={{
        isOpen,
        setIsOpen,
        messages,
        addMessage,
        clearMessages,
        isSpeaking,
        setSpeaking,
        isListening,
        setListening,
      }}
    >
      {children}
    </OrbContext.Provider>
  );
}

export function useOrb() {
  const context = useContext(OrbContext);
  if (!context) {
    throw new Error("useOrb must be used within OrbProvider");
  }
  return context;
}
