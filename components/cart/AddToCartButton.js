"use client";

export default function AddToCartButton({ product, variant }) {
  const handleAdd = () => {
    const current = JSON.parse(localStorage.getItem('gv-cart') || '[]');
    const existing = current.find((item) => item.sku === variant.sku);

    if (existing) {
      existing.quantity += 1;
    } else {
      current.push({
        sku: variant.sku,
        name: product.name,
        pricePaise: variant.pricePaise,
        quantity: 1,
        image: product.images?.[0]?.imageUrl || ''
      });
    }

    localStorage.setItem('gv-cart', JSON.stringify(current));
    window.dispatchEvent(new Event('gv-cart-updated'));
  };

  return (
    <button type="button" className="primary-button" onClick={handleAdd} disabled={!variant || (variant.inventory?.availableQuantity ?? 0) <= 0}>
      {(variant.inventory?.availableQuantity ?? 0) > 0 ? 'Add to cart' : 'Unavailable'}
    </button>
  );
}
