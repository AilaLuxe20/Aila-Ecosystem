import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdownRenderer } from "@/components/ui";
import { getPublishedSite } from "@/core/sites/service";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ path?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const site = await getPublishedSite(id).catch(() => null);

  if (!site) {
    return { title: "Site" };
  }

  return {
    title: site.name,
    description: site.description ?? `${site.name} on Aila Sites`,
  };
}

export default async function PublishedSitePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const site = await getPublishedSite(id).catch(() => null);

  if (!site || site.pages.length === 0) {
    notFound();
  }

  const requested = query.path;
  const page =
    site.pages.find((entry) => entry.path === requested) ??
    site.pages.find((entry) => entry.path === "/") ??
    site.pages[0];

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-16 text-white">
      <article className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.24em] text-teal-200/70">Aila Sites</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">{site.name}</h1>
        {site.description ? <p className="mt-3 text-white/55">{site.description}</p> : null}
        {site.pages.length > 1 ? (
          <nav className="mt-8 flex flex-wrap gap-2">
            {site.pages.map((entry) => {
              const href = entry.path === "/" || entry.path === site.pages[0]?.path
                ? `/s/${site.id}`
                : `/s/${site.id}?path=${encodeURIComponent(entry.path)}`;
              const active = entry.id === page.id;
              return (
                <Link
                  key={entry.id}
                  href={href}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    active
                      ? "border-teal-300/30 bg-teal-300/[0.1] text-white"
                      : "border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {entry.title}
                </Link>
              );
            })}
          </nav>
        ) : null}
        <div className="mt-10">
          <h2 className="text-2xl font-medium">{page.title}</h2>
          <div className="mt-6">
            <MarkdownRenderer content={page.content} />
          </div>
        </div>
      </article>
    </main>
  );
}
