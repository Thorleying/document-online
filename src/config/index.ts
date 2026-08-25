import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  APP_BASE_URL: z.url(),
  REDIS_URL: z.string().min(1).optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
  throw new Error(`环境变量校验失败：${missing}`);
}

const env = parsed.data;

/** 应用配置的唯一读取点，业务代码不得直接访问 process.env。 */
export const config = {
  databaseUrl: env.DATABASE_URL,
  sessionSecret: env.SESSION_SECRET,
  appBaseUrl: env.APP_BASE_URL.replace(/\/$/, ""),
  redisUrl: env.REDIS_URL ?? "redis://localhost:6379",
  isProduction: env.NODE_ENV === "production",
  sessionCookieName: "session" as const,
  /** 会话有效期（秒）。 */
  sessionMaxAgeSec: 7 * 24 * 60 * 60,
} as const;

export type AppConfig = typeof config;
