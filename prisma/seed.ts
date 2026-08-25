import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL 未设置，无法执行 seed");
}

const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

const DEFAULT_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123456";

async function main() {
  const existing = await prisma.user.findUnique({
    where: { username: DEFAULT_USERNAME },
  });

  if (existing) {
    console.log(`管理员已存在：${DEFAULT_USERNAME}，跳过 seed`);
    return;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  await prisma.user.create({
    data: {
      username: DEFAULT_USERNAME,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`已创建管理员：${DEFAULT_USERNAME}`);
  console.log("请在首次登录后立即修改密码。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
