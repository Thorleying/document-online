// Prisma 7 把数据源连接串从 schema.prisma 移到了本文件。
// schema.prisma 的 datasource 块只保留 provider。
import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error(
    "缺少环境变量 DATABASE_URL。请复制 .env.example 为 .env 并填入 MySQL 连接串。",
  );
}

// 影子数据库仅供 `prisma migrate dev` 使用：它需要 CREATE DATABASE 权限来
// 演算迁移，而应用账号刻意不具备该权限。把提权凭据限制在迁移工具里，
// 应用运行时仍以最小权限账号连接。
// 生产环境用 `prisma migrate deploy`，不需要影子数据库，因此不设此变量。
const shadowDatabaseUrl = process.env["SHADOW_DATABASE_URL"];

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
    ...(shadowDatabaseUrl ? { shadowDatabaseUrl } : {}),
  },
});
