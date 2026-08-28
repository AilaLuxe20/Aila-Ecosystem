"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import type { ChatMessage, AilaMode } from "@/core/types";
import { iterateAilaSse, isAbortError } from "@/core/ai/streaming/parse";
import ChatMessages from "./ChatMessages";
import ChatInput, { type ChatAttachment } from "./ChatInput";

type ConversationSummary = {
  id: string;
  mode: string;
  title: string | null;
  updatedAt: string;
  messageCount: number;
};

type ChatInterfaceProps = {
  mode: AilaMode;
  initialMessages?: ChatMessage[];
  suggestions?: string[];
  placeholder?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  headerStatus?: "online" | "offline" | "running";
  headerStatusLabel?: string;
  containerClassName?: string;
  messagesHeight?: string;
  showSuggestions?: boolean;
  showHeader?: boolean;
  showConversationHistory?: boolean;
};

const defaultSuggestions: Record<AilaMode, string[]> = {
  intelligence: [
    "Build me a premium website",
    "I need a mobile app",
    "Add AI to my business",
    "Automate repetitive work",
  ],
  legal: [
    "What should I check before signing a contract?",
    "Explain a termination clause",
    "What are common contract risks?",
  ],
  business: [
    "I want to start a business",
    "How can I improve my operations?",
    "Where should I use AI?",
  ],
  automation: [
    "I have repetitive data entry",
    "How can I automate customer follow-ups?",
    "What processes can be automated?",
  ],
  ads: [
    "Help me plan an ad campaign",
    "How should I target my audience?",
    "Where should I allocate my budget?",
  ],
  apps: [
    "I have an app idea",
    "Web, iOS, or Android — what fits me?",
    "What should my MVP include?",
  ],
  calendar: [
    "Help me plan a booking workflow",
    "How can I reduce scheduling back-and-forth?",
    "What reminders should I set up?",
  ],
  commerce: [
    "I want to sell online",
    "How can I improve my checkout?",
    "How do I increase conversion?",
  ],
  flow: [
    "Map out my current process",
    "Where is my workflow breaking down?",
    "Help me connect two tools together",
  ],
  sites: [
    "I need a new website",
    "What pages should my site have?",
    "Help me plan my site structure",
  ],
};

const defaultPlaceholders: Record<AilaMode, string> = {
  intelligence: "Tell Aila what you want to build...",
  legal: "Ask AilaLegal about a contract, clause or legal document...",
  business: "Ask Aila Business AI...",
  automation: "Describe a process to automate...",
  ads: "Ask Aila Ads about a campaign...",
  apps: "Tell Aila Apps about your app idea...",
  calendar: "Ask Aila Calendar about scheduling...",
  commerce: "Ask Aila Commerce about your store...",
  flow: "Describe a workflow to connect...",
  sites: "Tell Aila Sites about your website...",
};

const defaultHeaders: Record<AilaMode, { title: string; subtitle: string }> = {
  intelligence: {
    title: "Aila Intelligence",
    subtitle: "Core ecosystem intelligence",
  },
  legal: {
    title: "AilaLegal Intelligence",
    subtitle: "Legal conversation workspace",
  },
  business: {
    title: "Aila Business AI",
    subtitle: "Business intelligence assistant",
  },
  automation: {
    title: "Aila Automation",
    subtitle: "Workflow discovery assistant",
  },
  ads: {
    title: "Aila Ads",
    subtitle: "Advertising intelligence assistant",
  },
  apps: {
    title: "Aila Apps",
    subtitle: "App planning assistant",
  },
  calendar: {
    title: "Aila Calendar",
    subtitle: "Scheduling assistant",
  },
  commerce: {
    title: "Aila Commerce",
    subtitle: "Commerce intelligence assistant",
  },
  flow: {
    title: "Aila Flow",
    subtitle: "Connected process assistant",
  },
  sites: {
    title: "Aila Sites",
    subtitle: "Website planning assistant",
  },
};

