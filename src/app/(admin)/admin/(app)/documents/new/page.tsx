import Link from "next/link";
import { DocumentForm } from "@/components/admin/document-form";
import { createDocumentAction } from "@/server/documents/actions";

export default function NewDocumentPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/documents"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← 返回列表
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">新建文档</h1>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <DocumentForm action={createDocumentAction} submitLabel="创建文档" />
      </div>
    </div>
  );
}
