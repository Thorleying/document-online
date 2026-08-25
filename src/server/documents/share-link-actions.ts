"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/server/auth/dal";
import {
  createShareLink,
  setShareLinkEnabled,
  updateShareLink,
} from "@/server/documents/share-links";

const shareLinkFieldsSchema = z.object({
  remark: z.string().trim().max(100, "备注最长 100 字").optional(),
  password: z
    .string()
    .min(4, "密码至少 4 个字符")
    .max(64, "密码最长 64 个字符")
    .optional(),
  expiresAt: z.coerce.date("过期时间格式无效").optional(),
});

export type ShareLinkFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: string }
  | undefined;

function parseId(raw: FormDataEntryValue | null): bigint | null {
  if (typeof raw !== "string" || raw === "") {
    return null;
  }
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}

function emptyToUndefined(raw: FormDataEntryValue | null): string | undefined {
  return typeof raw === "string" && raw.trim() !== "" ? raw : undefined;
}

function sharesPath(documentId: bigint): string {
  return `/admin/documents/${documentId.toString()}/shares`;
}

function parseShareLinkFields(formData: FormData) {
  return shareLinkFieldsSchema.safeParse({
    remark: emptyToUndefined(formData.get("remark")),
    password: emptyToUndefined(formData.get("password")),
    expiresAt: emptyToUndefined(formData.get("expiresAt")),
  });
}

/** 创建分享链接。 */
export async function createShareLinkAction(
  _prev: ShareLinkFormState,
  formData: FormData,
): Promise<ShareLinkFormState> {
  await verifySession();

  const documentId = parseId(formData.get("documentId"));
  if (documentId === null) {
    return { message: "无效的文档 ID" };
  }

  const parsed = parseShareLinkFields(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const created = await createShareLink({
    documentId,
    remark: parsed.data.remark,
    password: parsed.data.password,
    expiresAt: parsed.data.expiresAt ?? null,
  });

  if (!created) {
    return { message: "文档不存在或已删除" };
  }

  revalidatePath(sharesPath(documentId));
  return { success: "分享链接已创建" };
}

/** 更新分享链接的备注、密码与过期时间。 */
export async function updateShareLinkAction(
  _prev: ShareLinkFormState,
  formData: FormData,
): Promise<ShareLinkFormState> {
  await verifySession();

  const id = parseId(formData.get("id"));
  const documentId = parseId(formData.get("documentId"));
  if (id === null || documentId === null) {
    return { message: "无效的链接 ID" };
  }

  const parsed = parseShareLinkFields(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const updated = await updateShareLink({
    id,
    remark: parsed.data.remark ?? null,
    expiresAt: parsed.data.expiresAt ?? null,
    password: parsed.data.password,
    clearPassword: formData.get("clearPassword") === "on",
  });

  if (!updated) {
    return { message: "链接不存在" };
  }

  revalidatePath(sharesPath(documentId));
  return { success: "已保存" };
}

/** 启用或停用分享链接。 */
export async function toggleShareLinkAction(formData: FormData): Promise<void> {
  await verifySession();

  const id = parseId(formData.get("id"));
  const documentId = parseId(formData.get("documentId"));
  if (id === null || documentId === null) {
    return;
  }

  await setShareLinkEnabled(id, formData.get("enabled") === "true");
  revalidatePath(sharesPath(documentId));
}
