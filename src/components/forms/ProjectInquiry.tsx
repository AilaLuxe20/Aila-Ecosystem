"use client";

import { FormEvent, useState } from "react";
import { track } from "@vercel/analytics";

type ProjectType =
  | "Website"
  | "Web App"
  | "Mobile App"
  | "AI Solution"
  | "Automation"
  | "";

type FormState = {
  name: string;
  email: string;
  company: string;
  projectType: ProjectType;
  idea: string;
};

const projectTypes: Exclude<ProjectType, "">[] = [
  "Website",
  "Web App",
  "Mobile App",
  "AI Solution",
  "Automation",
];

const initialForm: FormState = {
  name: "",
  email: "",
  company: "",
  projectType: "",
  idea: "",
};

export default function ProjectInquiry() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function updateField(
    field: keyof FormState,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  }

  function continueToDetails() {
    if (!form.projectType) {
      setError("Choose what you want to build.");
      return;
    }

    setStep(2);
  }

  function continueToContact() {
    if (form.idea.trim().length < 10) {
      setError(
        "Tell Aila a little more about your idea."
      );
      return;
    }

    setStep(3);
  }

  async function submitInquiry(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim()
    ) {
      setError(
        "Please enter your name and email."
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        "/api/project-inquiry",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Could not send your project inquiry."
        );
      }

      track("project_inquiry_submitted", {
        projectType: form.projectType,
        hasCompany: Boolean(form.company.trim()),
      });

      setSuccess(true);
      setForm(initialForm);
    } catch (submitError) {
      console.error(
        "Project Inquiry Error:",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <section
        id="start-project"
        className="mx-auto max-w-7xl px-6 py-28"
      >
        <div className="relative overflow-hidden rounded-[40px] border border-cyan-300/15 bg-white/[0.025] px-6 py-24 text-center backdrop-blur-2xl sm:px-12">
          <div className="pointer-events-none absolute left-1/2 top-[-250px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-400/[0.1] blur-[150px]" />

          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/[0.06]">
              <div className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_30px_rgba(103,232,249,1)]" />
            </div>

            <p className="mt-8 text-xs uppercase tracking-[0.3em] text-cyan-200/60">
              Project Received
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
              Your idea has entered
              <span className="block text-neutral-500">
                the Aila Ecosystem.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-xl leading-7 text-neutral-400">
              Your project information has been received.
              The next step is understanding the right
              product, technology and path to bring it to
              life.
            </p>

            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setStep(1);
              }}
              className="mt-10 rounded-full border border-white/[0.1] bg-white/[0.05] px-7 py-3.5 text-sm text-neutral-300 transition hover:bg-white/[0.1]"
            >
              Start another project
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="start-project"
      className="mx-auto max-w-7xl px-6 py-28"
    >
      <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="lg:sticky lg:top-32">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">
            Build With Aila
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl md:text-6xl">
            Start with
            <span className="block text-neutral-500">
              an idea.
            </span>
          </h2>

          <p className="mt-7 max-w-lg text-lg leading-8 text-neutral-400">
             Tell Aila what you want to build. We&#39;ll turn
            your idea into a clear product direction and
            the right technology path.
          </p>

          <div className="mt-10 space-y-5 border-t border-white/[0.08] pt-8">
            {[
              "Understand your idea",
              "Discover the right solution",
              "Define the product direction",
              "Move toward real development",
            ].map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-4"
              >
                <span className="text-xs text-neutral-700">
                  0{index + 1}
                </span>

                <div className="h-px w-8 bg-white/[0.1]" />

                <span className="text-sm text-neutral-400">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[36px] border border-white/[0.09] bg-white/[0.025] backdrop-blur-2xl">
          <div className="pointer-events-none absolute right-[-200px] top-[-250px] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.08] blur-[140px]" />

          <div className="relative border-b border-white/[0.07] px-6 py-6 sm:px-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Project Discovery
                </p>

                <p className="mt-1 text-xs text-neutral-600">
                  Step {step} of 3
                </p>
              </div>

              <div className="flex gap-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      item <= step
                        ? "w-8 bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.5)]"
                        : "w-4 bg-white/[0.08]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <form
            onSubmit={submitInquiry}
            className="relative p-6 sm:p-8"
          >
            {step === 1 && (
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
                  Choose a direction
                </p>

                <h3 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">
                  What do you want to build?
                </h3>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {projectTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        updateField(
                          "projectType",
                          type
                        )
                      }
                      className={`min-h-24 rounded-2xl border p-5 text-left transition duration-300 ${
                        form.projectType === type
                          ? "border-cyan-300/30 bg-cyan-300/[0.08]"
                          : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={
                            form.projectType === type
                              ? "text-cyan-100"
                              : "text-neutral-300"
                          }
                        >
                          {type}
                        </span>

                        <div
                          className={`h-2 w-2 rounded-full ${
                            form.projectType === type
                              ? "bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]"
                              : "border border-neutral-700"
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={continueToDetails}
                  className="mt-8 flex w-full items-center justify-center rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:scale-[1.01]"
                >
                  Continue →
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
                  Tell Aila more
                </p>

                <h3 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">
                  Describe your idea.
                </h3>

                <p className="mt-3 text-sm leading-6 text-neutral-500">
                  What should it do? Who is it for? What
                  problem are you trying to solve?
                </p>

                <textarea
                  value={form.idea}
                  onChange={(event) =>
                    updateField(
                      "idea",
                      event.target.value
                    )
                  }
                  rows={8}
                  placeholder="I want to build..."
                  className="mt-8 w-full resize-none rounded-3xl border border-white/[0.09] bg-black/30 p-5 text-sm leading-7 text-white outline-none transition focus:border-cyan-300/25"
                />

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-2xl border border-white/[0.09] px-6 py-4 text-sm text-neutral-400 transition hover:bg-white/[0.05]"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={continueToContact}
                    className="flex-1 rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:scale-[1.01]"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
                  Final step
                </p>

                <h3 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">
                  Where should we reach you?
                </h3>

                <div className="mt-8 space-y-4">
                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-white/[0.09] bg-black/30 px-5 py-4 text-sm outline-none transition focus:border-cyan-300/25"
                  />

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="Email address"
                    className="w-full rounded-2xl border border-white/[0.09] bg-black/30 px-5 py-4 text-sm outline-none transition focus:border-cyan-300/25"
                  />

                  <input
                    value={form.company}
                    onChange={(event) =>
                      updateField(
                        "company",
                        event.target.value
                      )
                    }
                    placeholder="Company or brand (optional)"
                    className="w-full rounded-2xl border border-white/[0.09] bg-black/30 px-5 py-4 text-sm outline-none transition focus:border-cyan-300/25"
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-2xl border border-white/[0.09] px-6 py-4 text-sm text-neutral-400 transition hover:bg-white/[0.05]"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {submitting
                      ? "Sending project..."
                      : "Send to Aila →"}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="mt-5 text-sm text-red-300">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
