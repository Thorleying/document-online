import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";
import { getOptionalSession } from "@/server/auth/dal";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  const session = await getOptionalSession();
  if (session) {
    redirect("/admin/documents");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
            ← 返回首页
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-zinc-900">
            管理后台登录
          </h1>
          <p className="mt-1 text-sm text-zinc-500">在线文档阅读与分享</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
