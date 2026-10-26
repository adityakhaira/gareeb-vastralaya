"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function CartClient() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const readCart = () => {
      const parsed = JSON.parse(localStorage.getItem('gv-cart') || '[]');
      setItems(parsed);
    };

    readCart();
    const onUpdate = () => readCart();
    window.addEventListener('gv-cart-updated', onUpdate);
    return () => window.removeEventListener('gv-cart-updated', onUpdate);
  }, []);

  const totals = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc.total += item.pricePaise * item.quantity;
          return acc;
        },
        { total: 0 }
      ),
    [items]
  );

  const updateQuantity = (sku, delta) => {
    const next = items
      .map((item) => (item.sku === sku ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
      .filter((item) => item.quantity > 0);

    localStorage.setItem('gv-cart', JSON.stringify(next));
    setItems(next);
    window.dispatchEvent(new Event('gv-cart-updated'));
  };

  return (
    <div className="container section">
      <div className="page-title">
        <h1>Your cart</h1>
      </div>
      {items.length ? (
        <div className="cart-grid">
          <div>
            {items.map((item) => (
              <div className="cart-item" key={item.sku}>
                <img src={item.image || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>₹{(item.pricePaise / 100).toFixed(2)}</p>
                  <div className="qty">
                    <button className="ghost-button" onClick={() => updateQuantity(item.sku, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button className="ghost-button" onClick={() => updateQuantity(item.sku, 1)}>+</button>
                  </div>
                </div>
                <div>
                  <strong>₹{((item.pricePaise * item.quantity) / 100).toFixed(2)}</strong>
                  <div>
                    <button className="ghost-button" onClick={() => updateQuantity(item.sku, -9999)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="checkout-form">
            <h3>Summary</h3>
            <p>Subtotal: ₹{(totals.total / 100).toFixed(2)}</p>
            <p>Shipping: ₹0.00</p>
            <p>Total: ₹{(totals.total / 100).toFixed(2)}</p>
            <Link href="/checkout" className="primary-button">Proceed to checkout</Link>
          </aside>
        </div>
      ) : (
        <div className="info-box">
          <p>Your cart is empty.</p>
          <Link href="/sarees" className="primary-button">Explore products</Link>
        </div>
      )}
    </div>
  );
}
