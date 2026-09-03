"use client";

import type { ChangeEvent, KeyboardEvent } from "react";
import { useRef, useState } from "react";
import { Loader2, Mic, Paperclip, Square, X } from "lucide-react";
import { CHAT_ATTACHMENT_ACCEPT } from "@/core/ai/attachments";
import { formatBytes } from "@/lib/utils/format";

export type ChatAttachment = {
  status: "uploading" | "processing" | "ready" | "error";
  fileName: string;
  fileSize: number;
  documentId?: string;
  truncated?: boolean;
  message?: string;
};

type ChatInputProps = {
  input: string;
  placeholder: string;
  typing: boolean;
  generating?: boolean;
  attachment?: ChatAttachment | null;
  allowAttachments?: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  onAttachFile?: (file: File) => void;
  onRemoveAttachment?: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
};

const ACCEPT = CHAT_ATTACHMENT_ACCEPT;

function attachmentLabel(attachment: ChatAttachment): string {
  if (attachment.status === "uploading") {
    return "Uploading";
  }
  if (attachment.status === "processing") {
    return "Reading file";
  }
  if (attachment.status === "error") {
    return attachment.message || "Could not attach file";
  }
  if (attachment.truncated) {
    return "Attached — only the first 100,000 characters were kept";
  }
  return "Attached";
}

/**
 * The textarea + send button at the bottom of the chat.
 *
 * The parent is responsible for handling the Enter key
 * (without Shift) and calling `onSend`. While a reply is
 * streaming, Send is replaced by Stop.
 */
export default function ChatInput({
  input,
  placeholder,
  typing,
  generating = false,
  attachment = null,
  allowAttachments = false,
  onChange,
  onSend,
  onStop,
  onAttachFile,
  onRemoveAttachment,
  onKeyDown,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);
  const attachmentBusy =
    attachment?.status === "uploading" || attachment?.status === "processing";

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      onAttachFile?.(file);
    }
  }

  async function toggleRecording() {
    if (recording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    setRecordError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRecordError("This browser cannot record audio.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
        mediaRecorderRef.current = null;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        if (blob.size > 0) {
          const extension = blob.type.includes("ogg") ? "ogg" : "webm";
          onAttachFile?.(new File([blob], `voice-note.${extension}`, { type: blob.type || "audio/webm" }));
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setRecordError("Microphone permission is required to record a voice note.");
    }
  }

  return (
    <div className="p-5 sm:p-6">
      {attachment && (
        <div
          className={`mb-3 flex items-start gap-3 rounded-2xl border px-3 py-2.5 ${
            attachment.status === "error"
              ? "border-red-400/20 bg-red-400/[0.04]"
              : "border-white/[0.08] bg-white/[0.03]"
          }`}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-white">{attachment.fileName}</p>
            <p className="mt-0.5 text-[11px] text-neutral-500">
              {formatBytes(attachment.fileSize)} · {attachmentLabel(attachment)}
            </p>
          </div>
          {attachmentBusy ? (
            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-cyan-300/80" />
          ) : (
            <button
              type="button"
              onClick={onRemoveAttachment}
              disabled={generating}
              aria-label="Remove attachment"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {recordError ? (
        <p className="mb-3 text-[11px] text-red-300/80">{recordError}</p>
      ) : null}

      <div className="flex gap-2 rounded-2xl border border-white/[0.09] bg-black/40 p-2 transition focus-within:border-cyan-300/25">
        {allowAttachments && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              onChange={handleFileChange}
              className="hidden"
              aria-label="Attach a file"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={typing || recording}
              aria-label="Attach a file"
              title="Attach a document, image, or audio note"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => void toggleRecording()}
              disabled={typing}
              aria-label={recording ? "Stop recording" : "Record a voice note"}
              title={recording ? "Stop recording" : "Record a voice note"}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-40 ${
                recording
                  ? "bg-red-400/20 text-red-200"
                  : "text-neutral-500 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </>
        )}

        <textarea
          value={input}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={generating}
          className="min-w-0 flex-1 resize-none bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
        />

        {generating ? (
          <button
            type="button"
            onClick={onStop}
            className="rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.07]"
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={onSend}
            disabled={(!input.trim() && attachment?.status !== "ready") || typing || attachmentBusy}
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-30"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
