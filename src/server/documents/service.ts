import "server-only";

import {
  DocumentStatus,
  DocumentVisibility,
  type Document,
} from "@/generated/prisma/client";
import { prisma } from "@/server/db/client";
import { renderMarkdownToSafeHtml } from "@/server/markdown/render";
import {
  toDocumentEditorDto,
  toDocumentListItem,
  type DocumentEditorDto,
  type DocumentListItemDto,
} from "@/server/documents/dto";

export type CreateDocumentInput = {
  title: string;
  slug: string;
  summary?: string;
  contentMd: string;
  status: DocumentStatus;
  visibility: DocumentVisibility;
  allowIndex: boolean;
  authorId: bigint;
};

export type UpdateDocumentInput = CreateDocumentInput & {
  id: bigint;
};

function normalizeAllowIndex(
  visibility: DocumentVisibility,
  status: DocumentStatus,
  allowIndex: boolean,
): boolean {
  if (visibility !== DocumentVisibility.PUBLIC) {
    return false;
  }
  if (status !== DocumentStatus.PUBLISHED) {
    return false;
  }
  return allowIndex;
}

function publishedAtForStatus(
  status: DocumentStatus,
  existingPublishedAt: Date | null,
): Date | null {
  if (status === DocumentStatus.PUBLISHED) {
    return existingPublishedAt ?? new Date();
  }
  return null;
}

/**
 * 列出未软删除的文档，按更新时间倒序。
 */
export async function listDocuments(): Promise<DocumentListItemDto[]> {
  const rows = await prisma.document.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(toDocumentListItem);
}

/**
 * 按 ID 获取可编辑文档，不含已软删除记录。
 */
export async function getDocumentForEdit(
  id: bigint,
): Promise<DocumentEditorDto | null> {
  const doc = await prisma.document.findFirst({
    where: { id, deletedAt: null },
  });
  return doc ? toDocumentEditorDto(doc) : null;
}

/**
 * 创建文档：渲染 Markdown 并写入 content_html。
 */
export async function createDocument(
  input: CreateDocumentInput,
): Promise<Document> {
  const contentHtml = await renderMarkdownToSafeHtml(input.contentMd);
  const allowIndex = normalizeAllowIndex(
    input.visibility,
    input.status,
    input.allowIndex,
  );

  return prisma.document.create({
    data: {
      title: input.title,
      slug: input.slug,
      summary: input.summary || null,
      contentMd: input.contentMd,
      contentHtml,
      status: input.status,
      visibility: input.visibility,
      allowIndex,
      authorId: input.authorId,
      publishedAt: publishedAtForStatus(input.status, null),
    },
  });
}

/**
 * 更新文档：重新渲染 Markdown。
 */
export async function updateDocument(
  input: UpdateDocumentInput,
): Promise<Document | null> {
  const existing = await prisma.document.findFirst({
    where: { id: input.id, deletedAt: null },
  });

  if (!existing) {
    return null;
  }

  const contentHtml = await renderMarkdownToSafeHtml(input.contentMd);
  const allowIndex = normalizeAllowIndex(
    input.visibility,
    input.status,
    input.allowIndex,
  );

  return prisma.document.update({
    where: { id: input.id },
    data: {
      title: input.title,
      slug: input.slug,
      summary: input.summary || null,
      contentMd: input.contentMd,
      contentHtml,
      status: input.status,
      visibility: input.visibility,
      allowIndex,
      publishedAt: publishedAtForStatus(input.status, existing.publishedAt),
    },
  });
}

/** 软删除文档。 */
export async function softDeleteDocument(id: bigint): Promise<boolean> {
  const existing = await prisma.document.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return false;
  }

  await prisma.document.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return true;
}

/** slug 是否已被其他文档占用。 */
export async function isSlugTaken(
  slug: string,
  excludeId?: bigint,
): Promise<boolean> {
  const found = await prisma.document.findFirst({
    where: {
      slug,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return found !== null;
}

/** 从标题生成 URL slug（仅 ASCII 字母数字与连字符）。 */
export function slugifyTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

  if (base.length >= 2) {
    return base;
  }

  return `doc-${Date.now().toString(36)}`;
}
