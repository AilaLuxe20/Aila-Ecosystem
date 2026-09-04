import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using Aila products and submitting project inquiries.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-white">
      <p className="text-xs uppercase tracking-[0.24em] text-white/40">Aila Ecosystem</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Terms of Use</h1>
      <p className="mt-4 text-sm text-white/45">Last updated 28 August 2026</p>
      <div className="mt-10 space-y-6 text-sm leading-7 text-white/70">
        <p>
          By creating an account or using Aila products you agree to these terms. If you do not
          agree, do not use the service.
        </p>
        <h2 className="text-lg font-medium text-white">The service</h2>
        <p>
          Aila provides software workspaces for chat, legal document review, calendar events,
          contacts and tasks, automations, commerce catalogs, campaign plans, app listings, sites,
          and workflows. Ads does not buy advertising inventory on Google, Meta, or other networks.
          You are responsible for the content you store and any emails you send through automations.
        </p>
        <h2 className="text-lg font-medium text-white">Accounts</h2>
        <p>
          You must keep your sign-in credentials secure. You must not use the service to break the
          law, infringe others’ rights, or attempt to access another user’s data.
        </p>
        <h2 className="text-lg font-medium text-white">Project work</h2>
        <p>
          Submitting a project inquiry does not create a contract. Custom build work is agreed
          separately.
        </p>
        <h2 className="text-lg font-medium text-white">Privacy</h2>
        <p>
          How we handle data is described in the{" "}
          <Link href="/privacy" className="text-cyan-300">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
