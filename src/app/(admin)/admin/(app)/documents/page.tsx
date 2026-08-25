import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { DocumentsTable } from "@/components/admin/documents-table";
import { listDocuments } from "@/server/documents/service";

export default async function DocumentsPage() {
  const documents = await listDocuments();

  return (
    <>
      <AdminHeader
        title="文档管理"
        description={`共 ${documents.length} 篇文档`}
        actions={
          <Link
            href="/admin/documents/new"
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden />
            新建文档
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {documents.length === 0 ? (
          <div className="border-border bg-card rounded-xl border border-dashed px-6 py-16 text-center">
            <FileText className="text-muted-foreground/60 mx-auto h-10 w-10" />
            <p className="text-muted-foreground mt-4 text-sm">
              还没有文档，点击「新建文档」开始撰写。
            </p>
          </div>
        ) : (
          <DocumentsTable documents={documents} />
        )}
      </div>
    </>
  );
}
