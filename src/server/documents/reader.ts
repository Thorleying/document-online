import "server-only";

import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import {
  evaluateDocumentAccess,
  shouldAllowSearchIndex,
} from "@/server/documents/access";

export type PublicDocumentView = {
  title: string;
  summary: string | null;
  contentHtml: string;
  slug: string;
  viewCount: number;
  allowIndex: boolean;
};

/**
 * 按 slug 加载永久链接可阅读的文档视图。
 * private 或未发布与不存在统一返回 null，由页面渲染 404。
 */
export async function getPublicDocumentBySlug(
  slug: string,
): Promise<PublicDocumentView | null> {
  const doc = await prisma.document.findFirst({
    where: { slug, deletedAt: null },
    select: {
      title: true,
      summary: true,
      contentHtml: true,
      slug: true,
      viewCount: true,
      status: true,
      visibility: true,
      deletedAt: true,
      allowIndex: true,
    },
  });

  const decision = evaluateDocumentAccess(doc, { kind: "permanent" });
  if (!decision.allowed || !doc) {
    return null;
  }

  return {
    title: doc.title,
    summary: doc.summary,
    contentHtml: doc.contentHtml,
    slug: doc.slug,
    viewCount: doc.viewCount,
    allowIndex: shouldAllowSearchIndex(doc),
  };
}

/** 供页面在文档不存在时调用 notFound。 */
export function assertPublicDocument(
  doc: PublicDocumentView | null,
): asserts doc is PublicDocumentView {
  if (!doc) {
    notFound();
  }
}
