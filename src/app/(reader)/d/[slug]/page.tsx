import type { Metadata } from "next";
import { ReaderShell } from "@/components/reader/reader-shell";
import { ViewTracker } from "@/components/reader/view-tracker";
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
    <ReaderShell
      title={doc.title}
      summary={doc.summary}
      viewCount={doc.viewCount}
      publishedLabel="公开文档"
    >
      <ViewTracker slug={doc.slug} />
      <div dangerouslySetInnerHTML={{ __html: doc.contentHtml }} />
    </ReaderShell>
  );
}