const defaultWelcomeMessages: Record<AilaMode, string> = {
  intelligence:
    "Welcome. I am Aila Intelligence, the intelligence layer of the Aila Ecosystem. Tell me what you want to build, improve or automate.",
  legal:
    "Welcome to AilaLegal AI. I can help you understand contracts, documents, clauses and potential review points. How can I assist you?",
  business:
    "Hello, I am Aila Business AI. How can I help your business today?",
  automation:
    "Hello, I am Aila Automation. Tell me about a process you want to automate.",
  ads: "Hello, I am Aila Ads. Tell me about the campaign you want to plan.",
  apps: "Hello, I am Aila Apps. Tell me about the app you want to build.",
  calendar:
    "Hello, I am Aila Calendar. Tell me about the scheduling workflow you need.",
  commerce:
    "Hello, I am Aila Commerce. Tell me about the store you want to build or improve.",
  flow: "Hello, I am Aila Flow. Tell me about the process you want to connect.",
  sites: "Hello, I am Aila Sites. Tell me about the website you want to build.",
};

function sessionStorageKey(mode: AilaMode) {
  return `aila-session-${mode}`;
}

function draftStorageKey(mode: AilaMode) {
  return `aila-chat-${mode}`;
}

function welcomeMessages(mode: AilaMode): ChatMessage[] {
  return [
    {
      role: "assistant",
      content: defaultWelcomeMessages[mode],
    },
  ];
}

function readStoredSessionId(mode: AilaMode): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = localStorage.getItem(sessionStorageKey(mode));
  return value && value.trim() ? value.trim() : null;
}

function writeStoredSessionId(mode: AilaMode, id: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!id) {
    localStorage.removeItem(sessionStorageKey(mode));
    return;
  }

  localStorage.setItem(sessionStorageKey(mode), id);
}

function clearDraftMessages(mode: AilaMode) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(draftStorageKey(mode));
}

function toClientMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const messages: ChatMessage[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const role = "role" in item ? item.role : null;
    const content = "content" in item ? item.content : null;

    if (
      (role === "user" || role === "assistant") &&
      typeof content === "string"
    ) {
      messages.push({ role, content });
    }
  }

  return messages;
}

function readDraftMessages(mode: AilaMode): ChatMessage[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = localStorage.getItem(draftStorageKey(mode));

  if (!saved) {
    return null;
  }

  try {
    const messages = toClientMessages(JSON.parse(saved));
    return messages.length > 0 ? messages : null;
  } catch {
    return null;
  }
}

