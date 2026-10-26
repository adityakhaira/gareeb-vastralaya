import Link from 'next/link';
import AddToCartButton from '@/components/cart/AddToCartButton';

export default function ProductCard({ product }) {
  const variant = product.variants[0];
  const compare = variant.compareAtPricePaise ? (variant.compareAtPricePaise / 100).toFixed(2) : null;
  const price = (variant.pricePaise / 100).toFixed(2);
  const stock = variant.inventory?.availableQuantity ?? 0;

  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`}>
        <img className="image" src={product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'} alt={product.name} />
      </Link>
      <div className="product-body">
        <div className="meta-row">
          <span>{product.category}</span>
          <span>{stock > 0 ? 'In stock' : 'Sold out'}</span>
        </div>
        <h3 className="product-title">{product.name}</h3>
        <div className="price-row">
          <span className="price">₹{price}</span>
          {compare && <span className="compare">₹{compare}</span>}
        </div>
        <div className="card-actions">
          <Link href={`/products/${product.slug}`} className="ghost-button">View</Link>
          <AddToCartButton product={product} variant={variant} />
        </div>
      </div>
    </article>
  );
}
