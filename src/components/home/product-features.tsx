import { BarChart3, FileText, Link2, ShieldCheck } from "lucide-react";
import { HomeReveal } from "@/components/home/home-reveal";

const features = [
  {
    icon: FileText,
    title: "Markdown 原生创作",
    description:
      "后台直接撰写 Markdown，保存时自动渲染净化 HTML，内容安全且格式稳定。",
  },
  {
    icon: Link2,
    title: "永久链接 & 分享",
    description:
      "每篇文档拥有唯一 slug，支持公开永久链接与私有分享 token，访问策略由服务端统一判定。",
  },
  {
    icon: ShieldCheck,
    title: "精细化可见性",
    description:
      "公开、私有、草稿、归档状态组合控制，private 文档对外统一 404，避免信息泄露。",
  },
  {
    icon: BarChart3,
    title: "阅读数据统计",
    description: "浏览量实时汇总至管理端概览，为内容运营提供基础数据支撑。",
  },
];

export function ProductFeatures() {
  return (
    <section
      id="features"
      className="border-border/60 bg-card/50 border-y py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <HomeReveal>
          <div className="max-w-2xl">
            <p className="home-section-label">产品能力</p>
            <h2 className="font-display text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              为文档团队打造的全链路能力
            </h2>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed">
              从创作、发布到阅读与分析，DocShare 覆盖在线文档场景的核心环节。
            </p>
          </div>
        </HomeReveal>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {features.map(({ icon: Icon, title, description }, index) => (
            <HomeReveal key={title} delay={index * 90}>
              <li className="home-feature-card home-glass-card group border-border hover:border-accent/25 h-full cursor-default rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(29,29,27,0.08)]">
                <span className="bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground inline-flex rounded-xl p-3 transition-colors duration-200">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="text-foreground mt-5 text-base font-semibold">
                  {title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {description}
                </p>
              </li>
            </HomeReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
