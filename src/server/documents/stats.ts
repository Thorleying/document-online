import "server-only";

import { DocumentStatus } from "@/generated/prisma/client";
import { prisma } from "@/server/db/client";

export type AdminDashboardStats = {
  totalDocuments: number;
  publishedCount: number;
  draftCount: number;
  totalViews: number;
};

/**
 * 管理端概览页所需的文档聚合统计。
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const baseWhere = { deletedAt: null };

  const [totalDocuments, publishedCount, draftCount, viewAgg] =
    await Promise.all([
      prisma.document.count({ where: baseWhere }),
      prisma.document.count({
        where: { ...baseWhere, status: DocumentStatus.PUBLISHED },
      }),
      prisma.document.count({
        where: { ...baseWhere, status: DocumentStatus.DRAFT },
      }),
      prisma.document.aggregate({
        where: baseWhere,
        _sum: { viewCount: true },
      }),
    ]);

  return {
    totalDocuments,
    publishedCount,
    draftCount,
    totalViews: viewAgg._sum.viewCount ?? 0,
  };
}
