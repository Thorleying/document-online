import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, TrendingUp, UserRound, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatCard } from "@/components/admin/stat-card";
import { StatsChannelTable } from "@/components/admin/stats-channel-table";
import { StatsTrendChart } from "@/components/admin/stats-trend-chart";
import { summarizeDailyTrend } from "@/server/analytics/dto";
import { getDocumentChannelStats } from "@/server/analytics/queries";
import { verifySession } from "@/server/auth/dal";
import { getDocumentForEdit } from "@/server/documents/service";

const TREND_DAYS = 30;

export default async function DocumentStatsPage({
  params,
}: PageProps<"/admin/documents/[id]/stats">) {
  await verifySession();

  const { id } = await params;
  let docId: bigint;
  try {
    docId = BigInt(id);
  } catch {
    notFound();
  }

  const doc = await getDocumentForEdit(docId);
  if (!doc) {
    notFound();
  }

  const { trend, channels } = await getDocumentChannelStats(docId, TREND_DAYS);
  const summary = summarizeDailyTrend(trend);

  return (
    <>
      <AdminHeader
        title="数据统计"
        description={`文档《${doc.title}》· 近 ${TREND_DAYS} 天`}
        actions={
          <Link
            href={`/admin/documents/${doc.id}/edit`}
            className="border-border bg-card hover:bg-muted inline-flex rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          >
            返回编辑
          </Link>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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

        <div className="mt-6">
          <StatsTrendChart points={trend} />
        </div>

        <div className="mt-6">
          <StatsChannelTable items={channels} documentSlug={doc.slug} />
        </div>
      </div>
    </>
  );
}
