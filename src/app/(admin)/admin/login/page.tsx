import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { getOptionalSession } from "@/server/auth/dal";

export const metadata: Metadata = {
  title: "管理后台登录 · DocShare",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getOptionalSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="home-hero-mesh relative flex min-h-dvh flex-col">
      <header className="relative flex items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="text-muted-foreground hover:text-accent inline-flex items-center gap-1.5 text-sm transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          返回首页
        </Link>
        <span className="text-foreground font-serif text-lg font-semibold tracking-tight">
          DocShare
        </span>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
        <section className="sm:border-border sm:bg-card sm:shadow-primary/5 w-full max-w-md py-4 sm:rounded-2xl sm:border sm:p-10 sm:shadow-lg">
          <p className="text-accent text-xs font-medium tracking-[0.14em] uppercase">
            Admin Console
          </p>
          <h1 className="text-foreground mt-3 font-serif text-3xl font-semibold tracking-tight">
            管理后台登录
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            使用管理员账号登录，管理文档、分享链接与浏览统计
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>

          <p className="text-muted-foreground border-border mt-8 border-t pt-5 text-xs leading-relaxed">
            仅限受邀管理员使用，忘记密码请联系站点维护者重置。
          </p>
        </section>
      </main>

      <footer className="text-muted-foreground relative pb-8 text-center text-xs">
        暖色 editorial 阅读体验 · 为长文而生
      </footer>
    </div>
  );
}
