import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarkdownRenderer } from "@/components/ui";
import { getPublishedSite } from "@/core/sites/service";

type PageProps = {
  params: Promise<{ id: string }>;
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

export default async function PublishedSitePage({ params }: PageProps) {
  const { id } = await params;
  const site = await getPublishedSite(id).catch(() => null);
  const page = site?.pages[0];

  if (!site || !page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-16 text-white">
      <article className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.24em] text-teal-200/70">Aila Sites</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">{site.name}</h1>
        {site.description ? <p className="mt-3 text-white/55">{site.description}</p> : null}
        <div className="mt-10">
          <MarkdownRenderer content={page.content} />
        </div>
      </article>
    </main>
  );
}
