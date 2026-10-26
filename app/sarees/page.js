import ProductCard from '@/components/storefront/ProductCard';
import { getProductsByCategory } from '@/lib/store-data';

export const metadata = { title: 'Sarees in Jhansi | Gareeb Vastarlaya' };

export default async function SareesPage() {
  const products = await getProductsByCategory('Sarees');

  return (
    <div className="container section">
      <div className="page-title">
        <h1>Sarees</h1>
        <p>Browse elegant sarees for everyday wear, festive celebrations, and special occasions.</p>
      </div>
      <div className="grid-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
