import "server-only";

/** 来源分布中表示「无 referer」的展示标签。 */
export const DIRECT_SOURCE_LABEL = "直接访问";

/**
 * 将原始 referer 归一为来源标识：合法 URL 取 host，空值归为「直接访问」，
 * 无法解析的字符串原样返回（截断到 100 字符防御异常输入）。
 *
 * @param referer - view_logs.referer 原始值
 */
export function refererSource(referer: string | null): string {
  if (!referer) {
    return DIRECT_SOURCE_LABEL;
  }
  try {
    const host = new URL(referer).host;
    return host || referer.slice(0, 100);
  } catch {
    return referer.slice(0, 100);
  }
}

/**
 * 从 User-Agent 粗分设备类型。只用于统计展示，不做精确 UA 解析。
 *
 * @param ua - User-Agent 字符串
 * @returns "mobile" | "tablet" | "desktop"，无 UA 时返回 null
 */
export function detectDeviceType(ua: string | null): string | null {
  if (!ua) {
    return null;
  }
  if (/ipad|tablet/i.test(ua)) {
    return "tablet";
  }
  if (/mobile|iphone|android/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

/**
 * 截断可空字符串到指定长度，用于对齐 view_logs 各列的 VARCHAR 上限。
 *
 * @param value - 原始值
 * @param maxLength - 列长度上限
 */
export function truncateColumn(
  value: string | null,
  maxLength: number,
): string | null {
  if (value === null) {
    return null;
  }
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}
