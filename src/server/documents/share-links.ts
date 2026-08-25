import "server-only";

import { nanoid } from "nanoid";
import { config } from "@/config";
import { hashPassword } from "@/server/auth/password";
import { prisma } from "@/server/db/client";
import {
  toShareLinkAdminDto,
  type ShareLinkAdminDto,
} from "@/server/documents/dto";

/**
 * 分享链接 token 长度。不可枚举性依赖该长度与 nanoid 的随机性，
 * 禁止调小或改用可预测值，见 prisma/schema.prisma 中 ShareLink.token 的说明。
 */
const SHARE_TOKEN_LENGTH = 22;

export type CreateShareLinkInput = {
  documentId: bigint;
  remark?: string;
  /** 明文密码，存储前做 bcrypt 哈希；不传表示该链接无需密码。 */
  password?: string;
  /** 过期时间，不传或 null 表示永不过期。 */
  expiresAt?: Date | null;
};

export type UpdateShareLinkInput = {
  id: bigint;
  remark: string | null;
  expiresAt: Date | null;
  /** 传入则覆盖为新密码（bcrypt 哈希后存储）。 */
  password?: string;
  /** 为 true 时移除密码；password 与其同时出现时以 password 为准。 */
  clearPassword?: boolean;
};

/**
 * 列出文档的全部分享链接，按创建时间倒序。
 *
 * @param documentId - 文档 ID
 */
export async function listShareLinks(
  documentId: bigint,
): Promise<ShareLinkAdminDto[]> {
  const rows = await prisma.shareLink.findMany({
    where: { documentId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => toShareLinkAdminDto(row, config.appBaseUrl));
}

/**
 * 创建分享链接。token 用 nanoid(22) 生成，不可枚举。
 *
 * @param input - 创建参数，密码与过期时间均可选
 * @returns 创建成功返回 DTO；目标文档不存在或已软删除返回 null
 */
export async function createShareLink(
  input: CreateShareLinkInput,
): Promise<ShareLinkAdminDto | null> {
  const doc = await prisma.document.findFirst({
    where: { id: input.documentId, deletedAt: null },
    select: { id: true },
  });

  if (!doc) {
    return null;
  }

  const link = await prisma.shareLink.create({
    data: {
      documentId: input.documentId,
      token: nanoid(SHARE_TOKEN_LENGTH),
      remark: input.remark || null,
      passwordHash: input.password ? await hashPassword(input.password) : null,
      expiresAt: input.expiresAt ?? null,
    },
  });

  return toShareLinkAdminDto(link, config.appBaseUrl);
}

/**
 * 更新分享链接的备注、过期时间与密码。
 * 密码三态：password 覆盖为新密码，clearPassword 清除，两者都不传保持不变。
 *
 * @param input - 更新参数
 * @returns 链接存在并更新成功返回 true
 */
export async function updateShareLink(
  input: UpdateShareLinkInput,
): Promise<boolean> {
  let passwordChange: { passwordHash: string | null } | undefined;

  if (input.password !== undefined) {
    passwordChange = { passwordHash: await hashPassword(input.password) };
  } else if (input.clearPassword) {
    passwordChange = { passwordHash: null };
  }

  const result = await prisma.shareLink.updateMany({
    where: { id: input.id },
    data: {
      remark: input.remark,
      expiresAt: input.expiresAt,
      ...passwordChange,
    },
  });

  return result.count > 0;
}

/**
 * 启用或停用分享链接。停用立即生效，可随时重新启用。
 *
 * @param id - 分享链接 ID
 * @param enabled - 目标状态
 * @returns 链接存在并更新成功返回 true
 */
export async function setShareLinkEnabled(
  id: bigint,
  enabled: boolean,
): Promise<boolean> {
  const result = await prisma.shareLink.updateMany({
    where: { id },
    data: { enabled },
  });
  return result.count > 0;
}
