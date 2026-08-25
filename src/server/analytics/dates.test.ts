import { describe, expect, it } from "vitest";
import {
  getLocalDayRange,
  getTrendStart,
  toStatDate,
} from "@/server/analytics/dates";
import { summarizeDailyTrend } from "@/server/analytics/dto";

describe("toStatDate", () => {
  it("按本地日历日归一到 UTC 零点", () => {
    const now = new Date(2026, 7, 25, 23, 59, 59);
    expect(toStatDate(now).toISOString()).toBe("2026-08-25T00:00:00.000Z");
  });

  it("同一本地日的任意时刻归一到同一天", () => {
    const morning = new Date(2026, 7, 25, 0, 0, 1);
    const night = new Date(2026, 7, 25, 23, 59, 59);
    expect(toStatDate(morning).getTime()).toBe(toStatDate(night).getTime());
  });
});

describe("getLocalDayRange", () => {
  it("返回本地日的 [起, 止) 且长度为 24 小时", () => {
    const now = new Date(2026, 7, 25, 15, 30, 0);
    const { start, end } = getLocalDayRange(now);

    expect(start.getHours()).toBe(0);
    expect(end.getTime() - start.getTime()).toBe(24 * 60 * 60 * 1000);
    expect(now.getTime()).toBeGreaterThanOrEqual(start.getTime());
    expect(now.getTime()).toBeLessThan(end.getTime());
  });
});

describe("getTrendStart", () => {
  it("窗口含当天，7 天窗口回溯 6 天", () => {
    const now = new Date(2026, 7, 25, 12, 0, 0);
    const start = getTrendStart(now, 7);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(7);
    expect(start.getDate()).toBe(19);
  });

  it("天数下限为 1", () => {
    const now = new Date(2026, 7, 25, 12, 0, 0);
    expect(getTrendStart(now, 0).getDate()).toBe(25);
  });
});

describe("summarizeDailyTrend", () => {
  it("汇总窗口合计与今日值（末位为今天）", () => {
    const summary = summarizeDailyTrend([
      { date: "2026-08-23", pv: 10, uv: 4 },
      { date: "2026-08-24", pv: 0, uv: 0 },
      { date: "2026-08-25", pv: 6, uv: 3 },
    ]);
    expect(summary).toEqual({
      todayPv: 6,
      todayUv: 3,
      totalPv: 16,
      totalUv: 7,
    });
  });

  it("空序列返回全零", () => {
    expect(summarizeDailyTrend([])).toEqual({
      todayPv: 0,
      todayUv: 0,
      totalPv: 0,
      totalUv: 0,
    });
  });
});
