import type { RefererStat } from "@/server/analytics/dto";

type StatsRefererListProps = {
  items: RefererStat[];
};

export function StatsRefererList({ items }: StatsRefererListProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="border-border bg-card rounded-xl border p-5 shadow-sm">
      <h2 className="text-foreground text-base font-semibold">来源分布</h2>
      <p className="text-muted-foreground mt-1 text-xs">
        近 30 天，按 referer 域名归并
      </p>

      {items.length === 0 ? (
        <div className="border-border text-muted-foreground mt-4 rounded-lg border border-dashed px-6 py-10 text-center text-sm">
          暂无来源数据。
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => {
            const percent = total > 0 ? (item.count / total) * 100 : 0;
            return (
              <li key={item.source}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-foreground min-w-0 truncate">
                    {item.source}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {item.count.toLocaleString("zh-CN")} · {percent.toFixed(1)}%
                  </span>
                </div>
                <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
                  <div
                    className="bg-accent h-full rounded-full"
                    style={{ width: `${percent.toFixed(2)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
