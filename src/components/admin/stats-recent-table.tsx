import type { RecentViewItem } from "@/server/analytics/dto";

type StatsRecentTableProps = {
  items: RecentViewItem[];
};

function formatViewedAt(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function entryLabel(item: RecentViewItem): string {
  if (item.entry === "permanent") {
    return "永久链接";
  }
  return item.shareRemark ? `分享 · ${item.shareRemark}` : "分享链接";
}

function deviceLabel(deviceType: string | null): string {
  const map: Record<string, string> = {
    mobile: "手机",
    tablet: "平板",
    desktop: "桌面",
  };
  return (deviceType && map[deviceType]) || "—";
}

export function StatsRecentTable({ items }: StatsRecentTableProps) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
      <div className="border-border border-b px-5 py-4">
        <h2 className="text-foreground text-base font-semibold">最近访问</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          最新 {items.length} 条访问明细
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-muted-foreground px-6 py-12 text-center text-sm">
          还没有访问记录。
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-border bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  访问时间
                </th>
                <th className="px-4 py-3 font-medium">文档</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  入口
                </th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  来源
                </th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  设备
                </th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">
                  访客
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="text-muted-foreground px-4 py-3 whitespace-nowrap tabular-nums">
                    {formatViewedAt(item.viewedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-foreground max-w-56 truncate font-medium">
                      {item.documentTitle}
                    </div>
                    <div className="text-muted-foreground truncate font-mono text-xs">
                      /d/{item.documentSlug}
                    </div>
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3 whitespace-nowrap sm:table-cell">
                    {entryLabel(item)}
                  </td>
                  <td className="text-muted-foreground hidden max-w-44 truncate px-4 py-3 md:table-cell">
                    {item.source}
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3 md:table-cell">
                    {deviceLabel(item.deviceType)}
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3 font-mono text-xs lg:table-cell">
                    {item.visitorId.slice(0, 8)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
