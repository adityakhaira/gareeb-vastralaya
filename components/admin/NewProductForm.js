"use client";

import { useRouter } from 'next/navigation';

export default function NewProductForm() {
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      name: event.currentTarget.name.value,
      slug: event.currentTarget.slug.value,
      category: event.currentTarget.category.value,
      description: event.currentTarget.description.value,
      status: 'published',
      featured: event.currentTarget.featured.checked,
      pricePaise: Number(event.currentTarget.price.value) * 100,
      sku: event.currentTarget.sku.value
    };

    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      router.push('/admin/products');
      router.refresh();
    }
  };

  return (
    <div className="container section">
      <div className="checkout-form" style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1>Add product</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label>Name</label>
              <input name="name" required />
            </div>
            <div>
              <label>Slug</label>
              <input name="slug" required />
            </div>
            <div>
              <label>Category</label>
              <select name="category">
                <option>Sarees</option>
                <option>Lehengas</option>
                <option>Festive Wear</option>
                <option>Wedding Wear</option>
              </select>
            </div>
            <div>
              <label>SKU</label>
              <input name="sku" required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea name="description" required />
            </div>
            <div>
              <label>Price (₹)</label>
              <input name="price" type="number" required />
            </div>
            <div>
              <label>Featured</label>
              <input type="checkbox" name="featured" />
            </div>
          </div>
          <button className="primary-button" type="submit">Save product</button>
        </form>
      </div>
    </div>
  );
}
