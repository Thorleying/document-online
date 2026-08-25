import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentVisibility } from "@/generated/prisma/client";
import { AdminHeader } from "@/components/admin/admin-header";
import { ShareLinksPanel } from "@/components/admin/share-links-panel";
import { listShareLinks } from "@/server/documents/share-links";
import { getDocumentForEdit } from "@/server/documents/service";

export default async function DocumentSharesPage({
  params,
}: PageProps<"/admin/documents/[id]/shares">) {
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

  const links = await listShareLinks(docId);

  return (
    <>
      <AdminHeader
        title="分享链接"
        description={`文档《${doc.title}》`}
        actions={
          <Link
            href={`/admin/documents/${doc.id}/edit`}
            className="border-border bg-card hover:bg-muted inline-flex rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          >
            返回编辑
          </Link>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <ShareLinksPanel
          documentId={doc.id}
          isPublicDocument={doc.visibility === DocumentVisibility.PUBLIC}
          links={links}
        />
      </div>
    </>
  );
}
