import Link from "next/link";

export function HomeFooter() {
  return (
    <footer className="border-border/60 bg-card/30 border-t">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row sm:px-8 lg:px-10">
        <div className="flex items-center gap-2">
          <span className="bg-accent text-accent-foreground inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold">
            D
          </span>
          <span className="text-foreground font-semibold">DocShare</span>
        </div>
        <p className="text-muted-foreground text-sm">
          在线文档阅读与分享 · 为清晰表达而生
        </p>
        <Link
          href="/admin/login"
          className="text-muted-foreground hover:text-accent text-sm transition-colors"
        >
          管理后台
        </Link>
      </div>
    </footer>
  );
}
