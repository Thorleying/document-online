import Link from "next/link";
import { ArrowUpRight, Eye } from "lucide-react";
import { HomeReveal } from "@/components/home/home-reveal";
import type { PublicDocumentCard } from "@/server/documents/public-list";

type ProductShowcaseProps = {
  documents: PublicDocumentCard[];
};

export function ProductShowcase({ documents }: ProductShowcaseProps) {
  return (
    <section id="showcase" className="home-dark-section py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <HomeReveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="home-section-label home-section-label-dark">
                文档精选
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                真实内容，即刻阅读
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/60">
                以下为平台已发布的公开文档，点击进入沉浸式阅读页。
              </p>
            </div>
            <span className="text-sm text-white/40 tabular-nums">
              {documents.length} 篇可阅
            </span>
          </div>
        </HomeReveal>

        {documents.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 px-6 py-16 text-center text-white/50">
            暂无公开文档，
            <Link
              href="/admin/login"
              className="text-accent cursor-pointer hover:underline"
            >
              登录后台
            </Link>
            发布第一篇。
          </div>
        ) : (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {documents.map((doc, index) => (
              <HomeReveal key={doc.slug} delay={index * 80}>
                <li>
                  <Link
                    href={`/d/${doc.slug}`}
                    className="home-showcase-card group hover:border-accent/40 flex h-full cursor-pointer flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-200 hover:-translate-y-1 hover:bg-white/[0.07] sm:p-7"
                  >
                    <span className="text-accent text-xs font-medium tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display group-hover:text-accent mt-4 text-xl leading-snug font-semibold text-white transition-colors duration-200 sm:text-2xl">
                      {doc.title}
                    </h3>
                    {doc.summary ? (
                      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-white/55">
                        {doc.summary}
                      </p>
                    ) : (
                      <div className="flex-1" />
                    )}
                    <div className="mt-6 flex items-center justify-between text-xs text-white/40">
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Eye className="h-3.5 w-3.5" aria-hidden />
                        {doc.viewCount.toLocaleString("zh-CN")}
                      </span>
                      <span className="text-accent inline-flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        阅读
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </li>
              </HomeReveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
