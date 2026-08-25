import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentForm } from "@/components/admin/document-form";
import { updateDocumentAction } from "@/server/documents/actions";
import { getDocumentForEdit } from "@/server/documents/service";

export default async function EditDocumentPage({
  params,
}: PageProps<"/admin/documents/[id]/edit">) {
  const { id } = await params;
  let docId: bigint;
  try {
    docId = BigInt(id);
  } catch {
    notFound();
  }

  const doc = await getDocumentForEdit(docId);
  if (!doc) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/documents"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← 返回列表
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">编辑文档</h1>
        <p className="mt-1 font-mono text-xs text-zinc-400">/d/{doc.slug}</p>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <DocumentForm
          initial={doc}
          action={updateDocumentAction}
          submitLabel="保存更改"
        />
      </div>
    </div>
  );
}
