"use client";

import Link from 'next/link';
import { useState } from 'react';
import AddToCartButton from '@/components/cart/AddToCartButton';

export default function ProductDetail({ product, related }) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const variant = product.variants[selectedVariantIndex];
  const price = (variant.pricePaise / 100).toFixed(2);
  const compare = variant.compareAtPricePaise ? (variant.compareAtPricePaise / 100).toFixed(2) : null;

  return (
    <div className="container section">
      <div className="page-title">
        <h1>{product.name}</h1>
      </div>
      <div className="grid-3" style={{ alignItems: 'start' }}>
        <div className="info-box">
          <img src={product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'} alt={product.name} />
        </div>
        <div className="info-box">
          <div className="eyebrow">{product.category}</div>
          <h2>{product.name}</h2>
          <div className="price-row">
            <span className="price">₹{price}</span>
            {compare && <span className="compare">₹{compare}</span>}
          </div>
          <p>{product.description}</p>

          {product.variants.length > 1 && (
            <>
              <label>Variant</label>
              <select value={selectedVariantIndex} onChange={(event) => setSelectedVariantIndex(Number(event.target.value))}>
                {product.variants.map((item, index) => (
                  <option key={item.sku} value={index}>{item.sku}</option>
                ))}
              </select>
            </>
          )}

          <div className="card-actions">
            <AddToCartButton product={product} variant={variant} />
          </div>
          <p>Available stock: {variant.inventory?.availableQuantity ?? 0}</p>
        </div>
        <div className="info-box">
          <h3>Store details</h3>
          <p>Designed for daily wear, festive wear, or special events.</p>
          <p>Fabric and style details are customizable in the admin area.</p>
          <p><Link href="/contact">Visit the store</Link></p>
        </div>
      </div>

      {related.length > 0 && (
        <div className="section">
          <div className="section-head">
            <h2>Related styles</h2>
          </div>
          <div className="grid-4">
            {related.map((item) => (
              <div key={item.id} className="product-card">
                <Link href={`/products/${item.slug}`}>
                  <img className="image" src={item.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'} alt={item.name} />
                </Link>
                <div className="product-body">
                  <h3 className="product-title">{item.name}</h3>
                  <div className="price-row">
                    <span className="price">₹{((item.variants[0].pricePaise) / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
