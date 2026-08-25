import "server-only";

type LimiterOptions = {
  /** 窗口长度（毫秒）。 */
  windowMs: number;
  /** 单个 key 在窗口内允许的最大请求数。 */
  max: number;
};

type WindowEntry = {
  windowStart: number;
  count: number;
};

/** 防止长时间运行后 Map 无界增长的清理阈值。 */
const PRUNE_THRESHOLD = 10_000;

export type FixedWindowLimiter = {
  /**
   * 判定一次请求是否放行。放行时计数 +1。
   *
   * @param key - 限流维度，通常是客户端 IP
   * @param now - 当前时间戳（毫秒），测试时可注入
   */
  check(key: string, now?: number): boolean;
};

/**
 * 创建进程内固定窗口限流器。
 *
 * 说明：这是第四期接入 Redis 前的临时方案，计数只在单进程内有效，
 * 多实例部署时各实例独立限流；进程重启后计数清零。对匿名埋点这种
 * 尽力而为的写入是可接受的。
 *
 * @param options - 窗口长度与窗口内最大请求数
 */
export function createFixedWindowLimiter(
  options: LimiterOptions,
): FixedWindowLimiter {
  const buckets = new Map<string, WindowEntry>();

  function prune(now: number): void {
    for (const [key, entry] of buckets) {
      if (now - entry.windowStart >= options.windowMs) {
        buckets.delete(key);
      }
    }
  }

  return {
    check(key: string, now: number = Date.now()): boolean {
      const entry = buckets.get(key);

      if (!entry || now - entry.windowStart >= options.windowMs) {
        if (buckets.size >= PRUNE_THRESHOLD) {
          prune(now);
        }
        buckets.set(key, { windowStart: now, count: 1 });
        return true;
      }

      if (entry.count >= options.max) {
        return false;
      }

      entry.count += 1;
      return true;
    },
  };
}
