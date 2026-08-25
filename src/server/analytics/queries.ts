import "server-only";

import { prisma } from "@/server/db/client";
import { getTrendStart, toStatDate } from "@/server/analytics/dates";
import {
  type DailyTrendPoint,
  type RecentViewItem,
  type RefererStat,
} from "@/server/analytics/dto";
import { refererSource } from "@/server/analytics/normalize";

/** 将 stat_date（UTC 零点）格式化为 YYYY-MM-DD。 */
function formatStatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * 近 N 天（含今天）的全站日 PV/UV 趋势，缺数据的日期补零。
 * 数据来自 doc_daily_stats 预聚合表；UV 为各（文档 × 入口）的日 UV 之和，
 * 同一访客访问多篇文档会被计多次，这是预聚合口径下的既定取舍。
 *
 * @param days - 窗口天数（含今天）
 */
export async function getDailyTrend(days: number): Promise<DailyTrendPoint[]> {
  const now = new Date();
  const startDay = getTrendStart(now, days);

  const rows = await prisma.docDailyStat.groupBy({
    by: ["statDate"],
    where: { statDate: { gte: toStatDate(startDay) } },
    _sum: { pv: true, uv: true },
  });

  const byDate = new Map(
    rows.map((row) => [
      formatStatDate(row.statDate),
      { pv: row._sum.pv ?? 0, uv: row._sum.uv ?? 0 },
    ]),
  );

  const points: DailyTrendPoint[] = [];
  for (let i = 0; i < Math.max(1, days); i += 1) {
    const day = new Date(startDay);
    day.setDate(day.getDate() + i);
    const key = formatStatDate(toStatDate(day));
    const sums = byDate.get(key);
    points.push({ date: key, pv: sums?.pv ?? 0, uv: sums?.uv ?? 0 });
  }
  return points;
}

/**
 * 近 N 天的来源分布 Top，按归一后的来源（referer host / 直接访问）合并计数。
 *
 * 注意：本查询按天数窗口在 view_logs 上做 GROUP BY。明细表保留 90 天且
 * createdAt 有索引，当前量级可接受；量级上来后应把来源维度并入预聚合表。
 *
 * @param days - 窗口天数（含今天）
 * @param limit - 返回的来源数量上限
 */
export async function getTopReferers(
  days: number,
  limit: number,
): Promise<RefererStat[]> {
  const start = getTrendStart(new Date(), days);

  const rows = await prisma.viewLog.groupBy({
    by: ["referer"],
    where: { createdAt: { gte: start } },
    _count: { _all: true },
  });

  const merged = new Map<string, number>();
  for (const row of rows) {
    const source = refererSource(row.referer);
    merged.set(source, (merged.get(source) ?? 0) + row._count._all);
  }

  return [...merged.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * 最近 N 条访问明细（含访问时间），按时间倒序。
 *
 * @param limit - 返回条数上限
 */
export async function getRecentViews(limit: number): Promise<RecentViewItem[]> {
  const logs = await prisma.viewLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      visitorId: true,
      referer: true,
      deviceType: true,
      shareLinkId: true,
      createdAt: true,
      document: { select: { title: true, slug: true } },
      shareLink: { select: { remark: true } },
    },
  });

  return logs.map((log) => ({
    id: log.id.toString(),
    documentTitle: log.document.title,
    documentSlug: log.document.slug,
    entry:
      log.shareLinkId === null ? ("permanent" as const) : ("share" as const),
    shareRemark: log.shareLink?.remark ?? null,
    source: refererSource(log.referer),
    deviceType: log.deviceType,
    visitorId: log.visitorId,
    viewedAt: log.createdAt.toISOString(),
  }));
}
