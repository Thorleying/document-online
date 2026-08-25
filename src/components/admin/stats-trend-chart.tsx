import type { DailyTrendPoint } from "@/server/analytics/dto";

type StatsTrendChartProps = {
  points: DailyTrendPoint[];
};

function barHeight(value: number, max: number): string {
  return `${((value / max) * 100).toFixed(2)}%`;
}

export function StatsTrendChart({ points }: StatsTrendChartProps) {
  const maxPv = Math.max(...points.map((p) => p.pv), 1);
  const hasData = points.some((p) => p.pv > 0);
  const first = points.at(0);
  const last = points.at(-1);

  return (
    <div className="border-border bg-card rounded-xl border p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-foreground text-base font-semibold">
          每日访问趋势
        </h2>
        <div className="text-muted-foreground flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-accent/25 h-2.5 w-2.5 rounded-sm" aria-hidden />
            浏览（PV）
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-accent h-2.5 w-2.5 rounded-sm" aria-hidden />
            访客（UV）
          </span>
        </div>
      </div>

      {hasData ? (
        <>
          <div className="border-border mt-5 flex h-40 items-end gap-px border-b sm:gap-0.5">
            {points.map((point) => (
              <div
                key={point.date}
                title={`${point.date}：浏览 ${point.pv} · 访客 ${point.uv}`}
                className="hover:bg-muted/40 relative h-full flex-1 rounded-t-sm"
              >
                <div
                  className="bg-accent/25 absolute bottom-0 w-full rounded-t-sm"
                  style={{ height: barHeight(point.pv, maxPv) }}
                />
                <div
                  className="bg-accent absolute bottom-0 w-full rounded-t-sm"
                  style={{ height: barHeight(point.uv, maxPv) }}
                />
              </div>
            ))}
          </div>
          <div className="text-muted-foreground mt-2 flex justify-between text-xs tabular-nums">
            <span>{first?.date}</span>
            <span>{last?.date}</span>
          </div>
        </>
      ) : (
        <div className="border-border text-muted-foreground mt-5 rounded-lg border border-dashed px-6 py-12 text-center text-sm">
          暂无访问数据，等第一位读者到来后这里会出现趋势图。
        </div>
      )}
    </div>
  );
}
