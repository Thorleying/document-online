import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ChartColumn, FileText, Share2 } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { getOptionalSession } from "@/server/auth/dal";

export const metadata: Metadata = {
  title: "管理后台登录 · DocShare",
  robots: { index: false, follow: false },
};

const features = [
  {
    icon: FileText,
    title: "Markdown 撰写",
    description: "服务端渲染与净化，阅读端零脚本注入",
  },
  {
    icon: Share2,
    title: "受控分享",
    description: "永久链接与密码、有效期可控的分享链接",
  },
  {
    icon: ChartColumn,
    title: "浏览统计",
    description: "PV / UV 按天聚合，趋势一目了然",
  },
];

function BrandPanel() {
  return (
    <aside className="home-hero-mesh relative hidden w-[46%] flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
      <Link
        href="/"
        className="text-muted-foreground hover:text-accent inline-flex w-fit items-center gap-1.5 text-sm transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        返回首页
      </Link>

      <div>
        <p className="home-section-label">Admin Console</p>
        <h1 className="text-foreground mt-4 font-serif text-4xl leading-tight font-semibold tracking-tight xl:text-5xl">
          DocShare
          <span className="text-muted-foreground mt-2 block text-xl font-normal xl:text-2xl">
            在线文档阅读与分享
          </span>
        </h1>

        <ul className="mt-10 space-y-5">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex items-start gap-3.5">
              <span className="border-border bg-card text-accent mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-foreground text-sm font-medium">{title}</p>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-muted-foreground text-sm">
        暖色 editorial 阅读体验 · 为长文而生
      </p>
    </aside>
  );
}

export default async function AdminLoginPage() {
  const session = await getOptionalSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-dvh">
      <BrandPanel />

      <main className="bg-card flex min-w-0 flex-1 flex-col justify-center px-5 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Link
              href="/"
              className="text-muted-foreground hover:text-accent inline-flex items-center gap-1.5 text-sm transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              返回首页
            </Link>
            <p className="text-foreground mt-8 font-serif text-2xl font-semibold tracking-tight">
              DocShare
            </p>
          </div>

          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            管理后台登录
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            使用管理员账号登录以管理文档与分享链接
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>

          <p className="text-muted-foreground border-border mt-10 border-t pt-6 text-xs leading-relaxed">
            仅限受邀管理员使用。忘记密码请联系站点维护者重置。
          </p>
        </div>
      </main>
    </div>
  );
}
