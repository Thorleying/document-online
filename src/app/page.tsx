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
