import { HomeFooter } from "@/components/home/home-footer";
import { HomeNav } from "@/components/home/home-nav";
import { HomeScrollProgress } from "@/components/home/home-scroll-progress";
import { ProductFeatures } from "@/components/home/product-features";
import { ProductHero } from "@/components/home/product-hero";
import { ProductShowcase } from "@/components/home/product-showcase";
import { ProductWorkflow } from "@/components/home/product-workflow";
import {
  getPublicLibraryStats,
  listPublicDocumentCards,
} from "@/server/documents/public-list";

/** 首页依赖实时文档列表，禁止构建期静态预渲染（否则 build 必须连库且内容会冻结）。 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [documents, stats] = await Promise.all([
    listPublicDocumentCards(6),
    getPublicLibraryStats(),
  ]);

  const featured = documents[0];

  return (
    <div className="bg-background min-h-screen">
      <HomeScrollProgress />
      <HomeNav />
      <main>
        <ProductHero featured={featured} stats={stats} />
        <ProductFeatures />
        <ProductShowcase documents={documents} />
        <ProductWorkflow />
      </main>
      <HomeFooter />
    </div>
  );
}
