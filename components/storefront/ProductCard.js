
import Link from 'next/link';
import AddToCartButton from '@/components/cart/AddToCartButton';

export default function ProductCard({ product }) {
  const variant = product.variants?.[0];

  if (!variant) {
    return null;
  }

  const price = (variant.pricePaise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const comparePrice = variant.compareAtPricePaise
    ? (variant.compareAtPricePaise / 100).toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : null;

  const stock = variant.inventory?.availableQuantity ?? 0;
  const imageUrl = product.images?.[0]?.imageUrl;

  const discount =
    variant.compareAtPricePaise > variant.pricePaise
      ? Math.round(
          ((variant.compareAtPricePaise - variant.pricePaise) /
            variant.compareAtPricePaise) *
            100
        )
      : null;

  return (
    <article className="product-card">
      <div className="product-card-visual">
        <Link
          href={`/products/${product.slug}`}
          className="product-card-image-link"
          aria-label={`View ${product.name}`}
        >
          <div className="product-card-image">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} loading="lazy" />
            ) : (
              <div className="product-image-placeholder">
                <span>G</span>
                <small>Gareeb Vastarlaya</small>
              </div>
            )}
          </div>
        </Link>

        {discount && (
          <span className="product-badge">
            {discount}% OFF
          </span>
        )}

        <span
          className={`product-stock ${
            stock > 0 ? 'is-available' : 'is-sold-out'
          }`}
        >
          <span className="stock-dot" aria-hidden="true" />
          {stock > 0 ? 'In stock' : 'Sold out'}
        </span>
      </div>

      <div className="product-card-body">
        <p className="product-category">{product.category}</p>

        <h3 className="product-name">
          <Link href={`/products/${product.slug}`}>
            {product.name}
          </Link>
        </h3>

        <div className="product-price-row">
          <span className="product-price">₹{price}</span>

          {comparePrice && discount && (
            <span className="product-compare-price">
              ₹{comparePrice}
            </span>
          )}
        </div>

        <div className="product-card-actions">
          <Link
            href={`/products/${product.slug}`}
            className="product-view-link"
          >
            View details <span aria-hidden="true">→</span>
          </Link>

          {stock > 0 && (
            <AddToCartButton product={product} variant={variant} />
          )}
        </div>
      </div>
    </article>
  );
}
