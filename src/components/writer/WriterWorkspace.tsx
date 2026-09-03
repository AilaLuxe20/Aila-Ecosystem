"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";

import ChatInterface from "@/components/ai/ChatInterface";
import type { WriterBookDetailDto, WriterBookSummaryDto } from "@/core/writer/types";
import type { WriterGenerateAction } from "@/core/writer/schema";
import { WRITER_BOOK_STATUSES, WRITER_CHAPTER_STATUSES } from "@/core/writer/schema";
import { workspaceFetch } from "@/components/workspace/api";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import {
  Button,
  EmptyState,
  Field,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  ToastProvider,
  useToast,
} from "@/components/ui";

const SELECT_CLASS = "w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm";

type StudioTab = "concept" | "bible" | "characters" | "outline" | "manuscript" | "revise";

function WriterWorkspaceInner(): React.JSX.Element {
  const { isSignedIn, getToken } = useAuth();
  const toast = useToast();
  const [books, setBooks] = useState<WriterBookSummaryDto[]>([]);
  const [book, setBook] = useState<WriterBookDetailDto | null>(null);
  const [tab, setTab] = useState<StudioTab>("concept");
  const [title, setTitle] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState<WriterGenerateAction | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const chapterSaveTimer = useRef<number | null>(null);

  const selectedCharacter = book?.characters.find((item) => item.id === characterId) ?? book?.characters[0] ?? null;
  const selectedChapter = book?.chapters.find((item) => item.id === chapterId) ?? book?.chapters[0] ?? null;

  const applyBook = useCallback((next: WriterBookDetailDto | null) => {
    selectedIdRef.current = next?.id ?? null;
    setBook(next);
    setTitle(next?.title ?? "");
    setCharacterId((current) => {
      if (!next) return null;
      if (current && next.characters.some((item) => item.id === current)) return current;
      return next.characters[0]?.id ?? null;
    });
    setChapterId((current) => {
      if (!next) return null;
      if (current && next.chapters.some((item) => item.id === current)) return current;
      return next.chapters[0]?.id ?? null;
    });
  }, []);

  const loadList = useCallback(async (signal?: AbortSignal) => {
    if (!isSignedIn) return;
    const response = (await workspaceFetch("/api/writer/books", { method: "GET" }, signal, getToken)) as {
      data?: { books?: WriterBookSummaryDto[] };
    };
    const next = response.data?.books ?? [];
    setBooks(next);
    return next;
  }, [getToken, isSignedIn]);

  const loadBook = useCallback(async (id: string, signal?: AbortSignal) => {
    const response = (await workspaceFetch(
      `/api/writer/books/${id}`,
      { method: "GET" },
      signal,
      getToken,
    )) as { data?: { book?: WriterBookDetailDto } };
    if (response.data?.book) applyBook(response.data.book);
  }, [applyBook, getToken]);

  const load = useCallback(async (signal?: AbortSignal) => {
    const next = await loadList(signal);
    const currentId = selectedIdRef.current;
    const selected = next?.find((item) => item.id === currentId) ?? next?.[0];
    if (selected) {
      await loadBook(selected.id, signal);
    } else {
      applyBook(null);
    }
    setError(null);
    setLoading(false);
  }, [applyBook, loadBook, loadList]);

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

  async function createBook() {
    setSaving(true);
    try {
      const response = (await workspaceFetch(
        "/api/writer/books",
        {
          method: "POST",
          body: JSON.stringify({
            title: newTitle.trim() || "Untitled book",
            premise: "",
            genre: "",
          }),
        },
        undefined,
        getToken,
      )) as { data?: { book?: WriterBookDetailDto } };
      setNewTitle("");
      toast.success("Book created");
      if (response.data?.book) {
        applyBook(response.data.book);
        setTab("concept");
      }
      await loadList();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to create the book.");
    } finally {
      setSaving(false);
    }
  }

  async function patchBook(body: Record<string, unknown>) {
    if (!book) return;
    setSaving(true);
    try {
      const response = (await workspaceFetch(
        `/api/writer/books/${book.id}`,
        { method: "PATCH", body: JSON.stringify(body) },
        undefined,
        getToken,
      )) as { data?: { book?: WriterBookDetailDto } };
      if (response.data?.book) applyBook(response.data.book);
      await loadList();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  }

  async function generate(action: WriterGenerateAction) {
    if (!book) return;
    setGenerating(action);
    try {
      const response = (await workspaceFetch(
        "/api/writer/generate",
        {
          method: "POST",
          body: JSON.stringify({
            action,
            bookId: book.id,
            chapterId: selectedChapter?.id,
            characterId: selectedCharacter?.id,
            instruction: instruction.trim() || undefined,
          }),
        },
        undefined,
        getToken,
      )) as { data?: { book?: WriterBookDetailDto; text?: string } };
      if (response.data?.book) applyBook(response.data.book);
      await loadList();
      toast.success(action === "continuity" ? "Continuity report saved" : "Aila updated this book");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to generate.");
    } finally {
      setGenerating(null);
    }
  }

  async function addCharacter() {
    if (!book) return;
    setSaving(true);
    try {
      const response = (await workspaceFetch(
        `/api/writer/books/${book.id}/characters`,
        { method: "POST", body: JSON.stringify({ name: "New character" }) },
        undefined,
        getToken,
      )) as { data?: { character?: { id: string } } };
      await loadBook(book.id);
      if (response.data?.character) setCharacterId(response.data.character.id);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to add a character.");
    } finally {
      setSaving(false);
    }
  }

  async function addChapter() {
    if (!book) return;
    setSaving(true);
    try {
      const response = (await workspaceFetch(
        `/api/writer/books/${book.id}/chapters`,
        { method: "POST", body: JSON.stringify({ title: `Chapter ${(book.chapters.length || 0) + 1}` }) },
        undefined,
        getToken,
      )) as { data?: { chapter?: { id: string } } };
      await loadBook(book.id);
      if (response.data?.chapter) setChapterId(response.data.chapter.id);
      setTab("manuscript");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to add a chapter.");
    } finally {
      setSaving(false);
    }
  }

  function queueChapterSave(chapter: { id: string }, body: Record<string, unknown>) {
    if (chapterSaveTimer.current) window.clearTimeout(chapterSaveTimer.current);
    chapterSaveTimer.current = window.setTimeout(() => {
      void workspaceFetch(
        `/api/writer/chapters/${chapter.id}`,
        { method: "PATCH", body: JSON.stringify(body) },
        undefined,
        getToken,
      ).then(async () => {
        if (book) await loadBook(book.id);
      }).catch((caught: unknown) => {
        toast.error(caught instanceof Error ? caught.message : "Unable to save the chapter.");
      });
    }, 900);
  }

  async function exportBook() {
    if (!book) return;
    try {
      const token = await getToken();
      const response = await fetch(`/api/writer/books/${book.id}/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Unable to export this book.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${book.title || "manuscript"}.md`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to export.");
    }
  }

  async function removeBook() {
    if (!book) return;
    setSaving(true);
    try {
      await workspaceFetch(`/api/writer/books/${book.id}`, { method: "DELETE" }, undefined, getToken);
      applyBook(null);
      toast.success("Book deleted");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete.");
    } finally {
      setSaving(false);
    }
  }

  const busy = Boolean(generating) || saving;

  return (
    <WorkspaceShell
      product="Writer"
      href="/products/writer"
      accent="lime"
      title="Book studio"
      description="Develop a book from idea to manuscript. Aila uses this project's bible, characters, and chapters — it will not invent a different novel."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={
        <>
          <Button variant="secondary" onClick={() => void exportBook()} disabled={!book}>
            Export markdown
          </Button>
          <Button leadingIcon={<Plus />} onClick={() => void createBook()} loading={saving}>
            New book
          </Button>
        </>
      }
    >
      {books.length === 0 ? (
        <EmptyState
          title="No books yet"
          description="Create a book project, then move from concept to characters, outline, and drafted scenes. Your work stays on this account."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Working title"
              />
              <Button onClick={() => void createBook()}>Create book</Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="space-y-3">
            <Field label="New book">
              <div className="flex gap-2">
                <Input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Title" />
              </div>
            </Field>
            <ul className="space-y-2">
              {books.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => void loadBook(item.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left ${
                      book?.id === item.id
                        ? "border-lime-300/30 bg-lime-300/[0.08]"
                        : "border-white/8 bg-white/[0.03]"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-white/40">{item.status}</p>
                    <p className="mt-1 truncate text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-[11px] text-white/40">
                      {item.chapterCount} chapters · {item.characterCount} characters
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {book ? (
            <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
                <Field label="Title">
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    onBlur={() => {
                      if (title.trim() && title !== book.title) void patchBook({ title: title.trim() });
                    }}
                  />
                </Field>
                <Field label="Status">
                  <select
                    className={SELECT_CLASS}
                    value={book.status}
                    onChange={(event) => void patchBook({ status: event.target.value })}
                  >
                    {WRITER_BOOK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Tabs value={tab} onValueChange={(value) => setTab(value as StudioTab)}>
                <TabsList variant="underline" className="flex w-full flex-nowrap gap-1 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch] sm:flex-wrap">
                  <TabsTrigger variant="underline" value="concept">Concept</TabsTrigger>
                  <TabsTrigger variant="underline" value="bible">Bible</TabsTrigger>
                  <TabsTrigger variant="underline" value="characters">Characters</TabsTrigger>
                  <TabsTrigger variant="underline" value="outline">Outline</TabsTrigger>
                  <TabsTrigger variant="underline" value="manuscript">Manuscript</TabsTrigger>
                  <TabsTrigger variant="underline" value="revise">Revise</TabsTrigger>
                </TabsList>

                <TabsContent value="concept" className="space-y-3">
                  <Field label="Premise">
                    <Textarea
                      rows={6}
                      value={book.premise}
                      onChange={(event) => applyBook({ ...book, premise: event.target.value })}
                      onBlur={() => void patchBook({ premise: book.premise })}
                    />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Genre">
                      <Input
                        value={book.genre}
                        onChange={(event) => applyBook({ ...book, genre: event.target.value })}
                        onBlur={() => void patchBook({ genre: book.genre })}
                      />
                    </Field>
                    <Field label="Tone">
                      <Input
                        value={book.tone}
                        onChange={(event) => applyBook({ ...book, tone: event.target.value })}
                        onBlur={() => void patchBook({ tone: book.tone })}
                      />
                    </Field>
                  </div>
                  <Field label="Themes">
                    <Textarea
                      rows={3}
                      value={book.themes}
                      onChange={(event) => applyBook({ ...book, themes: event.target.value })}
                      onBlur={() => void patchBook({ themes: book.themes })}
                    />
                  </Field>
                  <Field label="Audience">
                    <Input
                      value={book.audience}
                      onChange={(event) => applyBook({ ...book, audience: event.target.value })}
                      onBlur={() => void patchBook({ audience: book.audience })}
                    />
                  </Field>
                  <Button onClick={() => void generate("develop_concept")} loading={generating === "develop_concept"} disabled={busy}>
                    Develop concept with Aila
                  </Button>
                </TabsContent>

                <TabsContent value="bible" className="space-y-3">
                  <Field label="World / setting">
                    <Textarea
                      rows={6}
                      value={book.worldBible}
                      onChange={(event) => applyBook({ ...book, worldBible: event.target.value })}
                      onBlur={() => void patchBook({ worldBible: book.worldBible })}
                    />
                  </Field>
                  <Field label="Story bible">
                    <Textarea
                      rows={6}
                      value={book.storyBible}
                      onChange={(event) => applyBook({ ...book, storyBible: event.target.value })}
                      onBlur={() => void patchBook({ storyBible: book.storyBible })}
                    />
                  </Field>
                  <Field label="Plot">
                    <Textarea
                      rows={5}
                      value={book.plot}
                      onChange={(event) => applyBook({ ...book, plot: event.target.value })}
                      onBlur={() => void patchBook({ plot: book.plot })}
                    />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Locations">
                      <Textarea
                        rows={4}
                        value={book.locations}
                        onChange={(event) => applyBook({ ...book, locations: event.target.value })}
                        onBlur={() => void patchBook({ locations: book.locations })}
                      />
                    </Field>
                    <Field label="Timeline">
                      <Textarea
                        rows={4}
                        value={book.timeline}
                        onChange={(event) => applyBook({ ...book, timeline: event.target.value })}
                        onBlur={() => void patchBook({ timeline: book.timeline })}
                      />
                    </Field>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => void generate("develop_world")} loading={generating === "develop_world"} disabled={busy}>World</Button>
                    <Button variant="secondary" onClick={() => void generate("develop_bible")} loading={generating === "develop_bible"} disabled={busy}>Story bible</Button>
                    <Button variant="secondary" onClick={() => void generate("develop_plot")} loading={generating === "develop_plot"} disabled={busy}>Plot</Button>
                  </div>
                </TabsContent>

                <TabsContent value="characters" className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {book.characters.map((character) => (
                      <button
                        key={character.id}
                        type="button"
                        onClick={() => setCharacterId(character.id)}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          selectedCharacter?.id === character.id
                            ? "border-lime-300/40 bg-lime-300/10"
                            : "border-white/10"
                        }`}
                      >
                        {character.name}
                      </button>
                    ))}
                    <Button variant="secondary" onClick={() => void addCharacter()} loading={saving}>Add character</Button>
                  </div>
                  {selectedCharacter ? (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Name">
                          <Input
                            value={selectedCharacter.name}
                            onChange={(event) =>
                              applyBook({
                                ...book,
                                characters: book.characters.map((item) =>
                                  item.id === selectedCharacter.id ? { ...item, name: event.target.value } : item,
                                ),
                              })
                            }
                            onBlur={() =>
                              void workspaceFetch(
                                `/api/writer/characters/${selectedCharacter.id}`,
                                { method: "PATCH", body: JSON.stringify({ name: selectedCharacter.name }) },
                                undefined,
                                getToken,
                              )
                            }
                          />
                        </Field>
                        <Field label="Role">
                          <Input
                            value={selectedCharacter.role}
                            onChange={(event) =>
                              applyBook({
                                ...book,
                                characters: book.characters.map((item) =>
                                  item.id === selectedCharacter.id ? { ...item, role: event.target.value } : item,
                                ),
                              })
                            }
                            onBlur={() =>
                              void workspaceFetch(
                                `/api/writer/characters/${selectedCharacter.id}`,
                                { method: "PATCH", body: JSON.stringify({ role: selectedCharacter.role }) },
                                undefined,
                                getToken,
                              )
                            }
                          />
                        </Field>
                      </div>
                      <Field label="Bio">
                        <Textarea
                          rows={5}
                          value={selectedCharacter.bio}
                          onChange={(event) =>
                            applyBook({
                              ...book,
                              characters: book.characters.map((item) =>
                                item.id === selectedCharacter.id ? { ...item, bio: event.target.value } : item,
                              ),
                            })
                          }
                          onBlur={() =>
                            void workspaceFetch(
                              `/api/writer/characters/${selectedCharacter.id}`,
                              { method: "PATCH", body: JSON.stringify({ bio: selectedCharacter.bio }) },
                              undefined,
                              getToken,
                            )
                          }
                        />
                      </Field>
                      <Field label="Motivation">
                        <Textarea
                          rows={3}
                          value={selectedCharacter.motivation}
                          onChange={(event) =>
                            applyBook({
                              ...book,
                              characters: book.characters.map((item) =>
                                item.id === selectedCharacter.id
                                  ? { ...item, motivation: event.target.value }
                                  : item,
                              ),
                            })
                          }
                          onBlur={() =>
                            void workspaceFetch(
                              `/api/writer/characters/${selectedCharacter.id}`,
                              { method: "PATCH", body: JSON.stringify({ motivation: selectedCharacter.motivation }) },
                              undefined,
                              getToken,
                            )
                          }
                        />
                      </Field>
                      <Button onClick={() => void generate("develop_character")} loading={generating === "develop_character"} disabled={busy}>
                        Develop character with Aila
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-white/50">Add a character to keep names and motives consistent across chapters.</p>
                  )}
                </TabsContent>

                <TabsContent value="outline" className="space-y-3">
                  <Field label="Chapter outline">
                    <Textarea
                      rows={10}
                      value={book.outline}
                      onChange={(event) => applyBook({ ...book, outline: event.target.value })}
                      onBlur={() => void patchBook({ outline: book.outline })}
                    />
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => void generate("develop_outline")} loading={generating === "develop_outline"} disabled={busy}>
                      Build outline with Aila
                    </Button>
                    <Button variant="secondary" onClick={() => void addChapter()} loading={saving}>Add chapter</Button>
                  </div>
                  {book.chapters.length > 0 ? (
                    <ul className="space-y-2">
                      {book.chapters.map((chapter) => (
                        <li key={chapter.id} className="rounded-2xl border border-white/8 px-4 py-3 text-sm">
                          <p className="text-white/40">Chapter {chapter.position}</p>
                          <p className="font-medium">{chapter.title}</p>
                          <p className="mt-1 text-white/55">{chapter.summary || "No summary yet"}</p>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </TabsContent>

                <TabsContent value="manuscript" className="space-y-3">
                  {book.chapters.length === 0 ? (
                    <EmptyState
                      title="No chapters"
                      description="Build an outline or add a chapter, then generate a scene into the manuscript."
                      action={<Button onClick={() => void addChapter()}>Add chapter</Button>}
                    />
                  ) : (
                    <>
                      <Field label="Chapter">
                        <select
                          className={SELECT_CLASS}
                          value={selectedChapter?.id ?? ""}
                          onChange={(event) => setChapterId(event.target.value)}
                        >
                          {book.chapters.map((chapter) => (
                            <option key={chapter.id} value={chapter.id}>
                              {chapter.position}. {chapter.title}
                            </option>
                          ))}
                        </select>
                      </Field>
                      {selectedChapter ? (
                        <>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Chapter title">
                              <Input
                                value={selectedChapter.title}
                                onChange={(event) => {
                                  const next = {
                                    ...book,
                                    chapters: book.chapters.map((item) =>
                                      item.id === selectedChapter.id ? { ...item, title: event.target.value } : item,
                                    ),
                                  };
                                  applyBook(next);
                                  queueChapterSave(selectedChapter, { title: event.target.value });
                                }}
                              />
                            </Field>
                            <Field label="Chapter status">
                              <select
                                className={SELECT_CLASS}
                                value={selectedChapter.status}
                                onChange={(event) => {
                                  applyBook({
                                    ...book,
                                    chapters: book.chapters.map((item) =>
                                      item.id === selectedChapter.id ? { ...item, status: event.target.value } : item,
                                    ),
                                  });
                                  queueChapterSave(selectedChapter, { status: event.target.value });
                                }}
                              >
                                {WRITER_CHAPTER_STATUSES.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </Field>
                          </div>
                          <Field label="Summary">
                            <Textarea
                              rows={3}
                              value={selectedChapter.summary}
                              onChange={(event) => {
                                applyBook({
                                  ...book,
                                  chapters: book.chapters.map((item) =>
                                    item.id === selectedChapter.id ? { ...item, summary: event.target.value } : item,
                                  ),
                                });
                                queueChapterSave(selectedChapter, { summary: event.target.value });
                              }}
                            />
                          </Field>
                          <Field label="Scene plan">
                            <Textarea
                              rows={3}
                              value={selectedChapter.scenePlan}
                              onChange={(event) => {
                                applyBook({
                                  ...book,
                                  chapters: book.chapters.map((item) =>
                                    item.id === selectedChapter.id ? { ...item, scenePlan: event.target.value } : item,
                                  ),
                                });
                                queueChapterSave(selectedChapter, { scenePlan: event.target.value });
                              }}
                            />
                          </Field>
                          <Field label="Manuscript">
                            <Textarea
                              rows={16}
                              value={selectedChapter.body}
                              onChange={(event) => {
                                applyBook({
                                  ...book,
                                  chapters: book.chapters.map((item) =>
                                    item.id === selectedChapter.id ? { ...item, body: event.target.value } : item,
                                  ),
                                });
                                queueChapterSave(selectedChapter, { body: event.target.value });
                              }}
                            />
                          </Field>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" onClick={() => void generate("plan_chapter")} loading={generating === "plan_chapter"} disabled={busy}>
                              Plan scene
                            </Button>
                            <Button onClick={() => void generate("generate_scene")} loading={generating === "generate_scene"} disabled={busy}>
                              Write scene
                            </Button>
                          </div>
                        </>
                      ) : null}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="revise" className="space-y-3">
                  <Field label="Instruction for Aila">
                    <Input
                      value={instruction}
                      onChange={(event) => setInstruction(event.target.value)}
                      placeholder="Optional: tighter conflict, less exposition, keep the argument..."
                    />
                  </Field>
                  {book.continuityNotes ? (
                    <Field label="Continuity report">
                      <Textarea rows={6} value={book.continuityNotes} readOnly />
                    </Field>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["rewrite", "Rewrite"],
                        ["expand", "Expand"],
                        ["shorten", "Shorten"],
                        ["change_tone", "Tone"],
                        ["improve_dialogue", "Dialogue"],
                        ["improve_pacing", "Pacing"],
                        ["improve_description", "Description"],
                        ["grammar", "Grammar"],
                        ["continuity", "Continuity"],
                      ] as const
                    ).map(([action, label]) => (
                      <Button
                        key={action}
                        variant="secondary"
                        onClick={() => void generate(action)}
                        loading={generating === action}
                        disabled={busy || (action !== "continuity" && !selectedChapter)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="secondary" onClick={() => void removeBook()} loading={saving}>
                  Delete book
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
      <div className="mt-10">
        <ChatInterface
          mode="writer"
          showConversationHistory
          placeholder="Ask Aila about this book, or attach a voice note, image, or research file..."
        />
      </div>
    </WorkspaceShell>
  );
}

export function WriterWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <WriterWorkspaceInner />
    </ToastProvider>
  );
}
