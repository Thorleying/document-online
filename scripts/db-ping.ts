import "dotenv/config";

import {
  createConnection,
  type Connection,
  type ConnectionConfig,
} from "mariadb";

/**
 * 将 Prisma 常用的 mysql:// 连接串解析为 mariadb 驱动配置。
 */
function parseDatabaseUrl(raw: string): ConnectionConfig {
  const normalized = raw.replace(/^mysql:\/\//, "http://");
  const url = new URL(normalized);
  const database = url.pathname.replace(/^\//, "");
  if (!database) {
    throw new Error("DATABASE_URL 缺少数据库名");
  }
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
    connectTimeout: 5_000,
  };
}

/**
 * 探测 MySQL 是否可达。供 predev、verify:full 与 CI 本地门禁使用。
 */
async function pingDatabase(): Promise<void> {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    console.error("❌ DATABASE_URL 未设置");
    console.error("   请复制 .env.example 为 .env 并填入 MySQL 连接串。");
    process.exit(1);
  }

  let conn: Connection | undefined;
  try {
    conn = await createConnection(parseDatabaseUrl(raw));
    await conn.query("SELECT 1 AS ok");
    console.log("✅ 数据库连接正常");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("❌ 数据库连接失败");
    console.error(`   ${detail}`);
    console.error("");
    console.error(
      "dev 出现 pool timeout（active=0 idle=0）通常就是 MySQL 未就绪。",
    );
    console.error("请按顺序执行：");
    console.error(
      "  1. 复制 .env.example → .env，确认 DATABASE_URL 端口与 MYSQL_PORT 一致",
    );
    console.error(
      "  2. Windows 请将连接串主机写成 127.0.0.1，不要用 localhost（Docker 只绑 IPv4）",
    );
    console.error("  3. docker compose up -d");
    console.error("  4. npm run db:deploy && npm run db:seed");
    console.error("  5. npm run db:ping   # 本脚本，确认连通后再 npm run dev");
    process.exit(1);
  } finally {
    await conn?.end();
  }
}

await pingDatabase();
