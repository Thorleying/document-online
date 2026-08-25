import Link from "next/link";
import { Eye, FileText, FilePenLine, TrendingUp } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatCard } from "@/components/admin/stat-card";
import { DocumentStatus } from "@/generated/prisma/client";
import { listDocuments } from "@/server/documents/service";
import { getAdminDashboardStats } from "@/server/documents/stats";

function statusLabel(status: DocumentStatus) {
  const map: Record<DocumentStatus, string> = {
    DRAFT: "草稿",
    PUBLISHED: "已发布",
    ARCHIVED: "已归档",
  };
  return map[status];
}

export default async function AdminDashboardPage() {
  const [stats, documents] = await Promise.all([
    getAdminDashboardStats(),
    listDocuments(),
  ]);

  const recent = documents.slice(0, 5);

  return (
    <>
      <AdminHeader title="概览" description="文档发布与阅读数据一览" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="文档总数"
            value={stats.totalDocuments}
            icon={FileText}
          />
          <StatCard
            label="已发布"
            value={stats.publishedCount}
            icon={TrendingUp}
            tone="accent"
          />
          <StatCard label="草稿" value={stats.draftCount} icon={FilePenLine} />
          <StatCard
            label="累计浏览"
            value={stats.totalViews.toLocaleString("zh-CN")}
            icon={Eye}
            tone="accent"
          />
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-foreground text-base font-semibold">
              最近更新
            </h2>
            <Link
              href="/admin/documents"
              className="text-accent text-sm hover:underline"
            >
              查看全部
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="border-border bg-card text-muted-foreground rounded-xl border border-dashed px-6 py-12 text-center text-sm">
              还没有文档。
              <Link
                href="/admin/documents/new"
                className="text-accent ml-1 hover:underline"
              >
                创建第一篇
              </Link>
            </div>
          ) : (
            <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-border bg-muted/50 text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">标题</th>
                    <th className="px-4 py-3 font-medium">状态</th>
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">
                      浏览
                    </th>
                    <th className="px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {recent.map((doc) => (
                    <tr key={doc.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="text-foreground font-medium">
                          {doc.title}
                        </div>
                        <div className="text-muted-foreground font-mono text-xs">
                          /d/{doc.slug}
                        </div>
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {statusLabel(doc.status)}
                      </td>
                      <td className="text-muted-foreground hidden px-4 py-3 tabular-nums sm:table-cell">
                        {doc.viewCount}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/documents/${doc.id}/edit`}
                          className="text-accent hover:underline"
                        >
                          编辑
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
