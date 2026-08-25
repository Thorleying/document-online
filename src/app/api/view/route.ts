import type { NextRequest } from "next/server";
import { z } from "zod";
import { config } from "@/config";
import { trackView } from "@/server/analytics/record";
import { createFixedWindowLimiter } from "@/server/analytics/rate-limit";

// 进程内固定窗口限流，Redis 版在第四期替换（见 AGENTS.md 已知基线问题）。
const limiter = createFixedWindowLimiter({
  windowMs: config.viewRateLimitWindowSec * 1000,
  max: config.viewRateLimitMax,
});

const bodySchema = z
  .object({
    slug: z.string().trim().min(1).max(180).optional(),
    token: z.string().trim().min(1).max(32).optional(),
    visitorId: z.string().trim().min(8).max(64),
    // referer 只信 body（页面里的 document.referrer）。
    // 不回退 Referer 请求头：fetch 的该头指向阅读页自身，会污染来源统计。
    referer: z.string().max(500).nullish(),
  })
  .refine((body) => (body.slug === undefined) !== (body.token === undefined), {
    message: "slug 与 token 必须二选一",
  });

/** 从代理头解析客户端 IP，取 X-Forwarded-For 最左侧一跳。 */
function clientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || null;
}

/**
 * 匿名浏览埋点，对外唯一写接口。
 * 目标不可见（不存在/未发布/链接失效）时静默丢弃并同样返回 204，
 * 避免本接口成为探测文档存在性的旁路。
 */
export async function POST(request: NextRequest): Promise<Response> {
  const ip = clientIp(request);

  if (!limiter.check(ip ?? "unknown")) {
    return new Response(null, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "请求参数不合法" }, { status: 400 });
  }

  const { slug, token, visitorId, referer } = parsed.data;

  await trackView({
    target:
      slug !== undefined
        ? { kind: "permanent", slug }
        : { kind: "share", token: token as string },
    visitorId,
    ip,
    ua: request.headers.get("user-agent"),
    referer: referer ?? null,
  });

  return new Response(null, { status: 204 });
}
