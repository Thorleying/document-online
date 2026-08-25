import Link from "next/link";
import { Eye } from "lucide-react";
import { deleteDocumentAction } from "@/server/documents/actions";
import type { DocumentListItemDto } from "@/server/documents/dto";
import { DocumentStatus, DocumentVisibility } from "@/generated/prisma/client";
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_VISIBILITY_LABELS,
} from "@/lib/document-labels";

function statusBadge(status: DocumentStatus) {
  const map: Record<DocumentStatus, string> = {
    [DocumentStatus.DRAFT]: "bg-amber-50 text-amber-800 ring-amber-200",
    [DocumentStatus.PUBLISHED]:
      "bg-emerald-50 text-emerald-800 ring-emerald-200",
    [DocumentStatus.ARCHIVED]: "bg-muted text-muted-foreground ring-border",
  };
  return map[status];
}

type DocumentsTableProps = {
  documents: DocumentListItemDto[];
};

export function DocumentsTable({ documents }: DocumentsTableProps) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-border bg-muted/50 text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-3 font-medium">标题</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">可见性</th>
              <th className="px-4 py-3 font-medium">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" aria-hidden />
                  浏览
                </span>
              </th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                更新
              </th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="text-foreground font-medium">{doc.title}</div>
                  <div className="text-muted-foreground font-mono text-xs">
                    /d/{doc.slug}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadge(doc.status)}`}
                  >
                    {DOCUMENT_STATUS_LABELS[doc.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      doc.visibility === DocumentVisibility.PUBLIC
                        ? "text-accent"
                        : "text-muted-foreground"
                    }
                  >
                    {DOCUMENT_VISIBILITY_LABELS[doc.visibility]}
                  </span>
                </td>
                <td className="text-muted-foreground px-4 py-3 tabular-nums">
                  {doc.viewCount.toLocaleString("zh-CN")}
                </td>
                <td className="text-muted-foreground hidden px-4 py-3 md:table-cell">
                  {new Date(doc.updatedAt).toLocaleString("zh-CN")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {doc.status === DocumentStatus.PUBLISHED &&
                    doc.visibility === DocumentVisibility.PUBLIC ? (
                      <Link
                        href={`/d/${doc.slug}`}
                        target="_blank"
                        className="text-muted-foreground hover:text-accent"
                      >
                        预览
                      </Link>
                    ) : null}
                    <Link
                      href={`/admin/documents/${doc.id}/edit`}
                      className="text-accent hover:underline"
                    >
                      编辑
                    </Link>
                    <Link
                      href={`/admin/documents/${doc.id}/shares`}
                      className="text-accent hover:underline"
                    >
                      分享
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
    </div>
  );
}
