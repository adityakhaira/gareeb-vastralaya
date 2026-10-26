"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutClient() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  });

  useEffect(() => {
    const parsed = JSON.parse(localStorage.getItem('gv-cart') || '[]');
    setItems(parsed);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      customer: { ...form },
      items,
      totalPaise: totals.total,
      shippingPaise: 0,
      discountPaise: 0,
      paymentStatus: 'pending'
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (response.ok) {
      localStorage.removeItem('gv-cart');
      window.dispatchEvent(new Event('gv-cart-updated'));
      router.push(`/order-success/${result.orderReference}`);
    }
  };

  return (
    <div className="container section">
      <div className="page-title">
        <h1>Checkout</h1>
      </div>
      {items.length ? (
        <div className="cart-grid">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label>Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label>Phone</label>
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label>City</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Address</label>
                <textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label>State</label>
                <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <div>
                <label>Postal Code</label>
                <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
              </div>
            </div>
            <button className="primary-button" type="submit">Place order</button>
          </form>

          <aside className="checkout-form">
            <h3>Order summary</h3>
            {items.map((item) => (
              <div key={item.sku}>
                <p>{item.name} x {item.quantity}</p>
              </div>
            ))}
            <p>Subtotal: ₹{(totals.total / 100).toFixed(2)}</p>
            <p>Shipping: ₹0.00</p>
            <p>Total: ₹{(totals.total / 100).toFixed(2)}</p>
            <Link href="/cart" className="ghost-button">Back to cart</Link>
          </aside>
        </div>
      ) : (
        <div className="info-box">
          <p>Your cart is empty. Start with the collection.</p>
          <Link href="/sarees" className="primary-button">Browse products</Link>
        </div>
      )}
    </div>
  );
}
