import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";
import { config } from "@/config";
import { prisma } from "@/server/db/client";
import { evaluateDocumentAccess } from "@/server/documents/access";

/** 分享入口可阅读的文档视图，不含任何管理端字段。 */
export type SharedDocumentView = {
  title: string;
  summary: string | null;
  contentHtml: string;
  viewCount: number;
};

/** 分享页四态 + 404：由 access.ts 的判定结果映射而来。 */
export type ShareAccessView =
  | { state: "ok"; doc: SharedDocumentView }
  | { state: "password_required" }
  | { state: "share_expired" }
  | { state: "share_disabled" }
  | { state: "not_found" };

const encodedKey = new TextEncoder().encode(config.sessionSecret);

function shareCookieName(token: string): string {
  return `${config.shareAccessCookiePrefix}${token}`;
}

/**
 * 校验当前请求是否持有该分享链接的有效密码验证凭证。
 *
 * @param token - 分享链接 token
 * @returns 凭证有效返回 true
 */
export async function hasVerifiedSharePassword(
  token: string,
): Promise<boolean> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(shareCookieName(token))?.value;

  if (!raw) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(raw, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload.shareToken === token;
  } catch {
    return false;
  }
}

/**
 * 密码验证通过后签发访问凭证 Cookie，作用域限定在当前分享路径。
 * 凭证有效期不超过链接本身的过期时间。
 *
 * @param token - 分享链接 token
 * @param linkExpiresAt - 链接过期时间，null 表示永不过期
 */
export async function grantShareAccess(
  token: string,
  linkExpiresAt: Date | null,
): Promise<void> {
  const defaultExpiry = new Date(
    Date.now() + config.shareAccessMaxAgeSec * 1000,
  );
  const expiresAt =
    linkExpiresAt !== null && linkExpiresAt < defaultExpiry
      ? linkExpiresAt
      : defaultExpiry;

  const jwt = await new SignJWT({ shareToken: token })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(encodedKey);

  const cookieStore = await cookies();
  cookieStore.set(shareCookieName(token), jwt, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax",
    path: `/s/${token}`,
    expires: expiresAt,
  });
}

/**
 * 按 token 加载分享入口的访问视图。
 * 判定一律走 evaluateDocumentAccess；not_published 对外统一表现为 404，
 * 避免泄露草稿的存在。React cache 保证同一请求内 metadata 与页面共享查询。
 *
 * @param token - 分享链接 token
 */
export const getShareAccessView = cache(
  async (token: string): Promise<ShareAccessView> => {
    const link = await prisma.shareLink.findUnique({
      where: { token },
      select: {
        enabled: true,
        expiresAt: true,
        passwordHash: true,
        document: {
          select: {
            title: true,
            summary: true,
            contentHtml: true,
            viewCount: true,
            status: true,
            visibility: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!link) {
      return { state: "not_found" };
    }

    const decision = evaluateDocumentAccess(link.document, {
      kind: "share",
      shareLink: {
        enabled: link.enabled,
        expiresAt: link.expiresAt,
        passwordHash: link.passwordHash,
        passwordVerified: await hasVerifiedSharePassword(token),
      },
    });

    if (decision.allowed) {
      return {
        state: "ok",
        doc: {
          title: link.document.title,
          summary: link.document.summary,
          contentHtml: link.document.contentHtml,
          viewCount: link.document.viewCount,
        },
      };
    }

    switch (decision.reason) {
      case "password_required":
        return { state: "password_required" };
      case "share_expired":
        return { state: "share_expired" };
      case "share_disabled":
        return { state: "share_disabled" };
      default:
        return { state: "not_found" };
    }
  },
);
