import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "accent";
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: StatCardProps) {
  return (
    <div className="border-border bg-card rounded-xl border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="text-foreground mt-2 text-2xl font-semibold tabular-nums">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "rounded-lg p-2.5",
            tone === "accent"
              ? "bg-accent/10 text-accent"
              : "bg-muted text-primary",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </div>
  );
}
