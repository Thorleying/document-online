import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getOptionalSession } from "@/server/auth/dal";

export default async function AdminLoginPage() {
  const session = await getOptionalSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="bg-background hidden w-[45%] flex-col justify-between p-10 lg:flex xl:p-14">
        <div>
          <Link
            href="/"
            className="text-muted-foreground hover:text-accent text-sm"
          >
            ← 返回首页
          </Link>
          <h1 className="text-foreground mt-10 font-serif text-4xl leading-tight font-semibold tracking-tight">
            DocShare
          </h1>
          <p className="text-muted-foreground mt-4 max-w-sm text-base leading-relaxed">
            在线文档阅读与分享平台。撰写
            Markdown，通过永久链接或受控分享对外发布。
          </p>
        </div>
        <p className="text-muted-foreground text-sm">
          暖色 editorial 阅读体验 · Claude 风格设计
        </p>
      </aside>

      <main className="bg-card flex flex-1 flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link
              href="/"
              className="text-muted-foreground hover:text-accent text-sm"
            >
              ← 返回首页
            </Link>
          </div>
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            管理后台登录
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            使用管理员账号登录以管理文档
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}
