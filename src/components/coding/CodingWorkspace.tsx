"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";

import ChatInterface from "@/components/ai/ChatInterface";
import type { CodingFileDto, CodingProjectDto } from "@/core/coding/service";
import { CODING_LANGUAGES } from "@/core/coding/schema";
import { workspaceFetch } from "@/components/workspace/api";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Field,
  Input,
  Textarea,
  ToastProvider,
  useToast,
} from "@/components/ui";

const LANGUAGE_LABELS: Record<(typeof CODING_LANGUAGES)[number], string> = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  python: "Python",
  go: "Go",
  rust: "Rust",
  java: "Java",
  csharp: "C#",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  markdown: "Markdown",
  sql: "SQL",
  other: "Other",
};

function LanguageSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}): React.JSX.Element {
  return (
    <select
      className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {CODING_LANGUAGES.map((language) => (
        <option key={language} value={language}>
          {LANGUAGE_LABELS[language]}
        </option>
      ))}
    </select>
  );
}

function CodingWorkspaceInner(): React.JSX.Element {
  const { isSignedIn, getToken } = useAuth();
  const toast = useToast();
  const [projects, setProjects] = useState<CodingProjectDto[]>([]);
  const [selected, setSelected] = useState<CodingProjectDto | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<(typeof CODING_LANGUAGES)[number]>("typescript");
  const [files, setFiles] = useState<CodingFileDto[]>([]);
  const [newFilePath, setNewFilePath] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [open, setOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createLanguage, setCreateLanguage] = useState<(typeof CODING_LANGUAGES)[number]>("typescript");
  const [createDescription, setCreateDescription] = useState("");
  const selectedRef = useRef<CodingProjectDto | null>(null);
  const selectedFileIdRef = useRef<string | null>(null);

  function applyProject(project: CodingProjectDto | null) {
    const previousId = selectedRef.current?.id;
    selectedRef.current = project;
    setSelected(project);
    if (!project) {
      setName("");
      setDescription("");
      setLanguage("typescript");
      setFiles([]);
      selectedFileIdRef.current = null;
      setSelectedFileId(null);
      setExplanation("");
      return;
    }
    setName(project.name);
    setDescription(project.description ?? "");
    setLanguage(project.language as (typeof CODING_LANGUAGES)[number]);
    setFiles(project.files);
    const keepFileId =
      previousId === project.id &&
      selectedFileIdRef.current &&
      project.files.some((file) => file.id === selectedFileIdRef.current)
        ? selectedFileIdRef.current
        : project.files[0]?.id ?? null;
    selectedFileIdRef.current = keepFileId;
    setSelectedFileId(keepFileId);
    if (previousId !== project.id) {
      setExplanation("");
    }
  }

  const selectedFile = files.find((file) => file.id === selectedFileId) ?? files[0] ?? null;

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!isSignedIn) return;
      const response = (await workspaceFetch("/api/coding", { method: "GET" }, signal, getToken)) as {
        data?: { projects?: CodingProjectDto[] };
      };
      const next = response.data?.projects ?? [];
      const current = selectedRef.current;
      setProjects(next);
      applyProject(
        !current ? next[0] ?? null : next.find((item) => item.id === current.id) ?? next[0] ?? null,
      );
      setError(null);
      setLoading(false);
    },
    [getToken, isSignedIn],
  );

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

  function updateSelectedFile(patch: Partial<CodingFileDto>) {
    if (!selectedFile) return;
    setFiles((current) =>
      current.map((file) => (file.id === selectedFile.id ? { ...file, ...patch } : file)),
    );
  }

  async function createProject() {
    if (!createName.trim()) return;
    setSaving(true);
    try {
      const response = (await workspaceFetch(
        "/api/coding",
        {
          method: "POST",
          body: JSON.stringify({
            name: createName.trim(),
            language: createLanguage,
            description: createDescription.trim() || null,
          }),
        },
        undefined,
        getToken,
      )) as { data?: { project?: CodingProjectDto } };
      toast.success("Project created");
      setOpen(false);
      setCreateName("");
      setCreateDescription("");
      await load();
      if (response.data?.project) applyProject(response.data.project);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to create the project.");
    } finally {
      setSaving(false);
    }
  }

  async function save(nextFiles = files) {
    if (!selected) return false;
    setSaving(true);
    try {
      const response = (await workspaceFetch(
        `/api/coding/${selected.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name,
            description: description || null,
            language,
            files: nextFiles,
          }),
        },
        undefined,
        getToken,
      )) as { data?: { project?: CodingProjectDto } };
      toast.success("Saved");
      await load();
      if (response.data?.project) applyProject(response.data.project);
      return true;
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function addFile() {
    if (!selected || !newFilePath.trim()) return;
    const file: CodingFileDto = {
      id: crypto.randomUUID(),
      path: newFilePath.trim(),
      language,
      content: "",
    };
    const nextFiles = [...files, file];
    setFiles(nextFiles);
    setNewFilePath("");
    selectedFileIdRef.current = file.id;
    setSelectedFileId(file.id);
    await save(nextFiles);
  }

  async function explain() {
    if (!selected || !selectedFile) return;
    setExplaining(true);
    try {
      const saved = await save();
      if (!saved) return;
      const response = (await workspaceFetch(
        `/api/coding/${selected.id}/explain`,
        { method: "POST", body: JSON.stringify({ fileId: selectedFile.id }) },
        undefined,
        getToken,
      )) as { data?: { text?: string } };
      if (!response.data?.text) throw new Error("Aila did not return an explanation.");
      setExplanation(response.data.text);
      toast.success("Explanation ready");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to explain this file.");
    } finally {
      setExplaining(false);
    }
  }

  async function remove() {
    if (!selected) return;
    setSaving(true);
    try {
      await workspaceFetch(`/api/coding/${selected.id}`, { method: "DELETE" }, undefined, getToken);
      applyProject(null);
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
      product="Coding"
      href="/products/coding"
      accent="lime"
      title="Coding workspace"
      description="Create a project, edit files, save them to your account, and ask Aila to explain a file."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={
        <Button leadingIcon={<Plus />} onClick={() => setOpen(true)}>
          New project
        </Button>
      }
    >
      {projects.length === 0 ? (
        <EmptyState
          title="No projects"
          description="Create a project to get a starter file. Edit it, save, then ask Aila to explain the file."
          action={<Button onClick={() => setOpen(true)}>Create project</Button>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[220px_200px_minmax(0,1fr)]">
          <ul className="space-y-2">
            {projects.map((project) => (
              <li key={project.id}>
                <button
                  type="button"
                  onClick={() => applyProject(project)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left ${
                    selected?.id === project.id
                      ? "border-lime-300/30 bg-lime-300/[0.08]"
                      : "border-white/8 bg-white/[0.03]"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-white/40">{project.language}</p>
                  <p className="mt-1 truncate text-sm font-medium">{project.name}</p>
                </button>
              </li>
            ))}
          </ul>
          <div className="space-y-3">
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.id}>
                  <button
                    type="button"
                    onClick={() => {
                      selectedFileIdRef.current = file.id;
                      setSelectedFileId(file.id);
                    }}
                    className={`w-full rounded-2xl border px-3 py-2 text-left ${
                      selectedFile?.id === file.id
                        ? "border-lime-300/30 bg-lime-300/[0.08]"
                        : "border-white/8 bg-white/[0.03]"
                    }`}
                  >
                    <p className="truncate font-mono text-xs">{file.path}</p>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Input
                value={newFilePath}
                onChange={(event) => setNewFilePath(event.target.value)}
                placeholder="src/util.ts"
              />
              <Button variant="secondary" onClick={() => void addFile()} loading={saving}>
                Add
              </Button>
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Project name">
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </Field>
              <Field label="Project language">
                <LanguageSelect value={language} onChange={(value) => setLanguage(value as typeof language)} />
              </Field>
            </div>
            <Field label="Description">
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional"
              />
            </Field>
            {selectedFile ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="File path">
                    <Input
                      value={selectedFile.path}
                      onChange={(event) => updateSelectedFile({ path: event.target.value })}
                    />
                  </Field>
                  <Field label="File language">
                    <LanguageSelect
                      value={selectedFile.language}
                      onChange={(value) => updateSelectedFile({ language: value })}
                    />
                  </Field>
                </div>
                <Field label="Code">
                  <Textarea
                    className="font-mono text-sm"
                    value={selectedFile.content}
                    onChange={(event) => updateSelectedFile({ content: event.target.value })}
                    rows={16}
                  />
                </Field>
              </>
            ) : null}
            {explanation ? (
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm whitespace-pre-wrap text-white/80">
                {explanation}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void save()} loading={saving}>
                Save
              </Button>
              <Button variant="secondary" onClick={() => void explain()} loading={explaining}>
                Explain this file
              </Button>
              <Button variant="secondary" onClick={() => void remove()} loading={saving}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-10">
        <ChatInterface
          mode="coding"
          showConversationHistory
          placeholder="Ask Aila Coding to help with this file..."
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>Aila creates one starter file in the language you choose.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <Field label="Name">
              <Input value={createName} onChange={(event) => setCreateName(event.target.value)} />
            </Field>
            <Field label="Language">
              <LanguageSelect
                value={createLanguage}
                onChange={(value) => setCreateLanguage(value as typeof createLanguage)}
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={createDescription}
                onChange={(event) => setCreateDescription(event.target.value)}
                placeholder="Optional"
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => void createProject()} loading={saving}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspaceShell>
  );
}

export function CodingWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <CodingWorkspaceInner />
    </ToastProvider>
  );
}
