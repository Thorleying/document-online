import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { config } from "@/config";

export type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

const encodedKey = new TextEncoder().encode(config.sessionSecret);

/**
 * 签发会话 JWT。
 *
 * @param payload - 会话载荷，仅含 userId 与 expiresAt
 */
export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    expiresAt: payload.expiresAt.toISOString(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(payload.expiresAt.getTime() / 1000))
    .sign(encodedKey);
}

/**
 * 校验并解析会话 JWT。
 *
 * @param token - Cookie 中的 JWT 字符串
 * @returns 解析成功返回载荷，否则 undefined
 */
export async function decryptSession(
  token: string | undefined,
): Promise<SessionPayload | undefined> {
  if (!token) {
    return undefined;
  }

  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });

    const userId = payload.userId;
    const expiresAtRaw = payload.expiresAt;

    if (typeof userId !== "string" || typeof expiresAtRaw !== "string") {
      return undefined;
    }

    return {
      userId,
      expiresAt: new Date(expiresAtRaw),
    };
  } catch {
    return undefined;
  }
}

/**
 * 创建会话并写入 httpOnly Cookie。
 *
 * @param userId - 管理员用户 ID（字符串形式的 BigInt）
 */
export async function createSession(userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + config.sessionMaxAgeSec * 1000);
  const token = await encryptSession({ userId, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set(config.sessionCookieName, token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** 删除会话 Cookie（登出）。 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(config.sessionCookieName);
}

/**
 * 从 Cookie 读取当前会话，不写入。
 *
 * @returns 有效会话载荷，或 undefined
 */
export async function getSessionFromCookies(): Promise<
  SessionPayload | undefined
> {
  const cookieStore = await cookies();
  const token = cookieStore.get(config.sessionCookieName)?.value;
  return decryptSession(token);
}
