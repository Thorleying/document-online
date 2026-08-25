import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { ReaderProgress } from "@/components/reader/reader-progress";

type ReaderShellProps = {
  title: string;
  summary?: string | null;
  viewCount: number;
  publishedLabel?: string;
  children: React.ReactNode;
};

export function ReaderShell({
  title,
  summary,
  viewCount,
  publishedLabel,
  children,
}: ReaderShellProps) {
  return (
    <div className="bg-reader-paper min-h-screen">
      <ReaderProgress />

      <header className="border-border/80 bg-reader-paper/90 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-reader-muted hover:text-accent inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            首页
          </Link>
          <span className="text-reader-muted inline-flex items-center gap-1.5 text-xs tabular-nums">
            <Eye className="h-3.5 w-3.5" aria-hidden />
            {viewCount.toLocaleString("zh-CN")} 次阅读
          </span>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="border-border mb-10 border-b pb-8">
          {publishedLabel ? (
            <p className="text-accent mb-3 text-xs font-medium tracking-wide uppercase">
              {publishedLabel}
            </p>
          ) : null}
          <h1 className="text-reader-ink font-serif text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {summary ? (
            <p className="text-reader-muted mt-5 text-lg leading-relaxed">
              {summary}
            </p>
          ) : null}
        </header>

        <div className="reader-prose">{children}</div>
      </article>

      <footer className="border-border text-reader-muted border-t py-8 text-center text-sm">
        <Link href="/" className="hover:text-accent">
          DocShare · 在线文档阅读
        </Link>
      </footer>
    </div>
  );
}
