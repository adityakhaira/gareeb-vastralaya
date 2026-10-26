import ProductCard from '@/components/storefront/ProductCard';
import { getProductsByCategory } from '@/lib/store-data';

export const metadata = { title: 'Lehengas in Jhansi | Gareeb Vastarlaya' };

export default async function LehengasPage() {
  const products = await getProductsByCategory('Lehengas');

  return (
    <div className="container section">
      <div className="page-title">
        <h1>Lehengas</h1>
        <p>Curated lehengas in rich textures, festive colours, and occasion-ready silhouettes.</p>
      </div>
      <div className="grid-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
