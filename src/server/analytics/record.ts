import "server-only";

import { prisma } from "@/server/db/client";
import {
  resolveViewTarget,
  type ViewTargetInput,
} from "@/server/documents/view-target";
import { PERMANENT_ENTRY_SHARE_LINK_ID } from "@/server/analytics/constants";
import { getLocalDayRange, toStatDate } from "@/server/analytics/dates";
import { detectDeviceType, truncateColumn } from "@/server/analytics/normalize";

export type TrackViewInput = {
  target: ViewTargetInput;
  /** 浏览器 localStorage 中的匿名访客标识。 */
  visitorId: string;
  ip: string | null;
  ua: string | null;
  referer: string | null;
};

/**
 * 记录一次文档浏览：写入 view_logs 明细，并把 doc_daily_stats 的
 * 当日 PV +1；若该访客当日在该入口首次出现，UV 同步 +1。
 *
 * 目标解析与可见性判定复用 documents 模块的 resolveViewTarget；
 * 不可见目标静默丢弃，避免埋点接口成为探测文档存在性的旁路。
 *
 * @param input - 埋点入参（已通过 API 层 zod 校验）
 * @returns 是否实际记录
 */
export async function trackView(input: TrackViewInput): Promise<boolean> {
  const target = await resolveViewTarget(input.target);
  if (!target) {
    return false;
  }

  const now = new Date();
  const { start, end } = getLocalDayRange(now);
  const statDate = toStatDate(now);
  const statShareLinkId = target.shareLinkId ?? PERMANENT_ENTRY_SHARE_LINK_ID;

  await prisma.$transaction(async (tx) => {
    // 当日同入口是否已出现过该访客，决定 UV 是否 +1。
    // 并发下存在少量重复计数的可能，对统计场景可接受。
    const seenToday = await tx.viewLog.findFirst({
      where: {
        documentId: target.documentId,
        shareLinkId: target.shareLinkId,
        visitorId: input.visitorId,
        createdAt: { gte: start, lt: end },
      },
      select: { id: true },
    });

    await tx.viewLog.create({
      data: {
        documentId: target.documentId,
        shareLinkId: target.shareLinkId,
        visitorId: input.visitorId,
        ip: truncateColumn(input.ip, 45),
        ua: truncateColumn(input.ua, 500),
        referer: truncateColumn(input.referer, 500),
        deviceType: detectDeviceType(input.ua),
      },
    });

    await tx.docDailyStat.upsert({
      where: {
        documentId_shareLinkId_statDate: {
          documentId: target.documentId,
          shareLinkId: statShareLinkId,
          statDate,
        },
      },
      create: {
        documentId: target.documentId,
        shareLinkId: statShareLinkId,
        statDate,
        pv: 1,
        uv: 1,
      },
      update: {
        pv: { increment: 1 },
        ...(seenToday === null ? { uv: { increment: 1 } } : {}),
      },
    });
  });

  return true;
}
