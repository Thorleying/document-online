import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <main className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          在线文档阅读与分享
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          管理员在后台撰写 Markdown
          文档，通过永久链接或分享链接对外发布，并统计浏览量。
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/admin/login"
            className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            进入管理后台
          </Link>
        </div>
      </main>
    </div>
  );
}
