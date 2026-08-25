import "server-only";

/**
 * 将时间点归一到 doc_daily_stats.stat_date 使用的日期值。
 *
 * 统计口径按服务器本地日历日切分；@db.Date 列经 Prisma 写入时取 Date 对象的
 * UTC 日期部分，因此这里用本地年月日构造 UTC 零点，保证「本地的一天」落到
 * 同一个 stat_date。
 *
 * @param now - 任意时间点
 * @returns 对应本地日历日的 UTC 零点 Date
 */
export function toStatDate(now: Date): Date {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/**
 * 返回时间点所在服务器本地日历日的 [起, 止) 实际时间范围，
 * 供 view_logs 的当日去重与明细查询使用。
 *
 * @param now - 任意时间点
 */
export function getLocalDayRange(now: Date): { start: Date; end: Date } {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

/**
 * 返回从 now 往前数 days 天（含当天）的首日，用于趋势查询的时间下界。
 *
 * @param now - 基准时间点
 * @param days - 窗口天数，最小为 1
 */
export function getTrendStart(now: Date, days: number): Date {
  const span = Math.max(1, days);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - (span - 1));
  return start;
}
