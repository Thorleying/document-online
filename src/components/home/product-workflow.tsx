import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeReveal } from "@/components/home/home-reveal";

const steps = [
  {
    step: "01",
    title: "撰写",
    description:
      "在管理后台用 Markdown 编辑文档，设置标题、slug 与可见性策略。",
  },
  {
    step: "02",
    title: "发布",
    description: "一键发布生成永久链接 /d/{slug}，公开或私有由你决定。",
  },
  {
    step: "03",
    title: "分享 & 统计",
    description: "分享链接触达读者，阅读数据自动汇总至管理端概览。",
  },
];

export function ProductWorkflow() {
  return (
    <section id="workflow" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <HomeReveal>
          <div className="max-w-2xl">
            <p className="home-section-label">使用流程</p>
            <h2 className="font-display text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              三步完成文档上线
            </h2>
          </div>
        </HomeReveal>

        <ol className="mt-14 grid gap-8 lg:grid-cols-3 lg:gap-10">
          {steps.map(({ step, title, description }, index) => (
            <HomeReveal key={step} delay={index * 100}>
              <li className="relative">
                <span className="font-display text-border text-5xl font-semibold">
                  {step}
                </span>
                <h3 className="text-foreground mt-4 text-lg font-semibold">
                  {title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {description}
                </p>
              </li>
            </HomeReveal>
          ))}
        </ol>

        <HomeReveal delay={200}>
          <div className="home-cta-panel mt-16 rounded-3xl px-8 py-12 text-center sm:px-12 sm:py-16">
            <h2 className="font-display text-foreground text-2xl font-semibold sm:text-3xl">
              准备好发布你的第一篇文档？
            </h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm sm:text-base">
              登录管理后台，立即体验完整的文档创作与发布流程。
            </p>
            <Link
              href="/admin/login"
              className="bg-primary text-primary-foreground mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
            >
              免费开始使用
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </HomeReveal>
      </div>
    </section>
  );
}
