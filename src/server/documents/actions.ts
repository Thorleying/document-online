"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { DocumentStatus, DocumentVisibility } from "@/generated/prisma/client";
import { verifySession } from "@/server/auth/dal";
import {
  createDocument,
  isSlugTaken,
  softDeleteDocument,
  slugifyTitle,
  updateDocument,
} from "@/server/documents/service";

const documentSchema = z.object({
  title: z.string().trim().min(1, "标题不能为空").max(200),
  slug: z
    .string()
    .trim()
    .min(2, "Slug 至少 2 个字符")
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug 仅允许小写字母、数字与连字符"),
  summary: z.string().max(500).optional(),
  contentMd: z.string().min(1, "正文不能为空"),
  status: z.enum([
    DocumentStatus.DRAFT,
    DocumentStatus.PUBLISHED,
    DocumentStatus.ARCHIVED,
  ]),
  visibility: z.enum([DocumentVisibility.PRIVATE, DocumentVisibility.PUBLIC]),
  allowIndex: z.coerce.boolean().optional(),
});

export type DocumentFormState =
  { errors?: Record<string, string[]>; message?: string } | undefined;

function parseDocumentForm(formData: FormData) {
  return documentSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || slugifyTitle(String(formData.get("title"))),
    summary: formData.get("summary") || undefined,
    contentMd: formData.get("contentMd"),
    status: formData.get("status"),
    visibility: formData.get("visibility"),
    allowIndex: formData.get("allowIndex") === "on",
  });
}

/** 创建文档。 */
export async function createDocumentAction(
  _prev: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  const session = await verifySession();
  const parsed = parseDocumentForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  if (await isSlugTaken(data.slug)) {
    return { errors: { slug: ["该 Slug 已被占用"] } };
  }

  try {
    const doc = await createDocument({
      ...data,
      summary: data.summary,
      allowIndex: data.allowIndex ?? false,
      authorId: session.userId,
    });
    revalidatePath("/admin/documents");
    redirect(`/admin/documents/${doc.id.toString()}/edit`);
  } catch {
    return { message: "保存失败，请检查 Markdown 格式后重试" };
  }
}

/** 更新文档。 */
export async function updateDocumentAction(
  _prev: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  const session = await verifySession();
  const idRaw = formData.get("id");

  if (typeof idRaw !== "string" || !idRaw) {
    return { message: "缺少文档 ID" };
  }

  let id: bigint;
  try {
    id = BigInt(idRaw);
  } catch {
    return { message: "无效的文档 ID" };
  }

  const parsed = parseDocumentForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  if (await isSlugTaken(data.slug, id)) {
    return { errors: { slug: ["该 Slug 已被占用"] } };
  }

  try {
    const updated = await updateDocument({
      id,
      ...data,
      summary: data.summary,
      allowIndex: data.allowIndex ?? false,
      authorId: session.userId,
    });

    if (!updated) {
      return { message: "文档不存在或已删除" };
    }

    revalidatePath("/admin/documents");
    revalidatePath(`/admin/documents/${id.toString()}/edit`);
    return undefined;
  } catch {
    return { message: "保存失败，请检查 Markdown 格式后重试" };
  }
}

/** 软删除文档。 */
export async function deleteDocumentAction(formData: FormData): Promise<void> {
  await verifySession();
  const idRaw = formData.get("id");

  if (typeof idRaw !== "string") {
    return;
  }

  try {
    await softDeleteDocument(BigInt(idRaw));
    revalidatePath("/admin/documents");
  } catch {
    // 静默失败，列表页刷新后状态一致
  }

  redirect("/admin/documents");
}
