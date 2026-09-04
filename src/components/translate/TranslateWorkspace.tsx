"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import ChatInterface from "@/components/ai/ChatInterface";
import type { TranslateEntryDto } from "@/core/translate/service";
import { workspaceFetch } from "@/components/workspace/api";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import {
  Button,
  Field,
  Input,
  Textarea,
  ToastProvider,
  useToast,
} from "@/components/ui";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "ar", label: "Arabic" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "hi", label: "Hindi" },
  { value: "sw", label: "Swahili" },
  { value: "other", label: "Other" },
] as const;

const KNOWN_LANGS = new Set<string>(
  LANGUAGE_OPTIONS.map((option) => option.value).filter((value) => value !== "other"),
);

const selectClassName = "w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm";

function splitLang(value: string): { preset: string; other: string } {
  return KNOWN_LANGS.has(value) ? { preset: value, other: "" } : { preset: "other", other: value };
}

function resolveLang(preset: string, other: string): string {
  return preset === "other" ? other.trim() : preset;
}

function TranslateWorkspaceInner(): React.JSX.Element {
  const { isSignedIn, getToken } = useAuth();
  const toast = useToast();
  const [translations, setTranslations] = useState<TranslateEntryDto[]>([]);
  const [selected, setSelected] = useState<TranslateEntryDto | null>(null);
  const [sourcePreset, setSourcePreset] = useState("en");
  const [targetPreset, setTargetPreset] = useState("es");
  const [sourceOther, setSourceOther] = useState("");
  const [targetOther, setTargetOther] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!isSignedIn) return;
    const response = (await workspaceFetch("/api/translate", { method: "GET" }, signal, getToken)) as {
      data?: { translations?: TranslateEntryDto[] };
    };
    const next = response.data?.translations ?? [];
    setTranslations(next);
    setSelected((current) => {
      if (!current) return current;
      return next.find((item) => item.id === current.id) ?? null;
    });
    setError(null);
    setLoading(false);
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void load(controller.signal).catch((caught: unknown) => {
        if (controller.signal.aborted) return;
        setError(caught);
        setLoading(false);
      });
    }, 0);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [isSignedIn, load]);

  function applyEntry(entry: TranslateEntryDto) {
    const source = splitLang(entry.sourceLang);
    const target = splitLang(entry.targetLang);
    setSelected(entry);
    setSourcePreset(source.preset);
    setSourceOther(source.other);
    setTargetPreset(target.preset);
    setTargetOther(target.other);
    setSourceText(entry.sourceText);
    setTranslatedText(entry.translatedText);
  }

  async function translate() {
    const sourceLang = resolveLang(sourcePreset, sourceOther);
    const targetLang = resolveLang(targetPreset, targetOther);
    if (!sourceText.trim()) return;
    setTranslating(true);
    try {
      const response = (await workspaceFetch(
        "/api/translate",
        { method: "POST", body: JSON.stringify({ sourceLang, targetLang, sourceText }) },
        undefined,
        getToken,
      )) as { data?: { translation?: TranslateEntryDto } };
      const translation = response.data?.translation;
      if (!translation) throw new Error("Aila did not return a translation.");
      setTranslatedText(translation.translatedText);
      setSelected(translation);
      toast.success("Translation ready");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to translate.");
    } finally {
      setTranslating(false);
    }
  }

  async function copyResult() {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      toast.success("Copied");
    } catch {
      toast.error("Unable to copy.");
    }
  }

  async function remove(id: string) {
    setSaving(true);
    try {
      await workspaceFetch(`/api/translate/${id}`, { method: "DELETE" }, undefined, getToken);
      if (selected?.id === id) {
        setSelected(null);
        setTranslatedText("");
      }
      toast.success("Deleted");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WorkspaceShell
      product="Translate"
      href="/products/translate"
      accent="sky"
      title="Translation workspace"
      description="Translate text with OpenRouter and keep a private history. This is AI translation, not a certified human translation."
      loading={loading}
      error={error}
      onRetry={() => void load()}
    >
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-white/40">History</p>
          {translations.length === 0 ? (
            <p className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/50">
              No translations yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {translations.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => applyEntry(entry)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left ${
                      selected?.id === entry.id
                        ? "border-sky-300/30 bg-sky-300/[0.08]"
                        : "border-white/8 bg-white/[0.03]"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                      {entry.sourceLang} → {entry.targetLang}
                    </p>
                    <p className="mt-1 truncate text-sm font-medium">{entry.sourceText}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Source language">
              <select
                className={selectClassName}
                value={sourcePreset}
                onChange={(event) => setSourcePreset(event.target.value)}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Target language">
              <select
                className={selectClassName}
                value={targetPreset}
                onChange={(event) => setTargetPreset(event.target.value)}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </Field>
          </div>
          {sourcePreset === "other" || targetPreset === "other" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {sourcePreset === "other" ? (
                <Field label="Source language name">
                  <Input value={sourceOther} onChange={(event) => setSourceOther(event.target.value)} placeholder="e.g. Yoruba" />
                </Field>
              ) : <span />}
              {targetPreset === "other" ? (
                <Field label="Target language name">
                  <Input value={targetOther} onChange={(event) => setTargetOther(event.target.value)} placeholder="e.g. Yoruba" />
                </Field>
              ) : <span />}
            </div>
          ) : null}
          <Field label="Source text">
            <Textarea value={sourceText} onChange={(event) => setSourceText(event.target.value)} rows={8} />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void translate()} loading={translating}>Translate</Button>
            <Button variant="secondary" onClick={() => void copyResult()} disabled={!translatedText}>Copy</Button>
            {selected ? (
              <Button variant="secondary" onClick={() => void remove(selected.id)} loading={saving}>Delete</Button>
            ) : null}
          </div>
          <Field label="Translation">
            <Textarea value={translatedText} onChange={(event) => setTranslatedText(event.target.value)} rows={8} />
          </Field>
          <p className="text-sm text-white/50">
            Translations are generated by Aila via OpenRouter. This is not a certified human translation.
          </p>
        </div>
      </div>
      <div className="mt-10">
        <ChatInterface
          mode="translate"
          showConversationHistory
          placeholder="Ask Aila Translate to help with this text..."
        />
      </div>
    </WorkspaceShell>
  );
}

export function TranslateWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <TranslateWorkspaceInner />
    </ToastProvider>
  );
}
