"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ChatInterface from "@/components/ai/ChatInterface";
import type {
  EducationCourseDto,
  EducationNoteDto,
  EducationQuizDto,
} from "@/core/education/service";
import { workspaceFetch } from "@/components/workspace/api";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import {
  Button,
  EmptyState,
  Field,
  Input,
  Progress,
  Textarea,
  ToastProvider,
  useToast,
} from "@/components/ui";

function EducationWorkspaceInner(): React.JSX.Element {
  const { isSignedIn, getToken } = useAuth();
  const toast = useToast();
  const [courses, setCourses] = useState<EducationCourseDto[]>([]);
  const [notes, setNotes] = useState<EducationNoteDto[]>([]);
  const [quizzes, setQuizzes] = useState<EducationQuizDto[]>([]);
  const [selected, setSelected] = useState<EducationCourseDto | null>(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizAnswer, setQuizAnswer] = useState("");
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const selectedRef = useRef<EducationCourseDto | null>(null);

  function applyCourse(course: EducationCourseDto | null) {
    selectedRef.current = course;
    setSelected(course);
    setTitle(course?.title ?? "");
    setTopic(course?.topic ?? "");
    setDescription(course?.description ?? "");
    setStatus(course?.status ?? "active");
  }

  const courseNotes = useMemo(
    () => notes.filter((note) => note.courseId === selected?.id),
    [notes, selected?.id],
  );
  const courseQuizzes = useMemo(
    () => quizzes.filter((quiz) => quiz.courseId === selected?.id),
    [quizzes, selected?.id],
  );
  const completedCount = courseQuizzes.filter((quiz) => quiz.answeredAt).length;
  const progressPercent =
    courseQuizzes.length === 0 ? 0 : Math.round((completedCount / courseQuizzes.length) * 100);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!isSignedIn) return;
      const [courseBody, noteBody, quizBody] = (await Promise.all([
        workspaceFetch("/api/education/courses", { method: "GET" }, signal, getToken),
        workspaceFetch("/api/education/notes", { method: "GET" }, signal, getToken),
        workspaceFetch("/api/education/quizzes", { method: "GET" }, signal, getToken),
      ])) as [
        { data?: { courses?: EducationCourseDto[] } },
        { data?: { notes?: EducationNoteDto[] } },
        { data?: { quizzes?: EducationQuizDto[] } },
      ];
      const nextCourses = courseBody.data?.courses ?? [];
      const current = selectedRef.current;
      setCourses(nextCourses);
      setNotes(noteBody.data?.notes ?? []);
      setQuizzes(quizBody.data?.quizzes ?? []);
      applyCourse(
        !current
          ? nextCourses[0] ?? null
          : nextCourses.find((item) => item.id === current.id) ?? nextCourses[0] ?? null,
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

  async function createCourse() {
    setSaving(true);
    try {
      const response = (await workspaceFetch(
        "/api/education/courses",
        { method: "POST", body: JSON.stringify({ title: "Untitled course", topic: "General" }) },
        undefined,
        getToken,
      )) as { data?: { course?: EducationCourseDto } };
      toast.success("Course created");
      await load();
      if (response.data?.course) applyCourse(response.data.course);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to create the course.");
    } finally {
      setSaving(false);
    }
  }

  async function saveCourse() {
    if (!selected) return;
    setSaving(true);
    try {
      await workspaceFetch(
        `/api/education/courses/${selected.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ title, topic, description: description || null, status }),
        },
        undefined,
        getToken,
      );
      toast.success("Course saved");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save the course.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCourse() {
    if (!selected) return;
    setSaving(true);
    try {
      await workspaceFetch(`/api/education/courses/${selected.id}`, { method: "DELETE" }, undefined, getToken);
      applyCourse(null);
      toast.success("Course deleted");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete the course.");
    } finally {
      setSaving(false);
    }
  }

  async function addNote() {
    if (!selected || !noteTitle.trim()) return;
    setSaving(true);
    try {
      await workspaceFetch(
        "/api/education/notes",
        {
          method: "POST",
          body: JSON.stringify({ title: noteTitle.trim(), body: noteBody, courseId: selected.id }),
        },
        undefined,
        getToken,
      );
      setNoteTitle("");
      setNoteBody("");
      toast.success("Note added");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to add the note.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id: string) {
    setSaving(true);
    try {
      await workspaceFetch(`/api/education/notes/${id}`, { method: "DELETE" }, undefined, getToken);
      toast.success("Note deleted");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete the note.");
    } finally {
      setSaving(false);
    }
  }

  async function addQuiz() {
    if (!selected || !quizQuestion.trim() || !quizAnswer.trim()) return;
    setSaving(true);
    try {
      await workspaceFetch(
        "/api/education/quizzes",
        {
          method: "POST",
          body: JSON.stringify({
            courseId: selected.id,
            question: quizQuestion.trim(),
            answer: quizAnswer.trim(),
          }),
        },
        undefined,
        getToken,
      );
      setQuizQuestion("");
      setQuizAnswer("");
      toast.success("Quiz question added");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to add the quiz.");
    } finally {
      setSaving(false);
    }
  }

  async function submitQuiz(quiz: EducationQuizDto) {
    const userAnswer = (draftAnswers[quiz.id] ?? "").trim();
    if (!userAnswer) return;
    setSaving(true);
    try {
      await workspaceFetch(
        `/api/education/quizzes/${quiz.id}`,
        { method: "PATCH", body: JSON.stringify({ userAnswer }) },
        undefined,
        getToken,
      );
      toast.success("Answer submitted");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to submit the answer.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuiz(id: string) {
    setSaving(true);
    try {
      await workspaceFetch(`/api/education/quizzes/${id}`, { method: "DELETE" }, undefined, getToken);
      toast.success("Quiz deleted");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete the quiz.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WorkspaceShell
      product="Education"
      href="/products/education"
      accent="sky"
      title="Study workspace"
      description="Select a course, add notes and quiz questions, then take the quiz. Progress is completed quizzes over total."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={
        <Button leadingIcon={<Plus />} onClick={() => void createCourse()} loading={saving}>
          New course
        </Button>
      }
    >
      {courses.length === 0 ? (
        <EmptyState
          title="No courses"
          description="Create a course, add notes and quiz questions, then take the quiz."
          action={<Button onClick={() => void createCourse()}>Create course</Button>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <ul className="space-y-2">
            {courses.map((course) => (
              <li key={course.id}>
                <button
                  type="button"
                  onClick={() => applyCourse(course)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left ${
                    selected?.id === course.id
                      ? "border-sky-300/30 bg-sky-300/[0.08]"
                      : "border-white/8 bg-white/[0.03]"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-white/40">{course.status}</p>
                  <p className="mt-1 truncate text-sm font-medium">{course.title}</p>
                  <p className="truncate text-xs text-white/50">{course.topic}</p>
                </button>
              </li>
            ))}
          </ul>
          {selected ? (
            <div className="space-y-6">
              <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Title">
                    <Input value={title} onChange={(event) => setTitle(event.target.value)} />
                  </Field>
                  <Field label="Topic">
                    <Input value={topic} onChange={(event) => setTopic(event.target.value)} />
                  </Field>
                </div>
                <Field label="Status">
                  <select
                    className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </Field>
                <Field label="Description">
                  <Textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={3}
                  />
                </Field>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.16em] text-white/40">
                    Progress {completedCount}/{courseQuizzes.length}
                  </p>
                  <Progress value={progressPercent} max={100} label="Quiz progress" showValue />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => void saveCourse()} loading={saving}>
                    Save course
                  </Button>
                  <Button variant="secondary" onClick={() => void deleteCourse()} loading={saving}>
                    Delete course
                  </Button>
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <h2 className="text-lg font-medium">Notes</h2>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Field label="Note title">
                    <Input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} />
                  </Field>
                  <div className="flex items-end">
                    <Button onClick={() => void addNote()} loading={saving}>
                      Add note
                    </Button>
                  </div>
                </div>
                <Field label="Note">
                  <Textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} rows={4} />
                </Field>
                <ul className="space-y-3">
                  {courseNotes.map((note) => (
                    <li key={note.id} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{note.title}</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-white/70">{note.body}</p>
                        </div>
                        <Button size="sm" variant="secondary" onClick={() => void deleteNote(note.id)}>
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <h2 className="text-lg font-medium">Quizzes</h2>
                <Field label="Question">
                  <Input value={quizQuestion} onChange={(event) => setQuizQuestion(event.target.value)} />
                </Field>
                <Field label="Answer">
                  <Input value={quizAnswer} onChange={(event) => setQuizAnswer(event.target.value)} />
                </Field>
                <Button onClick={() => void addQuiz()} loading={saving}>
                  Add quiz
                </Button>
                <ul className="space-y-3">
                  {courseQuizzes.map((quiz, index) => (
                    <li key={quiz.id} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/40">Question {index + 1}</p>
                      <p className="mt-1 text-sm font-medium">{quiz.question}</p>
                      {quiz.answeredAt ? (
                        <p className={`mt-2 text-sm ${quiz.correct ? "text-emerald-300" : "text-red-300"}`}>
                          {quiz.correct ? "Correct" : "Incorrect"}
                          {quiz.userAnswer ? ` — you answered “${quiz.userAnswer}”` : ""}.
                          {!quiz.correct ? ` Answer: ${quiz.answer}` : ""}
                        </p>
                      ) : null}
                      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                        <Input
                          value={draftAnswers[quiz.id] ?? ""}
                          onChange={(event) =>
                            setDraftAnswers((current) => ({ ...current, [quiz.id]: event.target.value }))
                          }
                          placeholder="Your answer"
                        />
                        <Button onClick={() => void submitQuiz(quiz)} loading={saving}>
                          {quiz.answeredAt ? "Try again" : "Submit"}
                        </Button>
                      </div>
                      <div className="mt-3">
                        <Button size="sm" variant="secondary" onClick={() => void deleteQuiz(quiz.id)}>
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      )}
      <div className="mt-10">
        <ChatInterface
          mode="education"
          showConversationHistory
          placeholder="Ask Aila Education to explain or quiz you on this course..."
        />
      </div>
    </WorkspaceShell>
  );
}

export function EducationWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <EducationWorkspaceInner />
    </ToastProvider>
  );
}
