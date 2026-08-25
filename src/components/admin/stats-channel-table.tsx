import type { ChannelStat } from "@/server/analytics/dto";

type StatsChannelTableProps = {
  items: ChannelStat[];
  /** 文档永久链接的 slug，用于展示 /d/{slug} 路径。 */
  documentSlug: string;
};

function channelLabel(item: ChannelStat): string {
  if (item.entry === "permanent") {
    return "永久链接";
  }
  if (item.token === null) {
    return "已删除的分享链接";
  }
  return item.remark ?? "分享链接";
}

function channelPath(item: ChannelStat, documentSlug: string): string | null {
  if (item.entry === "permanent") {
    return `/d/${documentSlug}`;
  }
  return item.token === null ? null : `/s/${item.token}`;
}

export function StatsChannelTable({
  items,
  documentSlug,
}: StatsChannelTableProps) {
  const totalPv = items.reduce((sum, item) => sum + item.pv, 0);

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
      <div className="border-border border-b px-5 py-4">
        <h2 className="text-foreground text-base font-semibold">渠道汇总</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          按入口（永久链接 / 各分享链接）汇总的浏览与访客
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-muted-foreground px-6 py-12 text-center text-sm">
          统计窗口内还没有访问数据。
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-border bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="px-4 py-3 font-medium">渠道</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  浏览（PV）
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  访客（UV）
                </th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  浏览占比
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {items.map((item) => {
                const path = channelPath(item, documentSlug);
                const percent = totalPv > 0 ? (item.pv / totalPv) * 100 : 0;
                return (
                  <tr key={item.shareLinkId} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="text-foreground max-w-56 truncate font-medium">
                        {channelLabel(item)}
                      </div>
                      {path ? (
                        <div className="text-muted-foreground truncate font-mono text-xs">
                          {path}
                        </div>
                      ) : null}
                    </td>
                    <td className="text-foreground px-4 py-3 tabular-nums">
                      {item.pv.toLocaleString("zh-CN")}
                    </td>
                    <td className="text-foreground px-4 py-3 tabular-nums">
                      {item.uv.toLocaleString("zh-CN")}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted h-1.5 w-28 overflow-hidden rounded-full">
                          <div
                            className="bg-accent h-full rounded-full"
                            style={{ width: `${percent.toFixed(2)}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {percent.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
