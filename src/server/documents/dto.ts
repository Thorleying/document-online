import type {
  Document,
  DocumentStatus,
  DocumentVisibility,
  ShareLink,
} from "@/generated/prisma/client";

/** 管理端文档列表项，不含正文 HTML。 */
export type DocumentListItemDto = {
  id: string;
  title: string;
  slug: string;
  status: DocumentStatus;
  visibility: DocumentVisibility;
  viewCount: number;
  updatedAt: string;
};

/** 管理端文档编辑表单所需字段。 */
export type DocumentEditorDto = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentMd: string;
  status: DocumentStatus;
  visibility: DocumentVisibility;
  allowIndex: boolean;
};

/**
 * 将 Prisma Document 映射为列表项 DTO。
 */
export function toDocumentListItem(doc: Document): DocumentListItemDto {
  return {
    id: doc.id.toString(),
    title: doc.title,
    slug: doc.slug,
    status: doc.status,
    visibility: doc.visibility,
    viewCount: doc.viewCount,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/** 管理端分享链接列表项。不含 passwordHash 等敏感字段。 */
export type ShareLinkAdminDto = {
  id: string;
  token: string;
  /** 完整分享 URL，供复制按钮直接使用。 */
  url: string;
  remark: string;
  hasPassword: boolean;
  /** ISO 字符串，null 表示永不过期。 */
  expiresAt: string | null;
  /** 服务端判定的过期状态，避免客户端时钟差异导致渲染不一致。 */
  isExpired: boolean;
  enabled: boolean;
  viewCount: number;
  createdAt: string;
};

/**
 * 将 Prisma ShareLink 映射为管理端 DTO。
 *
 * @param link - Prisma ShareLink 记录
 * @param baseUrl - 站点对外基地址（不含末尾斜杠），用于拼接分享 URL
 */
export function toShareLinkAdminDto(
  link: ShareLink,
  baseUrl: string,
): ShareLinkAdminDto {
  return {
    id: link.id.toString(),
    token: link.token,
    url: `${baseUrl}/s/${link.token}`,
    remark: link.remark ?? "",
    hasPassword: link.passwordHash !== null,
    expiresAt: link.expiresAt?.toISOString() ?? null,
    isExpired:
      link.expiresAt !== null && link.expiresAt.getTime() <= Date.now(),
    enabled: link.enabled,
    viewCount: link.viewCount,
    createdAt: link.createdAt.toISOString(),
  };
}

/**
 * 将 Prisma Document 映射为编辑表单 DTO。
 */
export function toDocumentEditorDto(doc: Document): DocumentEditorDto {
  return {
    id: doc.id.toString(),
    title: doc.title,
    slug: doc.slug,
    summary: doc.summary ?? "",
    contentMd: doc.contentMd,
    status: doc.status,
    visibility: doc.visibility,
    allowIndex: doc.allowIndex,
  };
}
