import { DocumentStatus, DocumentVisibility } from "@/generated/prisma/client";

/** 文档读取上下文：永久链接或分享链接。 */
export type DocumentAccessContext =
  | { kind: "permanent" }
  | {
      kind: "share";
      shareLink: {
        enabled: boolean;
        expiresAt: Date | null;
        passwordHash: string | null;
        passwordVerified: boolean;
      };
    };

export type DocumentAccessFields = {
  status: DocumentStatus;
  visibility: DocumentVisibility;
  deletedAt: Date | null;
};

export type DocumentAccessDecision =
  | { allowed: true }
  | {
      allowed: false;
      reason:
        | "not_found"
        | "not_published"
        | "share_disabled"
        | "share_expired"
        | "password_required";
    };

/**
 * 判定文档是否允许在当前入口下被阅读。
 * 本函数是访问控制的唯一权威实现，页面不得自行拼装可见性判断。
 */
export function evaluateDocumentAccess(
  doc: DocumentAccessFields | null,
  context: DocumentAccessContext,
): DocumentAccessDecision {
  if (!doc || doc.deletedAt !== null) {
    return { allowed: false, reason: "not_found" };
  }

  if (doc.status !== DocumentStatus.PUBLISHED) {
    return { allowed: false, reason: "not_published" };
  }

  if (context.kind === "permanent") {
    if (doc.visibility !== DocumentVisibility.PUBLIC) {
      return { allowed: false, reason: "not_found" };
    }
    return { allowed: true };
  }

  const link = context.shareLink;

  if (!link.enabled) {
    return { allowed: false, reason: "share_disabled" };
  }

  if (link.expiresAt !== null && link.expiresAt.getTime() <= Date.now()) {
    return { allowed: false, reason: "share_expired" };
  }

  if (link.passwordHash !== null && !link.passwordVerified) {
    return { allowed: false, reason: "password_required" };
  }

  return { allowed: true };
}

/**
 * 判定搜索引擎是否应索引该文档。
 * 仅 public + published + 未删除 + allowIndex 为 true 时允许。
 */
export function shouldAllowSearchIndex(
  doc: DocumentAccessFields & { allowIndex: boolean },
): boolean {
  if (doc.deletedAt !== null) {
    return false;
  }
  if (doc.status !== DocumentStatus.PUBLISHED) {
    return false;
  }
  if (doc.visibility !== DocumentVisibility.PUBLIC) {
    return false;
  }
  return doc.allowIndex;
}
