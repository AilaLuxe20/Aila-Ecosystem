"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";

import ChatInterface from "@/components/ai/ChatInterface";
import type { CareerApplicationDto, CareerResumeDto } from "@/core/career/service";
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

function toDateInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoOrNull(value: string): string | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function CareerWorkspaceInner(): React.JSX.Element {
  const { isSignedIn, getToken } = useAuth();
  const toast = useToast();
  const [resumes, setResumes] = useState<CareerResumeDto[]>([]);
  const [applications, setApplications] = useState<CareerApplicationDto[]>([]);
  const [selectedResume, setSelectedResume] = useState<CareerResumeDto | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<CareerApplicationDto | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [resumeStatus, setResumeStatus] = useState("draft");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("draft");
  const [notes, setNotes] = useState("");
  const [appliedAt, setAppliedAt] = useState("");
  const [interviewAt, setInterviewAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const selectedResumeRef = useRef<CareerResumeDto | null>(null);
  const selectedApplicationRef = useRef<CareerApplicationDto | null>(null);

  function applyResume(resume: CareerResumeDto | null) {
    selectedResumeRef.current = resume;
    setSelectedResume(resume);
    setTitle(resume?.title ?? "");
    setSummary(resume?.summary ?? "");
    setExperience(resume?.experience ?? "");
    setSkills(resume?.skills ?? "");
    setResumeStatus(resume?.status ?? "draft");
  }

  function applyApplication(application: CareerApplicationDto | null) {
    selectedApplicationRef.current = application;
    setSelectedApplication(application);
    setCompany(application?.company ?? "");
    setRole(application?.role ?? "");
    setApplicationStatus(application?.status ?? "draft");
    setNotes(application?.notes ?? "");
    setAppliedAt(toDateInput(application?.appliedAt ?? null));
    setInterviewAt(toDateInput(application?.interviewAt ?? null));
  }

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!isSignedIn) return;
      const [resumeBody, applicationBody] = (await Promise.all([
        workspaceFetch("/api/career/resumes", { method: "GET" }, signal, getToken),
        workspaceFetch("/api/career/applications", { method: "GET" }, signal, getToken),
      ])) as [
        { data?: { resumes?: CareerResumeDto[] } },
        { data?: { applications?: CareerApplicationDto[] } },
      ];
      const nextResumes = resumeBody.data?.resumes ?? [];
      const nextApplications = applicationBody.data?.applications ?? [];
      const currentResume = selectedResumeRef.current;
      const currentApplication = selectedApplicationRef.current;
      setResumes(nextResumes);
      setApplications(nextApplications);
      applyResume(
        !currentResume
          ? nextResumes[0] ?? null
          : nextResumes.find((item) => item.id === currentResume.id) ?? nextResumes[0] ?? null,
      );
      applyApplication(
        !currentApplication
          ? nextApplications[0] ?? null
          : nextApplications.find((item) => item.id === currentApplication.id) ?? nextApplications[0] ?? null,
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

  async function createResume() {
    setSaving(true);
    try {
      const response = (await workspaceFetch(
        "/api/career/resumes",
        { method: "POST", body: JSON.stringify({ title: "Untitled resume" }) },
        undefined,
        getToken,
      )) as { data?: { resume?: CareerResumeDto } };
      toast.success("Resume created");
      await load();
      if (response.data?.resume) applyResume(response.data.resume);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to create the resume.");
    } finally {
      setSaving(false);
    }
  }

  async function saveResume() {
    if (!selectedResume) return;
    setSaving(true);
    try {
      await workspaceFetch(
        `/api/career/resumes/${selectedResume.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ title, summary, experience, skills, status: resumeStatus }),
        },
        undefined,
        getToken,
      );
      toast.success("Resume saved");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save the resume.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteResume() {
    if (!selectedResume) return;
    setSaving(true);
    try {
      await workspaceFetch(`/api/career/resumes/${selectedResume.id}`, { method: "DELETE" }, undefined, getToken);
      applyResume(null);
      toast.success("Resume deleted");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete the resume.");
    } finally {
      setSaving(false);
    }
  }

  async function createApplication() {
    setSaving(true);
    try {
      const response = (await workspaceFetch(
        "/api/career/applications",
        { method: "POST", body: JSON.stringify({ company: "Company", role: "Role" }) },
        undefined,
        getToken,
      )) as { data?: { application?: CareerApplicationDto } };
      toast.success("Application created");
      await load();
      if (response.data?.application) applyApplication(response.data.application);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to create the application.");
    } finally {
      setSaving(false);
    }
  }

  async function saveApplication() {
    if (!selectedApplication) return;
    setSaving(true);
    try {
      await workspaceFetch(
        `/api/career/applications/${selectedApplication.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            company,
            role,
            status: applicationStatus,
            notes: notes || null,
            appliedAt: toIsoOrNull(appliedAt),
            interviewAt: toIsoOrNull(interviewAt),
          }),
        },
        undefined,
        getToken,
      );
      toast.success("Application saved");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save the application.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteApplication() {
    if (!selectedApplication) return;
    setSaving(true);
    try {
      await workspaceFetch(
        `/api/career/applications/${selectedApplication.id}`,
        { method: "DELETE" },
        undefined,
        getToken,
      );
      applyApplication(null);
      toast.success("Application deleted");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete the application.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WorkspaceShell
      product="Career"
      href="/products/career"
      accent="blue"
      title="Career workspace"
      description="Write resumes and track applications you actually have. There is no job board here."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button leadingIcon={<Plus />} onClick={() => void createResume()} loading={saving}>
            New resume
          </Button>
          <Button variant="secondary" leadingIcon={<Plus />} onClick={() => void createApplication()} loading={saving}>
            New application
          </Button>
        </div>
      }
    >
      {resumes.length === 0 && applications.length === 0 ? (
        <EmptyState
          title="No career records"
          description="Create a resume or an application. Both stay on your account."
          action={<Button onClick={() => void createResume()}>Create resume</Button>}
        />
      ) : (
        <Tabs defaultValue={resumes.length > 0 ? "resume" : "applications"}>
          <TabsList variant="pill">
            <TabsTrigger value="resume">Resumes</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>
          <TabsContent value="resume">
            {resumes.length === 0 ? (
              <EmptyState
                title="No resumes"
                description="Create a resume, edit the sections, then save."
                action={<Button onClick={() => void createResume()}>Create resume</Button>}
              />
            ) : (
              <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                <ul className="space-y-2">
                  {resumes.map((resume) => (
                    <li key={resume.id}>
                      <button
                        type="button"
                        onClick={() => applyResume(resume)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left ${
                          selectedResume?.id === resume.id
                            ? "border-blue-300/30 bg-blue-300/[0.08]"
                            : "border-white/8 bg-white/[0.03]"
                        }`}
                      >
                        <p className="text-xs uppercase tracking-[0.16em] text-white/40">{resume.status}</p>
                        <p className="mt-1 truncate text-sm font-medium">{resume.title}</p>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Title">
                      <Input value={title} onChange={(event) => setTitle(event.target.value)} />
                    </Field>
                    <Field label="Status">
                      <select
                        className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm"
                        value={resumeStatus}
                        onChange={(event) => setResumeStatus(event.target.value)}
                      >
                        <option value="draft">Draft</option>
                        <option value="ready">Ready</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Summary">
                    <Textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={4} />
                  </Field>
                  <Field label="Experience">
                    <Textarea value={experience} onChange={(event) => setExperience(event.target.value)} rows={8} />
                  </Field>
                  <Field label="Skills">
                    <Textarea value={skills} onChange={(event) => setSkills(event.target.value)} rows={4} />
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => void saveResume()} loading={saving}>
                      Save
                    </Button>
                    <Button variant="secondary" onClick={() => void deleteResume()} loading={saving}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="applications">
            {applications.length === 0 ? (
              <EmptyState
                title="No applications"
                description="Track companies and roles you applied to. This is not a job board."
                action={<Button onClick={() => void createApplication()}>Create application</Button>}
              />
            ) : (
              <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                <ul className="space-y-2">
                  {applications.map((application) => (
                    <li key={application.id}>
                      <button
                        type="button"
                        onClick={() => applyApplication(application)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left ${
                          selectedApplication?.id === application.id
                            ? "border-blue-300/30 bg-blue-300/[0.08]"
                            : "border-white/8 bg-white/[0.03]"
                        }`}
                      >
                        <p className="text-xs uppercase tracking-[0.16em] text-white/40">{application.status}</p>
                        <p className="mt-1 truncate text-sm font-medium">{application.company}</p>
                        <p className="truncate text-xs text-white/50">{application.role}</p>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Company">
                      <Input value={company} onChange={(event) => setCompany(event.target.value)} />
                    </Field>
                    <Field label="Role">
                      <Input value={role} onChange={(event) => setRole(event.target.value)} />
                    </Field>
                  </div>
                  <Field label="Status">
                    <select
                      className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm"
                      value={applicationStatus}
                      onChange={(event) => setApplicationStatus(event.target.value)}
                    >
                      <option value="draft">Draft</option>
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Applied at">
                      <Input
                        type="datetime-local"
                        value={appliedAt}
                        onChange={(event) => setAppliedAt(event.target.value)}
                      />
                    </Field>
                    <Field label="Interview at">
                      <Input
                        type="datetime-local"
                        value={interviewAt}
                        onChange={(event) => setInterviewAt(event.target.value)}
                      />
                    </Field>
                  </div>
                  <Field label="Notes">
                    <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={6} />
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => void saveApplication()} loading={saving}>
                      Save
                    </Button>
                    <Button variant="secondary" onClick={() => void deleteApplication()} loading={saving}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
      <div className="mt-10">
        <ChatInterface
          mode="career"
          showConversationHistory
          placeholder="Ask Aila Career about this resume or application..."
        />
      </div>
    </WorkspaceShell>
  );
}

export function CareerWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <CareerWorkspaceInner />
    </ToastProvider>
  );
}
