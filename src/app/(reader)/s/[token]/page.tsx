import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Ban, Clock } from "lucide-react";
import { ReaderShell } from "@/components/reader/reader-shell";
import { ShareAccessCard } from "@/components/reader/share-access-card";
import { ViewTracker } from "@/components/reader/view-tracker";
import { SharePasswordGate } from "@/components/reader/share-password-gate";
import { getShareAccessView } from "@/server/documents/share";

export async function generateMetadata({
  params,
}: PageProps<"/s/[token]">): Promise<Metadata> {
  const { token } = await params;
  const view = await getShareAccessView(token);

  return {
    // 密码验证前不在 metadata 中泄露文档标题
    title: view.state === "ok" ? view.doc.title : "分享文档",
    description:
      view.state === "ok" ? (view.doc.summary ?? undefined) : undefined,
    robots: { index: false, follow: false },
  };
}

function BackHomeButton() {
  return (
    <Link
      href="/"
      className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors duration-200"
    >
      返回首页
    </Link>
  );
}

export default async function ShareReaderPage({
  params,
}: PageProps<"/s/[token]">) {
  const { token } = await params;
  const view = await getShareAccessView(token);

  switch (view.state) {
    case "ok":
      return (
        <ReaderShell
          title={view.doc.title}
          summary={view.doc.summary}
          viewCount={view.doc.viewCount}
          publishedLabel="分享文档"
        >
          <ViewTracker token={token} />
          <div dangerouslySetInnerHTML={{ __html: view.doc.contentHtml }} />
        </ReaderShell>
      );

    case "password_required":
      return <SharePasswordGate token={token} />;

    case "share_expired":
      return (
        <ShareAccessCard
          icon={Clock}
          title="分享链接已过期"
          description="这条分享链接已超过有效期，无法继续访问。如仍需阅读，请联系分享者重新生成链接。"
        >
          <BackHomeButton />
        </ShareAccessCard>
      );

    case "share_disabled":
      return (
        <ShareAccessCard
          icon={Ban}
          title="分享链接已停用"
          description="分享者已停用这条链接，文档暂时无法通过它访问。如有需要，请联系分享者获取新的链接。"
        >
          <BackHomeButton />
        </ShareAccessCard>
      );

    default:
      notFound();
  }
}
