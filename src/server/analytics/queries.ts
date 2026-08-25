import "server-only";

import { prisma } from "@/server/db/client";
import { PERMANENT_ENTRY_SHARE_LINK_ID } from "@/server/analytics/constants";
import { getTrendStart, toStatDate } from "@/server/analytics/dates";
import {
  type ChannelStat,
  type DailyTrendPoint,
  type DocumentChannelStats,
  type RecentViewItem,
  type RefererStat,
} from "@/server/analytics/dto";
import { refererSource } from "@/server/analytics/normalize";

type PvUv = { pv: number; uv: number };

/** 将 stat_date（UTC 零点）格式化为 YYYY-MM-DD。 */
function formatStatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** 从 startDay 起连续 days 天生成补零后的日趋势序列。 */
function fillDailyTrend(
  byDate: Map<string, PvUv>,
  startDay: Date,
  days: number,
): DailyTrendPoint[] {
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

  return fillDailyTrend(byDate, startDay, days);
}

/** 将各渠道的 PV/UV 合计关联 share_links 的备注与 token，按 PV 降序。 */
async function toChannelStats(
  byChannel: Map<bigint, PvUv>,
): Promise<ChannelStat[]> {
  const shareIds = [...byChannel.keys()].filter(
    (id) => id !== PERMANENT_ENTRY_SHARE_LINK_ID,
  );
  const links =
    shareIds.length > 0
      ? await prisma.shareLink.findMany({
          where: { id: { in: shareIds } },
          select: { id: true, remark: true, token: true },
        })
      : [];
  const linkById = new Map(links.map((link) => [link.id, link]));

  return [...byChannel.entries()]
    .map(([shareLinkId, sums]): ChannelStat => {
      const link = linkById.get(shareLinkId);
      return {
        shareLinkId: shareLinkId.toString(),
        entry:
          shareLinkId === PERMANENT_ENTRY_SHARE_LINK_ID ? "permanent" : "share",
        remark: link?.remark ?? null,
        token: link?.token ?? null,
        pv: sums.pv,
        uv: sums.uv,
      };
    })
    .sort((a, b) => b.pv - a.pv || b.uv - a.uv);
}

/**
 * 单文档近 N 天的分渠道统计：整体日 PV/UV 趋势（补零）与各入口
 * （永久链接 / 各分享链接）在窗口内的 PV/UV 汇总。
 *
 * 数据来自 doc_daily_stats 预聚合表，share_link_id 用
 * PERMANENT_ENTRY_SHARE_LINK_ID（0）表示永久链接入口；分享链接的备注与
 * token 关联 share_links 获取，链接已被删除时二者为 null。
 *
 * @param documentId - 文档 ID
 * @param days - 窗口天数（含今天）
 */
export async function getDocumentChannelStats(
  documentId: bigint,
  days: number,
): Promise<DocumentChannelStats> {
  const startDay = getTrendStart(new Date(), days);

  const rows = await prisma.docDailyStat.findMany({
    where: { documentId, statDate: { gte: toStatDate(startDay) } },
    select: { shareLinkId: true, statDate: true, pv: true, uv: true },
  });

  const byDate = new Map<string, PvUv>();
  const byChannel = new Map<bigint, PvUv>();
  for (const row of rows) {
    const dateKey = formatStatDate(row.statDate);
    const daySums = byDate.get(dateKey) ?? { pv: 0, uv: 0 };
    daySums.pv += row.pv;
    daySums.uv += row.uv;
    byDate.set(dateKey, daySums);

    const channelSums = byChannel.get(row.shareLinkId) ?? { pv: 0, uv: 0 };
    channelSums.pv += row.pv;
    channelSums.uv += row.uv;
    byChannel.set(row.shareLinkId, channelSums);
  }

  return {
    trend: fillDailyTrend(byDate, startDay, days),
    channels: await toChannelStats(byChannel),
  };
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
