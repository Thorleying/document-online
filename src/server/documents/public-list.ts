import "server-only";

import { DocumentStatus, DocumentVisibility } from "@/generated/prisma/client";
import { prisma } from "@/server/db/client";

export type PublicDocumentCard = {
  title: string;
  summary: string | null;
  slug: string;
  viewCount: number;
  publishedAt: Date | null;
};

/**
 * 首页展示的已发布公开文档列表。
 */
export async function listPublicDocumentCards(
  limit = 6,
): Promise<PublicDocumentCard[]> {
  return prisma.document.findMany({
    where: {
      deletedAt: null,
      status: DocumentStatus.PUBLISHED,
      visibility: DocumentVisibility.PUBLIC,
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take: limit,
    select: {
      title: true,
      summary: true,
      slug: true,
      viewCount: true,
      publishedAt: true,
    },
  });
}

export type PublicLibraryStats = {
  documentCount: number;
  totalViews: number;
};

/** 首页顶栏展示的公开文档聚合统计。 */
export async function getPublicLibraryStats(): Promise<PublicLibraryStats> {
  const where = {
    deletedAt: null,
    status: DocumentStatus.PUBLISHED,
    visibility: DocumentVisibility.PUBLIC,
  };

  const [documentCount, agg] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.aggregate({ where, _sum: { viewCount: true } }),
  ]);

  return {
    documentCount,
    totalViews: agg._sum.viewCount ?? 0,
  };
}
