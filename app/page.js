import Hero from '@/components/storefront/Hero';
import ProductCard from '@/components/storefront/ProductCard';
import { getProductsForPublicPage } from '@/lib/store-data';

export default async function HomePage() {
  const products = await getProductsForPublicPage();
  const featured = products.filter((product) => product.featured).slice(0, 4);

  return (
    <>
      <Hero />
      <section className="section container">
        <div className="section-head">
          <h2>Featured collection</h2>
          <a href="/sarees" className="ghost-button">View all</a>
        </div>
        <div className="grid-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
