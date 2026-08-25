import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type ShareAccessCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
};

/**
 * 分享入口的状态卡片外框：密码门、已过期、已停用共用同一版式，
 * 保持与阅读端一致的暖纸底 editorial 气质。
 */
export function ShareAccessCard({
  icon: Icon,
  title,
  description,
  children,
}: ShareAccessCardProps) {
  return (
    <div className="bg-reader-paper relative flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(217,119,87,0.07),transparent_60%)]"
      />

      <main className="relative flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <div className="border-border bg-card rounded-2xl border p-8 shadow-[0_16px_40px_-16px_rgba(29,29,27,0.14)] sm:p-10">
            <span className="bg-accent/10 text-accent inline-flex h-12 w-12 items-center justify-center rounded-full">
              <Icon className="h-5 w-5" aria-hidden />
            </span>

            <h1 className="text-foreground mt-6 font-serif text-2xl leading-snug font-semibold tracking-tight">
              {title}
            </h1>
            <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed">
              {description}
            </p>

            {children ? <div className="mt-7">{children}</div> : null}
          </div>

          <p className="text-reader-muted mt-8 text-center text-sm">
            <Link
              href="/"
              className="hover:text-accent cursor-pointer transition-colors duration-200"
            >
              DocShare · 在线文档阅读
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
