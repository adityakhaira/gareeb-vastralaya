import ProductCard from '@/components/storefront/ProductCard';
import { getProductsBySearch } from '@/lib/store-data';

export default async function SearchPage({ searchParams }) {
  const query = (searchParams?.q || '').trim();
  const products = await getProductsBySearch(query);

  return (
    <div className="container section">
      <div className="page-title">
        <h1>Search results</h1>
        {query ? <p>Showing results for “{query}”</p> : <p>Search the collection for sarees, lehengas, and festive picks.</p>}
      </div>
      {products.length ? (
        <div className="grid-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="info-box">
          <p>No products match the searched term yet. Please try another keyword.</p>
        </div>
      )}
    </div>
  );
}
