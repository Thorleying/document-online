import type {
  Document,
  DocumentStatus,
  DocumentVisibility,
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