function writeDraftMessages(mode: AilaMode, messages: ChatMessage[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(draftStorageKey(mode), JSON.stringify(messages));
}

function appendAssistantDelta(
  current: ChatMessage[],
  delta: string
): ChatMessage[] {
  const next = [...current];
  const last = next[next.length - 1];

  if (last?.role === "assistant") {
    next[next.length - 1] = {
      role: "assistant",
      content: last.content + delta,
    };
    return next;
  }

  next.push({ role: "assistant", content: delta });
  return next;
}

function jsonErrorMessage(
  data: unknown,
  status: number
): string {
  if (data && typeof data === "object") {
    const error = "error" in data ? data.error : null;

    if (error && typeof error === "object" && "message" in error) {
      const message = error.message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }

    if (typeof error === "string" && error.trim()) {
      return error;
    }
  }

  if (status === 401) {
    return "Sign in to continue chatting with Aila.";
  }

  if (status === 429) {
    return "Too many requests. Please try again shortly.";
  }

  return `Aila could not respond (${status}).`;
}

/**
 * Single premium chat component.
 *
 * Reusable across all Aila products. Products specify only a mode
 * and the component handles the rest — API calls, suggestions,
 * styling, and behaviour.
 *
 * For authenticated users, the database is the source of truth for
 * conversation history. localStorage only remembers the active
 * conversationId and temporary signed-out drafts.
 */
export default function ChatInterface({
  mode,
  initialMessages,
  suggestions,
  placeholder,
  headerTitle,
  headerSubtitle,
  headerStatus = "online",
  headerStatusLabel,
  containerClassName = "",
  messagesHeight = "h-[400px]",
  showSuggestions = true,
  showHeader = true,
  showConversationHistory = false,
}: ChatInterfaceProps) {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? welcomeMessages(mode)
  );

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [typing, setTyping] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationListStatus, setConversationListStatus] = useState<
    "idle" | "loading" | "ready" | "signed-out" | "error"
  >("idle");
  const [conversationLoadStatus, setConversationLoadStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [conversationLoadError, setConversationLoadError] = useState<
    string | null
  >(null);
  const [failedConversationId, setFailedConversationId] = useState<
    string | null
  >(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);

  const loadAbortRef = useRef<AbortController | null>(null);
  const listAbortRef = useRef<AbortController | null>(null);
  const sendAbortRef = useRef<AbortController | null>(null);
  const syncGenerationRef = useRef(0);
  const attachmentGenerationRef = useRef(0);
  const conversationIdRef = useRef<string | null>(null);
  const typingRef = useRef(false);
  const generatingRef = useRef(false);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    typingRef.current = typing;
  }, [typing]);

  useEffect(() => {
    generatingRef.current = generating;
  }, [generating]);

  const beginFreshConversation = useCallback(() => {
    syncGenerationRef.current += 1;
    loadAbortRef.current?.abort();
    loadAbortRef.current = null;
    sendAbortRef.current?.abort();
    sendAbortRef.current = null;

    generatingRef.current = false;
    typingRef.current = false;
    attachmentGenerationRef.current += 1;
    setGenerating(false);
    setTyping(false);
    setConversationId(null);
    conversationIdRef.current = null;
    setSendError(null);
    setConversationLoadError(null);
    setFailedConversationId(null);
    setConversationLoadStatus("idle");
    setAttachment(null);
    setMessages(welcomeMessages(mode));
    writeStoredSessionId(mode, null);
    clearDraftMessages(mode);
  }, [mode]);

  const refreshConversations = useCallback(async () => {
    if (!showConversationHistory) {
      return;
    }

    listAbortRef.current?.abort();
    const controller = new AbortController();
    listAbortRef.current = controller;

    setConversationListStatus("loading");

    try {
      const response = await fetch(
        `/api/ai/conversation/list?mode=${encodeURIComponent(mode)}`,
        { signal: controller.signal }
      );

      if (controller.signal.aborted) {
        return;
      }

      if (response.status === 401) {
        setConversationListStatus("signed-out");
        setConversations([]);
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load conversations.");
      }

      const data = await response.json();

      if (controller.signal.aborted) {
        return;
      }

      const listed = Array.isArray(data.conversations)
        ? data.conversations
        : [];

      setConversations(
        listed.filter(
          (conversation: ConversationSummary) => conversation.mode === mode
        )
      );
      setConversationListStatus("ready");
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setConversationListStatus("error");
    }
  }, [mode, showConversationHistory]);

  const loadConversation = useCallback(
    async (id: string) => {
      if (generatingRef.current || typingRef.current) {
        return;
      }

      const generation = ++syncGenerationRef.current;
      attachmentGenerationRef.current += 1;
      loadAbortRef.current?.abort();
      const controller = new AbortController();
      loadAbortRef.current = controller;

      setConversationLoadStatus("loading");
      setConversationLoadError(null);
      setFailedConversationId(null);
      setSendError(null);

      const isStale = () =>
        controller.signal.aborted || syncGenerationRef.current !== generation;

      try {
        const response = await fetch(
          `/api/ai/conversation?conversationId=${encodeURIComponent(id)}&mode=${encodeURIComponent(mode)}`,
          { signal: controller.signal }
        );

        if (isStale()) {
          return;
        }

        if (response.status === 401) {
          setConversationId(null);
          conversationIdRef.current = null;
          setConversationLoadStatus("idle");
          setConversationListStatus("signed-out");
          setConversations([]);
          setAttachment(null);
          return;
        }

        if (response.status === 404 || response.status === 409) {
          beginFreshConversation();
          void refreshConversations();
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load conversation.");
        }

        const data = await response.json();
        const conversation = data?.conversation;

        if (isStale()) {
          return;
        }

        if (
          !conversation ||
          typeof conversation.id !== "string" ||
          conversation.mode !== mode
        ) {
          beginFreshConversation();
          void refreshConversations();
          return;
        }

        const nextMessages = toClientMessages(conversation.messages);
        const attachments = Array.isArray(conversation.attachments)
          ? conversation.attachments
          : [];
        const firstAttachment = attachments[0];

        setConversationId(conversation.id);
        conversationIdRef.current = conversation.id;
        setMessages(
          nextMessages.length > 0 ? nextMessages : welcomeMessages(mode)
        );

        if (
          firstAttachment &&
          typeof firstAttachment.id === "string" &&
          typeof firstAttachment.fileName === "string"
        ) {
          setAttachment({
            status: "ready",
            documentId: firstAttachment.id,
            fileName: firstAttachment.fileName,
            fileSize:
              typeof firstAttachment.fileSize === "number"
                ? firstAttachment.fileSize
                : 0,
            truncated: Boolean(firstAttachment.truncated),
          });
        } else {
          setAttachment(null);
        }
        writeStoredSessionId(mode, conversation.id);
        clearDraftMessages(mode);
        setConversationLoadStatus("ready");
      } catch (error) {
        if (isStale()) {
          return;
        }

        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setConversationLoadStatus("error");
        setFailedConversationId(id);
        setConversationLoadError(
          error instanceof Error && error.message.trim()
            ? error.message
            : "Unable to load conversation."
        );
      }
    },
    [beginFreshConversation, mode, refreshConversations]
  );

  const loadConversationRef = useRef(loadConversation);
  useEffect(() => {
    loadConversationRef.current = loadConversation;
  }, [loadConversation]);

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    let cancelled = false;

    async function hydrate() {
      if (!isSignedIn) {
        syncGenerationRef.current += 1;
        loadAbortRef.current?.abort();
        loadAbortRef.current = null;
        sendAbortRef.current?.abort();
        sendAbortRef.current = null;

        generatingRef.current = false;
        typingRef.current = false;
        setGenerating(false);
        setTyping(false);
        setConversationId(null);
        conversationIdRef.current = null;
        setConversationLoadStatus("idle");
        setConversationLoadError(null);
        setFailedConversationId(null);
        setAttachment(null);

        const draft = readDraftMessages(mode);
        if (!cancelled) {
          setMessages(draft && draft.length > 0 ? draft : welcomeMessages(mode));
          setHasHydrated(true);
        }
        return;
      }

      // Authenticated: never treat cached messages as authoritative.
      clearDraftMessages(mode);

      const storedId = readStoredSessionId(mode);

      if (!storedId) {
        if (!cancelled) {
          setConversationId(null);
          conversationIdRef.current = null;
          setMessages(welcomeMessages(mode));
          setConversationLoadStatus("idle");
          setHasHydrated(true);
        }
        return;
      }

      if (!cancelled) {
        setHasHydrated(true);
        await loadConversationRef.current(storedId);
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
      syncGenerationRef.current += 1;
      loadAbortRef.current?.abort();
      listAbortRef.current?.abort();
      sendAbortRef.current?.abort();
    };
  }, [isAuthLoaded, isSignedIn, mode]);

  useEffect(() => {
    queueMicrotask(() => void refreshConversations());
  }, [refreshConversations]);

  // Signed-out draft continuity only — never used as source of truth when signed in.
  useEffect(() => {
    if (!hasHydrated || !isAuthLoaded || isSignedIn || conversationId) {
      return;
    }

    writeDraftMessages(mode, messages);
  }, [
    conversationId,
    hasHydrated,
    isAuthLoaded,
    isSignedIn,
    messages,
    mode,
  ]);

  const resolvedSuggestions = suggestions ?? defaultSuggestions[mode];
  const resolvedPlaceholder = placeholder ?? defaultPlaceholders[mode];
  const resolvedHeader = headerTitle
    ? { title: headerTitle, subtitle: headerSubtitle ?? "" }
    : defaultHeaders[mode];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing, generating, conversationLoadStatus]);

  function resetConversation() {
    beginFreshConversation();
  }

  async function deleteConversation(id: string) {
    if (generating || typing || conversationLoadStatus === "loading") {
      return;
    }

    const previous = conversations;
    const wasActive = conversationId === id;
    const previousMessages = messages;
    const previousConversationId = conversationId;

    setConversations((current) =>
      current.filter((conversation) => conversation.id !== id)
    );

    if (wasActive) {
      beginFreshConversation();
    }

    const generation = syncGenerationRef.current;

    try {
      const response = await fetch(
        `/api/ai/conversation?conversationId=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete conversation.");
      }

      const data = await response.json().catch(() => null);

      if (data?.deleted !== true) {
        throw new Error("Unable to delete conversation.");
      }
    } catch {
      setConversations(previous);

      if (wasActive && syncGenerationRef.current === generation) {
        setConversationId(previousConversationId);
        conversationIdRef.current = previousConversationId;
        setMessages(previousMessages);
        writeStoredSessionId(mode, previousConversationId);
        setConversationLoadStatus("ready");
      }

      setConversationListStatus("error");
    }
  }

  async function reconcileAbortedGeneration({
    conversationId: id,
    previousMessages,
    messageToSend,
    sendGeneration,
  }: {
    conversationId: string;
    previousMessages: ChatMessage[];
    messageToSend: string;
    sendGeneration: number;
  }) {
    const isCurrent = () => syncGenerationRef.current === sendGeneration;

    try {
      const response = await fetch(
        `/api/ai/conversation?conversationId=${encodeURIComponent(id)}&mode=${encodeURIComponent(mode)}`
      );

      if (!isCurrent()) {
        return;
      }

      if (!response.ok) {
        setMessages(previousMessages);
        setInput((current) => (current.trim() ? current : messageToSend));
        return;
      }

      const data = await response.json();
      const conversation = data?.conversation;

      if (!isCurrent()) {
        return;
      }

      if (
        !conversation ||
        typeof conversation.id !== "string" ||
        conversation.mode !== mode
      ) {
        setMessages(previousMessages);
        setInput((current) => (current.trim() ? current : messageToSend));
        return;
      }

      const nextMessages = toClientMessages(conversation.messages);
      const persistedNewTurn = nextMessages.length > previousMessages.length;

      setConversationId(conversation.id);
      conversationIdRef.current = conversation.id;
      setMessages(
        nextMessages.length > 0 ? nextMessages : welcomeMessages(mode)
      );
      writeStoredSessionId(mode, conversation.id);
      clearDraftMessages(mode);

      if (!persistedNewTurn) {
        setInput((current) => (current.trim() ? current : messageToSend));
      }
    } catch {
      if (!isCurrent()) {
        return;
      }

      setMessages(previousMessages);
      setInput((current) => (current.trim() ? current : messageToSend));
    }
  }

  async function sendMessage(customMessage?: string) {
    const messageToSend = (customMessage || input).trim();

    if (
      !messageToSend ||
      generating ||
      typing ||
      conversationLoadStatus === "loading" ||
      attachment?.status === "uploading" ||
      attachment?.status === "processing"
    ) {
      return;
    }

    const previousMessages = messages;
    const userMessage: ChatMessage = {
      role: "user",
      content: messageToSend,
    };

    const updatedMessages = [...messages, userMessage];

    // A send is a newer action than an in-flight load or delete rollback.
    const sendGeneration = ++syncGenerationRef.current;
    loadAbortRef.current?.abort();
    loadAbortRef.current = null;
    sendAbortRef.current?.abort();

    const controller = new AbortController();
    sendAbortRef.current = controller;

    const conversationIdAtSend = conversationId;
    const isCurrent = () => syncGenerationRef.current === sendGeneration;
    let receivedDone = false;

    setMessages(updatedMessages);
    setInput("");
    setSendError(null);
    generatingRef.current = true;
    typingRef.current = true;
    setGenerating(true);
    setTyping(true);

    const restoreAfterFailure = (errorMessage: string | null) => {
      if (!isCurrent()) {
        return;
      }

      generatingRef.current = false;
      typingRef.current = false;
      setGenerating(false);
      setTyping(false);
      setMessages(previousMessages);
      setInput((current) => (current.trim() ? current : messageToSend));

      if (errorMessage) {
        setSendError(errorMessage);
      }
    };

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream, application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          mode,
          conversationId,
          sessionId: conversationId,
          messages: updatedMessages,
          ...(mode === "intelligence" &&
          attachment?.status === "ready" &&
          attachment.documentId
            ? { documentIds: [attachment.documentId] }
            : {}),
        }),
      });

      if (!isCurrent()) {
        return;
      }

      const contentType = response.headers.get("content-type") ?? "";
      const isSse = contentType.includes("text/event-stream");

      if (!isSse) {
        const data = await response.json().catch(() => null);

        if (!response.ok || data?.success === false) {
          throw new Error(jsonErrorMessage(data, response.status));
        }

        if (
          !data ||
          typeof data.reply !== "string" ||
          data.reply.trim().length === 0
        ) {
          throw new Error("Aila returned an empty response.");
        }

        if (typeof data.conversationId === "string") {
          setConversationId(data.conversationId);
          conversationIdRef.current = data.conversationId;
          writeStoredSessionId(mode, data.conversationId);
          clearDraftMessages(mode);
        }

        generatingRef.current = false;
        typingRef.current = false;
        setFailedConversationId(null);
        setConversationLoadError(null);
        setGenerating(false);
        setTyping(false);
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: data.reply,
          },
        ]);
        void refreshConversations();
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error(jsonErrorMessage(null, response.status));
      }

      setTyping(false);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "" },
      ]);

      for await (const event of iterateAilaSse(
        response.body,
        controller.signal
      )) {
        if (!isCurrent()) {
          controller.abort();
          return;
        }

        if (event.type === "delta") {
          setMessages((current) =>
            appendAssistantDelta(current, event.content)
          );
          continue;
        }

        if (event.type === "error") {
          throw new Error(event.error.message);
        }

        receivedDone = true;
        generatingRef.current = false;
        typingRef.current = false;
        setTyping(false);
        setGenerating(false);
        setFailedConversationId(null);
        setConversationLoadError(null);
        setConversationId(event.conversationId);
        conversationIdRef.current = event.conversationId;
        writeStoredSessionId(mode, event.conversationId);
        clearDraftMessages(mode);
        setMessages((current) => {
          const next = [...current];
          const last = next[next.length - 1];

          if (last?.role === "assistant") {
            next[next.length - 1] = {
              role: "assistant",
              content: event.reply,
            };
            return next;
          }

          next.push({ role: "assistant", content: event.reply });
          return next;
        });
        void refreshConversations();
      }

      if (!isCurrent()) {
        return;
      }

      if (!receivedDone) {
        throw new Error("Aila Intelligence could not respond right now.");
      }
    } catch (error) {
      if (!isCurrent()) {
        return;
      }

      if (isAbortError(error) || controller.signal.aborted) {
        if (receivedDone) {
          generatingRef.current = false;
          typingRef.current = false;
          setGenerating(false);
          setTyping(false);
          return;
        }

        if (conversationIdAtSend) {
          generatingRef.current = false;
          typingRef.current = false;
          setGenerating(false);
          setTyping(false);
          void reconcileAbortedGeneration({
            conversationId: conversationIdAtSend,
            previousMessages,
            messageToSend,
            sendGeneration,
          });
          return;
        }

        restoreAfterFailure(null);
        void refreshConversations();
        return;
      }

      if (error instanceof TypeError) {
        restoreAfterFailure(
          "Aila Intelligence could not respond. Please try again."
        );
        return;
      }

      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "Aila Intelligence could not respond. Please try again.";

      restoreAfterFailure(message);
    } finally {
      if (sendAbortRef.current === controller) {
        sendAbortRef.current = null;
      }

      if (isCurrent()) {
        generatingRef.current = false;
        typingRef.current = false;
        setGenerating(false);
        setTyping(false);
      }
    }
  }

  function stopGeneration() {
    sendAbortRef.current?.abort();
  }

  async function attachFile(file: File) {
    if (mode !== "intelligence" || generatingRef.current) {
      return;
    }

    if (!isSignedIn) {
      setAttachment({
        status: "error",
        fileName: file.name,
        fileSize: file.size,
        message: "Sign in to attach files.",
      });
      return;
    }

    const generation = ++attachmentGenerationRef.current;
    setAttachment({
      status: "uploading",
      fileName: file.name,
      fileSize: file.size,
    });
    setSendError(null);

    const isCurrent = () => attachmentGenerationRef.current === generation;

    try {
      setAttachment({
        status: "processing",
        fileName: file.name,
        fileSize: file.size,
      });

      const formData = new FormData();
      formData.append("file", file);
      if (conversationIdRef.current) {
        formData.append("conversationId", conversationIdRef.current);
      }

      const response = await fetch("/api/ai/intelligence/document", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!isCurrent()) {
        return;
      }

      if (!response.ok || data?.success === false) {
        throw new Error(jsonErrorMessage(data, response.status));
      }

      const document = data?.document;
      if (!document || typeof document.id !== "string") {
        throw new Error("Aila could not attach this file.");
      }

      setAttachment({
        status: "ready",
        documentId: document.id,
        fileName:
          typeof document.fileName === "string" ? document.fileName : file.name,
        fileSize:
          typeof document.fileSize === "number" ? document.fileSize : file.size,
        truncated: Boolean(document.truncated),
      });
    } catch (error) {
      if (!isCurrent()) {
        return;
      }

      setAttachment({
        status: "error",
        fileName: file.name,
        fileSize: file.size,
        message:
          error instanceof Error && error.message.trim()
            ? error.message
            : "Aila could not attach this file.",
      });
    }
  }

  function removeAttachment() {
    const current = attachment;
    attachmentGenerationRef.current += 1;
    setAttachment(null);

    if (current?.status === "ready" && current.documentId) {
      void fetch(
        `/api/ai/intelligence/document?documentId=${encodeURIComponent(current.documentId)}`,
        { method: "DELETE" }
      );
    }
  }

  const isConversationLoading = conversationLoadStatus === "loading";
  const attachmentBusy =
    attachment?.status === "uploading" || attachment?.status === "processing";
  const inputDisabled =
    generating || typing || isConversationLoading || attachmentBusy;

  return (
    <div
      className={`relative overflow-hidden rounded-[36px] border border-white/[0.09] bg-[#080808]/90 shadow-[0_40px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl ${containerClassName}`}
    >
      {/* GLOW */}
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/[0.12] blur-[100px]" />

      <div
        className={`relative ${showConversationHistory ? "grid min-h-full lg:grid-cols-[250px_minmax(0,1fr)]" : ""}`}
      >
        {showConversationHistory && (
          <aside className="border-b border-white/[0.07] bg-black/20 p-4 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-white">Conversations</p>
                <p className="mt-1 text-[11px] text-neutral-600">
                  Saved intelligence threads
                </p>
              </div>

              <button
                type="button"
                onClick={resetConversation}
                disabled={inputDisabled}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-neutral-400 transition hover:border-cyan-300/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Start new conversation"
                title="Start new conversation"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 max-h-52 space-y-1 overflow-y-auto pr-1 lg:max-h-[500px]">
              {conversationListStatus === "loading" && (
                <p className="px-2 py-3 text-xs text-neutral-600">Loading...</p>
              )}

              {conversationListStatus === "signed-out" && (
                <p className="px-2 py-3 text-xs leading-5 text-neutral-600">
                  Sign in to save and reopen conversations.
                </p>
              )}

              {conversationListStatus === "error" && (
                <div className="space-y-2 px-2 py-3">
                  <p className="text-xs leading-5 text-red-300/70">
                    Conversation history is unavailable.
                  </p>
                  <button
                    type="button"
                    onClick={() => void refreshConversations()}
                    className="text-[11px] text-cyan-300/80 underline-offset-2 hover:underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {conversationListStatus === "ready" && conversations.length === 0 && (
                <p className="px-2 py-3 text-xs leading-5 text-neutral-600">
                  No saved conversations yet.
                </p>
              )}

              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex items-center gap-2 rounded-2xl border px-2 py-2 transition ${
                    conversation.id === conversationId
                      ? "border-cyan-300/20 bg-cyan-300/[0.06]"
                      : "border-transparent hover:border-white/[0.08] hover:bg-white/[0.03]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => void loadConversation(conversation.id)}
                    disabled={inputDisabled}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-not-allowed"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-cyan-300/60" />
                    <span className="min-w-0">
                      <span className="block truncate text-xs text-neutral-300">
                        {conversation.title ?? "New conversation"}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-neutral-700">
                        {conversation.messageCount} messages
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => void deleteConversation(conversation.id)}
                    disabled={inputDisabled}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-700 opacity-0 transition hover:bg-red-400/10 hover:text-red-300 group-hover:opacity-100 disabled:cursor-not-allowed"
                    aria-label="Delete conversation"
                    title="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </aside>
        )}

        <div className="min-w-0">
        {/* HEADER */}
        {showHeader && (
          <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05]">
                <div className="absolute h-6 w-6 rounded-full bg-cyan-300/[0.12] blur-lg" />

                <div className="relative h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.95)]" />
              </div>

              <div>
                <h2 className="text-sm font-medium text-white">
                  {resolvedHeader.title}
                </h2>

                <p className="mt-1 text-xs text-neutral-600">
                  {resolvedHeader.subtitle}
                </p>
              </div>
            </div>

            {headerStatus && (
              <div className="flex items-center gap-2 rounded-full border border-green-400/10 bg-green-400/[0.04] px-3 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />

                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
                </span>

                <span className="hidden text-[9px] uppercase tracking-[0.18em] text-green-300/60 sm:block">
                  {headerStatusLabel ?? headerStatus}
                </span>
              </div>
            )}
          </div>
        )}

        {isConversationLoading && (
          <div className="border-b border-white/[0.07] px-5 py-3 sm:px-6">
            <p className="text-xs text-neutral-500">Loading conversation...</p>
          </div>
        )}

        {/* MESSAGES */}
        <ChatMessages
          messages={messages}
          typing={typing}
          messagesHeight={messagesHeight}
          chatEndRef={chatEndRef}
        />

        {/* SUGGESTIONS */}
        {showSuggestions && resolvedSuggestions && (
          <div className="border-t border-white/[0.07] px-5 pt-5 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {resolvedSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void sendMessage(suggestion)}
                  disabled={inputDisabled}
                  className="rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2 text-xs text-neutral-500 transition hover:border-cyan-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {(sendError || conversationLoadError) && (
          <div className="space-y-2 px-5 pt-3 sm:px-6" role="alert">
            {conversationLoadError && (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs leading-5 text-red-300/80">
                  {conversationLoadError}
                </p>
                {failedConversationId && (
                  <button
                    type="button"
                    onClick={() => void loadConversation(failedConversationId)}
                    disabled={inputDisabled}
                    className="text-[11px] text-cyan-300/80 underline-offset-2 hover:underline disabled:opacity-40"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
            {sendError && (
              <p className="text-xs leading-5 text-red-300/80">{sendError}</p>
            )}
          </div>
        )}

        {/* INPUT */}
        <ChatInput
          input={input}
          placeholder={resolvedPlaceholder}
          typing={inputDisabled}
          generating={generating}
          attachment={mode === "intelligence" ? attachment : null}
          allowAttachments={mode === "intelligence"}
          onChange={setInput}
          onSend={() => void sendMessage()}
          onStop={stopGeneration}
          onAttachFile={(file) => void attachFile(file)}
          onRemoveAttachment={removeAttachment}
          onKeyDown={(event) => {
            if (generating) {
              return;
            }

            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendMessage();
            }
          }}
        />
        </div>
      </div>
    </div>
  );
}
