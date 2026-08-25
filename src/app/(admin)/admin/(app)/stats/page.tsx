import { Eye, TrendingUp, UserRound, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatCard } from "@/components/admin/stat-card";
import { StatsRecentTable } from "@/components/admin/stats-recent-table";
import { StatsRefererList } from "@/components/admin/stats-referer-list";
import { StatsTrendChart } from "@/components/admin/stats-trend-chart";
import { summarizeDailyTrend } from "@/server/analytics/dto";
import {
  getDailyTrend,
  getRecentViews,
  getTopReferers,
} from "@/server/analytics/queries";

const TREND_DAYS = 30;
const TOP_REFERERS = 8;
const RECENT_VIEWS = 20;

export default async function AdminStatsPage() {
  const [trend, referers, recent] = await Promise.all([
    getDailyTrend(TREND_DAYS),
    getTopReferers(TREND_DAYS, TOP_REFERERS),
    getRecentViews(RECENT_VIEWS),
  ]);
  const summary = summarizeDailyTrend(trend);

  return (
    <>
      <AdminHeader
        title="数据统计"
        description="每日访问人数、来源分布与最近访问记录"
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="今日浏览（PV）"
            value={summary.todayPv.toLocaleString("zh-CN")}
            icon={Eye}
            tone="accent"
          />
          <StatCard
            label="今日访客（UV）"
            value={summary.todayUv.toLocaleString("zh-CN")}
            icon={UserRound}
            tone="accent"
          />
          <StatCard
            label={`近 ${TREND_DAYS} 天浏览`}
            value={summary.totalPv.toLocaleString("zh-CN")}
            icon={TrendingUp}
          />
          <StatCard
            label={`近 ${TREND_DAYS} 天访客`}
            value={summary.totalUv.toLocaleString("zh-CN")}
            icon={Users}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <StatsTrendChart points={trend} />
          </div>
          <StatsRefererList items={referers} />
        </div>

        <div className="mt-6">
          <StatsRecentTable items={recent} />
        </div>
      </div>
    </>
  );
}
