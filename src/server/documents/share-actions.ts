"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { verifyPassword } from "@/server/auth/password";
import { prisma } from "@/server/db/client";
import { evaluateDocumentAccess } from "@/server/documents/access";
import { grantShareAccess } from "@/server/documents/share";

const shareGateSchema = z.object({
  token: z.string().trim().min(1).max(32),
  password: z.string().min(1, "请输入访问密码"),
});

export type ShareGateFormState = { error?: string } | undefined;

/**
 * 校验分享链接的访问密码。成功后签发访问凭证并重定向回分享页；
 * 链接状态判定一律走 evaluateDocumentAccess，本函数不自行拼装可见性。
 */
export async function verifySharePasswordAction(
  _prev: ShareGateFormState,
  formData: FormData,
): Promise<ShareGateFormState> {
  const parsed = shareGateSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "请输入访问密码" };
  }

  const { token, password } = parsed.data;

  const link = await prisma.shareLink.findUnique({
    where: { token },
    select: {
      enabled: true,
      expiresAt: true,
      passwordHash: true,
      document: {
        select: { status: true, visibility: true, deletedAt: true },
      },
    },
  });

  if (!link || link.passwordHash === null) {
    redirect(`/s/${token}`);
  }

  const decision = evaluateDocumentAccess(link.document, {
    kind: "share",
    shareLink: {
      enabled: link.enabled,
      expiresAt: link.expiresAt,
      passwordHash: link.passwordHash,
      passwordVerified: false,
    },
  });

  // 链接已停用 / 已过期 / 文档下线时，回到分享页渲染对应状态，不再校验密码。
  if (decision.allowed || decision.reason !== "password_required") {
    redirect(`/s/${token}`);
  }

  const valid = await verifyPassword(password, link.passwordHash);

  if (!valid) {
    return { error: "密码错误，请重试" };
  }

  await grantShareAccess(token, link.expiresAt);
  redirect(`/s/${token}`);
}
