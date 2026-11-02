
"use client";

import { useState } from "react";

export default function AddToCartButton({ product, variant }) {
  const [added, setAdded] = useState(false);

  const stock = variant?.inventory?.availableQuantity ?? 0;
  const unavailable = !variant || stock <= 0;

  const handleAdd = () => {
    if (unavailable || !variant?.sku) return;

    try {
      let current = [];

      try {
        const stored = localStorage.getItem("gv-cart");
        const parsed = stored ? JSON.parse(stored) : [];
        current = Array.isArray(parsed) ? parsed : [];
      } catch {
        current = [];
      }

      const existing = current.find(
        (item) => item.sku === variant.sku
      );

      if (existing) {
        // Don't let the cart quantity exceed the stock
        if (existing.quantity >= stock) {
          setAdded(false);
          return;
        }

        existing.quantity += 1;
      } else {
        current.push({
          sku: variant.sku,
          name: product.name,
          pricePaise: variant.pricePaise,
          quantity: 1,
          image: product.images?.[0]?.imageUrl || "",
        });
      }

      localStorage.setItem("gv-cart", JSON.stringify(current));
      window.dispatchEvent(new Event("gv-cart-updated"));
      setAdded(true);
    } catch (error) {
      console.error("Unable to update cart:", error);
      setAdded(false);
    }
  };

  return (
    <button
      type="button"
      className={`primary-button add-to-cart-button ${
        added ? "is-added" : ""
      }`}
      onClick={handleAdd}
      disabled={unavailable}
      aria-label={
        unavailable
          ? `${product.name} is unavailable`
          : `Add ${product.name} to cart`
      }
    >
      {unavailable
        ? "Sold out"
        : added
          ? "Added ✓"
          : "Add to cart"}
    </button>
  );
}
