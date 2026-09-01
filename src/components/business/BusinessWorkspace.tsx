"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import ChatInterface from "@/components/ai/ChatInterface";
import type { BusinessContactDto, BusinessTaskDto } from "@/core/business/service";
import { fieldErrorsFromUnknown, useWorkspaceApi } from "@/components/workspace/api";
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

type ContactForm = {
  name: string;
  email: string;
  company: string;
  phone: string;
  notes: string;
  status: "lead" | "active" | "archived";
};

type TaskForm = {
  title: string;
  notes: string;
  contactId: string;
  dueAt: string;
  status: "open" | "done";
};

const emptyContact: ContactForm = {
  name: "",
  email: "",
  company: "",
  phone: "",
  notes: "",
  status: "lead",
};

const emptyTask: TaskForm = {
  title: "",
  notes: "",
  contactId: "",
  dueAt: "",
  status: "open",
};

function BusinessWorkspaceInner(): React.JSX.Element {
  const { isSignedIn } = useAuth();
  const api = useWorkspaceApi();
  const toast = useToast();
  const [contacts, setContacts] = useState<BusinessContactDto[]>([]);
  const [tasks, setTasks] = useState<BusinessTaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<BusinessContactDto | null>(null);
  const [editingTask, setEditingTask] = useState<BusinessTaskDto | null>(null);
  const [contactForm, setContactForm] = useState(emptyContact);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!isSignedIn) {
      return;
    }

    const [contactBody, taskBody] = (await Promise.all([
      api("/api/business/contacts", { method: "GET" }, signal),
      api("/api/business/tasks", { method: "GET" }, signal),
    ])) as [
      { data?: { contacts?: BusinessContactDto[] } },
      { data?: { tasks?: BusinessTaskDto[] } },
    ];

    setContacts(contactBody.data?.contacts ?? []);
    setTasks(taskBody.data?.tasks ?? []);
    setError(null);
    setLoading(false);
  }, [api, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

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

  function openContact(contact?: BusinessContactDto) {
    setEditingContact(contact ?? null);
    setContactForm(
      contact
        ? {
            name: contact.name,
            email: contact.email ?? "",
            company: contact.company ?? "",
            phone: contact.phone ?? "",
            notes: contact.notes ?? "",
            status: contact.status as ContactForm["status"],
          }
        : emptyContact,
    );
    setFormError(null);
    setContactOpen(true);
  }

  function openTask(task?: BusinessTaskDto) {
    setEditingTask(task ?? null);
    setTaskForm(
      task
        ? {
            title: task.title,
            notes: task.notes ?? "",
            contactId: task.contactId ?? "",
            dueAt: task.dueAt ? task.dueAt.slice(0, 16) : "",
            status: task.status as TaskForm["status"],
          }
        : emptyTask,
    );
    setFormError(null);
    setTaskOpen(true);
  }

  async function saveContact() {
    setSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        name: contactForm.name,
        email: contactForm.email || null,
        company: contactForm.company || null,
        phone: contactForm.phone || null,
        notes: contactForm.notes || null,
        status: contactForm.status,
      };

      if (editingContact) {
        await api(`/api/business/contacts/${editingContact.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Contact updated");
      } else {
        await api("/api/business/contacts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Contact created");
      }

      setContactOpen(false);
      await load();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to save the contact.");
    } finally {
      setSubmitting(false);
    }
  }

  async function saveTask() {
    setSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        title: taskForm.title,
        notes: taskForm.notes || null,
        contactId: taskForm.contactId || null,
        dueAt: taskForm.dueAt ? new Date(taskForm.dueAt).toISOString() : null,
        status: taskForm.status,
      };

      if (editingTask) {
        await api(`/api/business/tasks/${editingTask.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Task updated");
      } else {
        await api("/api/business/tasks", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Task created");
      }

      setTaskOpen(false);
      await load();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to save the task.");
    } finally {
      setSubmitting(false);
    }
  }

  async function completeTask(task: BusinessTaskDto) {
    await api(`/api/business/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: task.status === "done" ? "open" : "done" }),
    });
    toast.success(task.status === "done" ? "Task reopened" : "Task completed");
    await load();
  }

  async function removeContact() {
    if (!editingContact) return;
    setSubmitting(true);
    try {
      await api(`/api/business/contacts/${editingContact.id}`, { method: "DELETE" });
      toast.success("Contact deleted");
      setContactOpen(false);
      await load();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to delete the contact.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeTask() {
    if (!editingTask) return;
    setSubmitting(true);
    try {
      await api(`/api/business/tasks/${editingTask.id}`, { method: "DELETE" });
      toast.success("Task deleted");
      setTaskOpen(false);
      await load();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to delete the task.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WorkspaceShell
      product="Business"
      href="/products/business"
      accent="purple"
      title="Clients and work"
      description="Create contacts, assign tasks, and mark work complete. Everything is saved to your account."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={
        <>
          <Button variant="secondary" onClick={() => openTask()}>
            New task
          </Button>
          <Button leadingIcon={<Plus />} onClick={() => openContact()}>
            New contact
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <h2 className="text-lg font-medium">Contacts</h2>
          {contacts.length === 0 ? (
            <EmptyState
              compact
              className="mt-6"
              title="No contacts yet"
              description="Add a lead or client to start tracking work."
              action={<Button size="sm" onClick={() => openContact()}>Add contact</Button>}
            />
          ) : (
            <ul className="mt-4 space-y-2">
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <button
                    type="button"
                    onClick={() => openContact(contact)}
                    className="w-full rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3 text-left hover:border-purple-300/20"
                  >
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="mt-1 text-xs text-white/50">
                      {contact.company || contact.email || "No company"} · {contact.status}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <h2 className="text-lg font-medium">Tasks</h2>
          {tasks.length === 0 ? (
            <EmptyState
              compact
              className="mt-6"
              title="No tasks yet"
              description="Create a task and complete it when the work is done."
              action={<Button size="sm" onClick={() => openTask()}>Add task</Button>}
            />
          ) : (
            <ul className="mt-4 space-y-2">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => openTask(task)}
                  >
                    <p className={`text-sm font-medium ${task.status === "done" ? "text-white/40 line-through" : ""}`}>
                      {task.title}
                    </p>
                    <p className="mt-1 text-xs text-white/50">{task.status}</p>
                  </button>
                  <Button size="sm" variant="secondary" onClick={() => void completeTask(task)}>
                    {task.status === "done" ? "Reopen" : "Complete"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit contact" : "New contact"}</DialogTitle>
            <DialogDescription>Saved against your Aila Business workspace.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <Field label="Name" error={fieldErrorsFromUnknown(null).name}>
              <Input value={contactForm.name} onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })} />
            </Field>
            <Field label="Email">
              <Input value={contactForm.email} onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })} />
            </Field>
            <Field label="Company">
              <Input value={contactForm.company} onChange={(event) => setContactForm({ ...contactForm, company: event.target.value })} />
            </Field>
            <Field label="Phone">
              <Input value={contactForm.phone} onChange={(event) => setContactForm({ ...contactForm, phone: event.target.value })} />
            </Field>
            <Field label="Status">
              <select
                className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm"
                value={contactForm.status}
                onChange={(event) => setContactForm({ ...contactForm, status: event.target.value as ContactForm["status"] })}
              >
                <option value="lead">Lead</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <Field label="Notes">
              <Textarea value={contactForm.notes} onChange={(event) => setContactForm({ ...contactForm, notes: event.target.value })} />
            </Field>
            {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
          </DialogBody>
          <DialogFooter>
            {editingContact ? (
              <Button variant="destructive" onClick={() => void removeContact()} loading={submitting}>
                Delete
              </Button>
            ) : null}
            <Button onClick={() => void saveContact()} loading={submitting}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit task" : "New task"}</DialogTitle>
            <DialogDescription>Complete a task to close the loop.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <Field label="Title">
              <Input value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} />
            </Field>
            <Field label="Contact">
              <select
                className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm"
                value={taskForm.contactId}
                onChange={(event) => setTaskForm({ ...taskForm, contactId: event.target.value })}
              >
                <option value="">None</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Due">
              <Input
                type="datetime-local"
                value={taskForm.dueAt}
                onChange={(event) => setTaskForm({ ...taskForm, dueAt: event.target.value })}
              />
            </Field>
            <Field label="Notes">
              <Textarea value={taskForm.notes} onChange={(event) => setTaskForm({ ...taskForm, notes: event.target.value })} />
            </Field>
            {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
          </DialogBody>
          <DialogFooter>
            {editingTask ? (
              <Button variant="destructive" onClick={() => void removeTask()} loading={submitting}>
                Delete
              </Button>
            ) : null}
            <Button onClick={() => void saveTask()} loading={submitting}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mt-10">
        <ChatInterface
          mode="business"
          showConversationHistory
          placeholder="Ask Aila Business about these contacts or tasks..."
        />
      </div>
    </WorkspaceShell>
  );
}

export function BusinessWorkspace(): React.JSX.Element {
  return (
    <ToastProvider>
      <BusinessWorkspaceInner />
    </ToastProvider>
  );
}
