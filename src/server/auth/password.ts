import "server-only";

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * 对明文密码做 bcrypt 哈希，用于持久化存储。
 *
 * @param plain - 明文密码
 * @returns bcrypt 哈希字符串
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * 校验明文密码是否与存储的 bcrypt 哈希匹配。
 *
 * @param plain - 用户输入的明文密码
 * @param hash - 数据库中的 bcrypt 哈希
 * @returns 匹配为 true
 */
export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
