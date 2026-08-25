import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "页面未找到 · DocShare",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="bg-reader-paper relative flex min-h-dvh flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(217,119,87,0.07),transparent_60%)]"
      />

      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <p className="home-section-label">Page Not Found</p>
        <p className="text-foreground mt-4 font-serif text-7xl font-semibold tracking-tight sm:text-8xl">
          4<span className="text-accent">0</span>4
        </p>
        <h1 className="text-foreground mt-6 font-serif text-xl font-semibold tracking-tight sm:text-2xl">
          页面不存在或已被移除
        </h1>
        <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
          你访问的文档可能已被删除、设为私密，或链接地址有误。可以回到首页浏览公开文档。
        </p>

        <Link
          href="/"
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-6 text-sm font-medium transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          返回首页
        </Link>
      </main>

      <footer className="text-reader-muted relative py-8 text-center text-sm">
        <Link
          href="/"
          className="hover:text-accent cursor-pointer transition-colors duration-200"
        >
          DocShare · 在线文档阅读
        </Link>
      </footer>
    </div>
  );
}
