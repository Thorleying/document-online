/** 日趋势数据点。date 为 YYYY-MM-DD（服务器本地日历日）。 */
export type DailyTrendPoint = {
  date: string;
  pv: number;
  uv: number;
};

/** 趋势汇总：今日与整个窗口的 PV/UV 合计。 */
export type TrendSummary = {
  todayPv: number;
  todayUv: number;
  totalPv: number;
  totalUv: number;
};

/** 来源分布项。source 已归一（host 或「直接访问」）。 */
export type RefererStat = {
  source: string;
  count: number;
};

/** 单个入口渠道（永久链接或某条分享链接）在统计窗口内的 PV/UV 汇总。 */
export type ChannelStat = {
  /** doc_daily_stats.share_link_id 的字符串形式，"0" 表示永久链接入口。 */
  shareLinkId: string;
  entry: "permanent" | "share";
  /** 分享链接备注；永久链接入口或链接已被删除时为 null。 */
  remark: string | null;
  /** 分享链接 token；永久链接入口或链接已被删除时为 null。 */
  token: string | null;
  pv: number;
  uv: number;
};

/** 单文档分渠道统计：窗口内整体日趋势（已补零）与各渠道汇总。 */
export type DocumentChannelStats = {
  trend: DailyTrendPoint[];
  channels: ChannelStat[];
};

/** 最近访问明细项，字段均已序列化为可跨越到客户端的原始类型。 */
export type RecentViewItem = {
  id: string;
  documentTitle: string;
  documentSlug: string;
  entry: "permanent" | "share";
  shareRemark: string | null;
  source: string;
  deviceType: string | null;
  visitorId: string;
  /** 访问时间，ISO 8601。 */
  viewedAt: string;
};

/**
 * 从日趋势序列计算汇总卡片所需的合计值。
 *
 * @param points - getDailyTrend 返回的完整（已补零）序列，末位为今天
 */
export function summarizeDailyTrend(points: DailyTrendPoint[]): TrendSummary {
  const today = points.at(-1);
  return {
    todayPv: today?.pv ?? 0,
    todayUv: today?.uv ?? 0,
    totalPv: points.reduce((sum, p) => sum + p.pv, 0),
    totalUv: points.reduce((sum, p) => sum + p.uv, 0),
  };
}
