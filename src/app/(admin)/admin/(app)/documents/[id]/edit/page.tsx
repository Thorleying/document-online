import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
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
    <>
      <AdminHeader title="编辑文档" description={`永久链接 /d/${doc.slug}`} />
      <div className="flex-1 overflow-y-auto p-6">
        <Link
          href="/admin/documents"
          className="text-muted-foreground hover:text-accent text-sm"
        >
          ← 返回列表
        </Link>
        <div className="border-border bg-card mt-4 rounded-xl border p-6 shadow-sm">
          <DocumentForm
            initial={doc}
            action={updateDocumentAction}
            submitLabel="保存更改"
          />
        </div>
      </div>
    </>
  );
}
