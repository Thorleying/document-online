import { describe, expect, it } from "vitest";
import { createFixedWindowLimiter } from "@/server/analytics/rate-limit";

describe("createFixedWindowLimiter", () => {
  it("窗口内不超过 max 时放行", () => {
    const limiter = createFixedWindowLimiter({ windowMs: 60_000, max: 3 });
    const t0 = 1_000_000;

    expect(limiter.check("1.2.3.4", t0)).toBe(true);
    expect(limiter.check("1.2.3.4", t0 + 100)).toBe(true);
    expect(limiter.check("1.2.3.4", t0 + 200)).toBe(true);
  });

  it("窗口内超过 max 后拒绝", () => {
    const limiter = createFixedWindowLimiter({ windowMs: 60_000, max: 2 });
    const t0 = 1_000_000;

    expect(limiter.check("1.2.3.4", t0)).toBe(true);
    expect(limiter.check("1.2.3.4", t0 + 100)).toBe(true);
    expect(limiter.check("1.2.3.4", t0 + 200)).toBe(false);
  });

  it("跨窗口后重新计数", () => {
    const limiter = createFixedWindowLimiter({ windowMs: 60_000, max: 1 });
    const t0 = 1_000_000;

    expect(limiter.check("1.2.3.4", t0)).toBe(true);
    expect(limiter.check("1.2.3.4", t0 + 1)).toBe(false);
    expect(limiter.check("1.2.3.4", t0 + 60_000)).toBe(true);
  });

  it("不同 key 互不影响", () => {
    const limiter = createFixedWindowLimiter({ windowMs: 60_000, max: 1 });
    const t0 = 1_000_000;

    expect(limiter.check("1.2.3.4", t0)).toBe(true);
    expect(limiter.check("5.6.7.8", t0)).toBe(true);
    expect(limiter.check("1.2.3.4", t0 + 1)).toBe(false);
    expect(limiter.check("5.6.7.8", t0 + 1)).toBe(false);
  });
});
