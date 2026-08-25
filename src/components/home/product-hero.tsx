import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";
import { HomeReveal } from "@/components/home/home-reveal";
import type {
  PublicDocumentCard,
  PublicLibraryStats,
} from "@/server/documents/public-list";

type ProductPreviewProps = {
  doc: PublicDocumentCard;
};

export function ProductPreview({ doc }: ProductPreviewProps) {
  return (
    <div className="product-frame home-glass-card mx-auto w-full max-w-2xl lg:max-w-none">
      <div className="product-frame-bar">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="text-muted-foreground truncate font-mono text-[11px]">
          docshare.app/d/{doc.slug}
        </span>
      </div>
      <div className="product-frame-body">
        <div className="bg-accent/80 h-0.5 w-full" aria-hidden />
        <div className="text-muted-foreground flex items-center justify-between px-5 py-3 text-xs">
          <span>阅读页</span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Eye className="h-3 w-3" aria-hidden />
            {doc.viewCount.toLocaleString("zh-CN")}
          </span>
        </div>
        <div className="border-border/60 border-t px-6 py-6 sm:px-8 sm:py-8">
          <p className="text-accent text-[11px] font-medium tracking-widest uppercase">
            公开文档
          </p>
          <h3 className="font-display text-foreground mt-2 text-xl leading-snug font-semibold sm:text-2xl">
            {doc.title}
          </h3>
          {doc.summary ? (
            <p className="text-muted-foreground mt-3 line-clamp-2 text-sm leading-relaxed">
              {doc.summary}
            </p>
          ) : null}
          <div className="border-border/50 mt-6 space-y-2 border-t pt-5">
            <div className="bg-muted h-2 w-4/5 animate-pulse rounded-full" />
            <div className="bg-muted/80 h-2 w-full animate-pulse rounded-full [animation-delay:120ms]" />
            <div className="bg-muted/60 h-2 w-11/12 animate-pulse rounded-full [animation-delay:240ms]" />
          </div>
        </div>
      </div>
      <Link
        href={`/d/${doc.slug}`}
        className="border-border bg-card text-foreground hover:border-accent/40 hover:text-accent absolute -bottom-4 left-1/2 inline-flex -translate-x-1/2 cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium shadow-lg transition-all duration-200 hover:-translate-y-0.5 sm:text-sm"
      >
        查看真实页面
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );
}

type ProductHeroProps = {
  featured?: PublicDocumentCard;
  stats: PublicLibraryStats;
};

export function ProductHero({ featured, stats }: ProductHeroProps) {
  return (
    <section className="home-hero-mesh relative overflow-hidden pt-12 pb-24 sm:pt-16 sm:pb-32 lg:pt-20">
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-10">
        <div>
          <span className="home-badge home-stagger-1">文档阅读与分享平台</span>
          <h1 className="home-stagger-2 font-display text-foreground mt-6 text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-[3.5rem]">
            企业级文档发布，
            <span className="text-accent">读者级</span>
            沉浸体验
          </h1>
          <p className="home-stagger-3 text-muted-foreground mt-6 max-w-lg text-base leading-relaxed sm:text-lg">
            在后台用 Markdown 创作，一键生成永久链接或受控分享。
            阅读端专为长文优化，让专业内容看起来同样专业。
          </p>

          <HomeReveal className="mt-8" delay={200}>
            <div className="flex flex-wrap gap-3">
              <a
                href="#showcase"
                className="bg-accent text-accent-foreground inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-[0_4px_14px_rgba(217,119,87,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95"
              >
                浏览文档精选
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <Link
                href="/admin/login"
                className="border-border bg-card text-foreground hover:border-accent/30 inline-flex cursor-pointer items-center rounded-full border px-6 py-3 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
              >
                进入管理后台
              </Link>
            </div>
          </HomeReveal>

          {stats.documentCount > 0 ? (
            <HomeReveal delay={280}>
              <dl className="border-border/60 mt-12 grid grid-cols-2 gap-6 border-t pt-8 sm:max-w-sm">
                <div>
                  <dt className="text-muted-foreground text-xs">公开文档</dt>
                  <dd className="text-foreground mt-1 text-2xl font-semibold tabular-nums">
                    {stats.documentCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">累计阅读</dt>
                  <dd className="text-foreground mt-1 text-2xl font-semibold tabular-nums">
                    {stats.totalViews.toLocaleString("zh-CN")}
                  </dd>
                </div>
              </dl>
            </HomeReveal>
          ) : null}
        </div>

        <HomeReveal delay={120} className="relative lg:pl-4">
          <div className={featured ? "home-float" : undefined}>
            {featured ? (
              <ProductPreview doc={featured} />
            ) : (
              <div className="product-frame text-muted-foreground mx-auto flex aspect-[4/3] max-w-lg items-center justify-center p-8 text-center text-sm">
                发布第一篇公开文档后，这里将展示真实阅读预览
              </div>
            )}
          </div>
        </HomeReveal>
      </div>
    </section>
  );
}
