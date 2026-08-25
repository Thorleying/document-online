import Link from "next/link";
import { logoutAction } from "@/server/auth/actions";
import { verifySession } from "@/server/auth/dal";

export default async function AdminAppLayout({
  children,
}: LayoutProps<"/admin">) {
  const session = await verifySession();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/admin/documents"
              className="font-semibold text-zinc-900"
            >
              文档管理
            </Link>
          </nav>
          <div className="flex items-center gap-4 text-sm text-zinc-600">
            <span>{session.username}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-zinc-500 hover:text-zinc-900"
              >
                退出
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
