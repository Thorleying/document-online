import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { DocumentForm } from "@/components/admin/document-form";
import { createDocumentAction } from "@/server/documents/actions";

export default function NewDocumentPage() {
  return (
    <>
      <AdminHeader
        title="新建文档"
        description="撰写 Markdown 并设置发布策略"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <Link
          href="/admin/documents"
          className="text-muted-foreground hover:text-accent text-sm"
        >
          ← 返回列表
        </Link>
        <div className="border-border bg-card mt-4 rounded-xl border p-6 shadow-sm">
          <DocumentForm action={createDocumentAction} submitLabel="创建文档" />
        </div>
      </div>
    </>
  );
}
