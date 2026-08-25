import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/server/auth/session";
import { prisma } from "@/server/db/client";

export type AuthSession = {
  userId: bigint;
  username: string;
};

/**
 * 校验当前请求是否已登录且账号有效。
 * 未登录时重定向到登录页。
 */
export const verifySession = cache(async (): Promise<AuthSession> => {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/admin/login");
  }

  let userId: bigint;
  try {
    userId = BigInt(session.userId);
  } catch {
    redirect("/admin/login");
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, status: "ACTIVE" },
    select: { id: true, username: true },
  });

  if (!user) {
    redirect("/admin/login");
  }

  return { userId: user.id, username: user.username };
});

/**
 * 读取会话但不重定向，供登录页判断是否已登录。
 *
 * @returns 已登录且账号有效时返回会话，否则 null
 */
export const getOptionalSession = cache(
  async (): Promise<AuthSession | null> => {
    const session = await getSessionFromCookies();
    if (!session) {
      return null;
    }

    let userId: bigint;
    try {
      userId = BigInt(session.userId);
    } catch {
      return null;
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, status: "ACTIVE" },
      select: { id: true, username: true },
    });

    return user ? { userId: user.id, username: user.username } : null;
  },
);
