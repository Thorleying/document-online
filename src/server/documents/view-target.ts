import "server-only";

import { prisma } from "@/server/db/client";
import { evaluateDocumentAccess } from "@/server/documents/access";

/** 埋点目标：永久链接按 slug 定位，分享链接按 token 定位。 */
export type ViewTargetInput =
  { kind: "permanent"; slug: string } | { kind: "share"; token: string };

/** 解析结果。shareLinkId 为 null 表示访问来自永久链接。 */
export type ResolvedViewTarget = {
  documentId: bigint;
  shareLinkId: bigint | null;
};

/**
 * 将埋点目标解析为可记录浏览的文档与入口，是 analytics 读取
 * documents / share_links 的唯一入口。
 *
 * 判定复用 evaluateDocumentAccess。分享入口的密码验证凭证是
 * path=/s/{token} 的路径级 Cookie，埋点请求（POST /api/view）携带不到，
 * 因此这里按 passwordVerified 处理，只校验链接启用/未过期与文档状态。
 * 埋点只发生在阅读页成功渲染之后，该放宽不影响读取控制本身。
 *
 * @param input - 埋点目标
 * @returns 允许记录时返回文档与入口 ID，否则返回 null
 */
export async function resolveViewTarget(
  input: ViewTargetInput,
): Promise<ResolvedViewTarget | null> {
  if (input.kind === "permanent") {
    const doc = await prisma.document.findFirst({
      where: { slug: input.slug, deletedAt: null },
      select: { id: true, status: true, visibility: true, deletedAt: true },
    });

    const decision = evaluateDocumentAccess(doc, { kind: "permanent" });
    if (!decision.allowed || !doc) {
      return null;
    }
    return { documentId: doc.id, shareLinkId: null };
  }

  const link = await prisma.shareLink.findUnique({
    where: { token: input.token },
    select: {
      id: true,
      documentId: true,
      enabled: true,
      expiresAt: true,
      passwordHash: true,
      document: {
        select: { status: true, visibility: true, deletedAt: true },
      },
    },
  });

  if (!link) {
    return null;
  }

  const decision = evaluateDocumentAccess(link.document, {
    kind: "share",
    shareLink: {
      enabled: link.enabled,
      expiresAt: link.expiresAt,
      passwordHash: link.passwordHash,
      passwordVerified: true,
    },
  });

  if (!decision.allowed) {
    return null;
  }
  return { documentId: link.documentId, shareLinkId: link.id };
}
