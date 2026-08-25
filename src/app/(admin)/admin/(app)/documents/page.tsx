import Link from "next/link";
import { listDocuments } from "@/server/documents/service";
import { deleteDocumentAction } from "@/server/documents/actions";
import { DocumentStatus, DocumentVisibility } from "@/generated/prisma/client";

function statusBadge(status: DocumentStatus) {
  const map: Record<DocumentStatus, string> = {
    DRAFT: "bg-amber-100 text-amber-800",
    PUBLISHED: "bg-emerald-100 text-emerald-800",
    ARCHIVED: "bg-zinc-100 text-zinc-600",
  };
  return map[status];
}

export default async function DocumentsPage() {
  const documents = await listDocuments();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">文档</h1>
          <p className="mt-1 text-sm text-zinc-500">共 {documents.length} 篇</p>
        </div>
        <Link
          href="/admin/documents/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          新建文档
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-500">
          还没有文档，点击「新建文档」开始撰写。
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-4 py-3 font-medium">标题</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">可见性</th>
                <th className="px-4 py-3 font-medium">浏览</th>
                <th className="px-4 py-3 font-medium">更新</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-zinc-50/80">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900">{doc.title}</div>
                    <div className="font-mono text-xs text-zinc-400">
                      /d/{doc.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(doc.status)}`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        doc.visibility === DocumentVisibility.PUBLIC
                          ? "text-orange-600"
                          : "text-zinc-600"
                      }
                    >
                      {doc.visibility}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 tabular-nums">
                    {doc.viewCount}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(doc.updatedAt).toLocaleString("zh-CN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/documents/${doc.id}/edit`}
                        className="text-zinc-700 hover:text-zinc-900"
                      >
                        编辑
                      </Link>
                      <form action={deleteDocumentAction}>
                        <input type="hidden" name="id" value={doc.id} />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-800"
                        >
                          删除
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
