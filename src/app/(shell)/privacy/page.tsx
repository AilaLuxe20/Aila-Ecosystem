import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Aila collects, stores, and uses account and product data.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-white">
      <p className="text-xs uppercase tracking-[0.24em] text-white/40">Aila Ecosystem</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Privacy Policy</h1>
      <p className="mt-4 text-sm text-white/45">Last updated 28 August 2026</p>
      <div className="mt-10 space-y-6 text-sm leading-7 text-white/70">
        <p>
          Aila Luxe Ventures (“Aila”) provides signed-in software products at ailaluxe.com. This
          policy explains what we store when you use those products.
        </p>
        <h2 className="text-lg font-medium text-white">Account data</h2>
        <p>
          Sign-in is provided by Clerk. We store the email, name, and profile image needed to create
          your Aila user record and keep it linked to your Clerk account.
        </p>
        <h2 className="text-lg font-medium text-white">Product data</h2>
        <p>
          Content you create in Intelligence, Daily, Writer, Translate, Documents, Legal, Calendar,
          Business, Automation, Ads, Coding, Career, Education, Health, Finance, Travel, Commerce,
          Shipping, Apps, Sites, and Flow is stored in our database and is private to your account,
          except published Sites which are public at the URL you share. Uploaded document text is
          stored so you can reopen it; we do not sell that content.
        </p>
        <h2 className="text-lg font-medium text-white">Payments and email</h2>
        <p>
          Card payments and Aila Pro subscriptions are processed by Stripe. We store
          Stripe customer IDs, subscription status, order records, and checkout
          session IDs. Project inquiries and automation emails are sent with Resend.
        </p>
        <h2 className="text-lg font-medium text-white">Contact</h2>
        <p>
          Questions about this policy: use the{" "}
          <Link href="/#start-project" className="text-cyan-300">
            project inquiry form
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
