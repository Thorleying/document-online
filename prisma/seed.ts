import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { renderMarkdownToSafeHtml } from "../src/lib/markdown/render";
import {
  DEMO_API_GUIDE,
  DEMO_ARCHIVED_SPEC,
  DEMO_ONBOARDING,
  DEMO_PRODUCT_ROADMAP,
  DEMO_RETRO_TEMPLATE,
  DEMO_SECURITY_CHECKLIST,
} from "./demo-documents";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL 未设置，无法执行 seed");
}

const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

const DEFAULT_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123456";

async function ensureAdmin() {
  const existing = await prisma.user.findUnique({
    where: { username: DEFAULT_USERNAME },
  });

  if (existing) {
    console.log(`管理员已存在：${DEFAULT_USERNAME}`);
    return existing;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const user = await prisma.user.create({
    data: {
      username: DEFAULT_USERNAME,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`已创建管理员：${DEFAULT_USERNAME}`);
  console.log("请在首次登录后立即修改密码。");
  return user;
}

type DemoDocInput = {
  title: string;
  slug: string;
  summary: string;
  contentMd: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  visibility: "PUBLIC" | "PRIVATE";
  allowIndex: boolean;
  viewCount: number;
  publishedAt?: Date;
};

async function seedDemoDocuments(authorId: bigint) {
  const existingCount = await prisma.document.count();
  if (existingCount > 0) {
    console.log(`已有 ${existingCount} 篇文档，跳过演示数据`);
    return;
  }

  const productCategory = await prisma.category.upsert({
    where: { slug: "product" },
    create: { name: "产品", slug: "product", sortOrder: 1 },
    update: {},
  });

  const techCategory = await prisma.category.upsert({
    where: { slug: "engineering" },
    create: { name: "技术", slug: "engineering", sortOrder: 2 },
    update: {},
  });

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const demos: DemoDocInput[] = [
    {
      title: "2026 产品路线图",
      slug: "product-roadmap-2026",
      summary: "年度产品方向、季度里程碑与关键指标，面向产品、研发与运营团队。",
      contentMd: DEMO_PRODUCT_ROADMAP,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      allowIndex: true,
      viewCount: 1284,
      publishedAt: monthAgo,
    },
    {
      title: "REST API 设计指南",
      slug: "api-design-guide",
      summary: "资源导向、版本前缀、统一错误体与分页约定。",
      contentMd: DEMO_API_GUIDE,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      allowIndex: true,
      viewCount: 856,
      publishedAt: weekAgo,
    },
    {
      title: "上线前安全清单",
      slug: "security-checklist",
      summary: "认证、内容安全、访问控制与基础设施上线前逐项确认。",
      contentMd: DEMO_SECURITY_CHECKLIST,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      allowIndex: false,
      viewCount: 432,
      publishedAt: weekAgo,
    },
    {
      title: "客户 Onboarding 手册",
      slug: "client-onboarding-playbook",
      summary: "内部客户接入流程，仅通过分享链接访问。",
      contentMd: DEMO_ONBOARDING,
      status: "PUBLISHED",
      visibility: "PRIVATE",
      allowIndex: false,
      viewCount: 89,
      publishedAt: weekAgo,
    },
    {
      title: "周回顾模板",
      slug: "weekly-retro-template",
      summary: "团队周会回顾的结构化模板（草稿）。",
      contentMd: DEMO_RETRO_TEMPLATE,
      status: "DRAFT",
      visibility: "PRIVATE",
      allowIndex: false,
      viewCount: 0,
    },
    {
      title: "旧版规格 v1",
      slug: "legacy-spec-v1",
      summary: "已被新规格取代，保留只读参考。",
      contentMd: DEMO_ARCHIVED_SPEC,
      status: "ARCHIVED",
      visibility: "PRIVATE",
      allowIndex: false,
      viewCount: 12,
      publishedAt: monthAgo,
    },
  ];

  for (const demo of demos) {
    const contentHtml = await renderMarkdownToSafeHtml(demo.contentMd);
    const categoryId =
      demo.slug.includes("api") || demo.slug.includes("security")
        ? techCategory.id
        : productCategory.id;

    await prisma.document.create({
      data: {
        title: demo.title,
        slug: demo.slug,
        summary: demo.summary,
        contentMd: demo.contentMd,
        contentHtml,
        status: demo.status,
        visibility: demo.visibility,
        allowIndex: demo.allowIndex,
        viewCount: demo.viewCount,
        publishedAt: demo.publishedAt ?? null,
        authorId,
        categoryId,
      },
    });
  }

  console.log(`已创建 ${demos.length} 篇演示文档`);
  console.log("公开阅读示例：/d/product-roadmap-2026");
}

async function main() {
  const admin = await ensureAdmin();
  await seedDemoDocuments(admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
