import type { Metadata } from "next";
import {
  assertPublicDocument,
  getPublicDocumentBySlug,
} from "@/server/documents/reader";

export async function generateMetadata({
  params,
}: PageProps<"/d/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getPublicDocumentBySlug(slug);

  if (!doc) {
    return { title: "未找到" };
  }

  return {
    title: doc.title,
    description: doc.summary ?? undefined,
    robots: doc.allowIndex ? { index: true, follow: true } : { index: false },
  };
}

export default async function DocumentReaderPage({
  params,
}: PageProps<"/d/[slug]">) {
  const { slug } = await params;
  const doc = await getPublicDocumentBySlug(slug);
  assertPublicDocument(doc);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10 border-b border-zinc-200 pb-8">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-zinc-900">
          {doc.title}
        </h1>
        {doc.summary ? (
          <p className="mt-4 text-lg leading-relaxed text-zinc-600">
            {doc.summary}
          </p>
        ) : null}
        <p className="mt-4 text-sm text-zinc-400">{doc.viewCount} 次浏览</p>
      </header>
      <div
        className="space-y-4 text-[17px] leading-[1.75] text-zinc-800 [&_a]:text-zinc-900 [&_a]:underline [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:mt-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-zinc-950 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-zinc-100"
        dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
      />
    </article>
  );
}
