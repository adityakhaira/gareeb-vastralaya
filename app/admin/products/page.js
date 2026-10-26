import Link from 'next/link';
import { requireAdminSession } from '@/lib/auth';
import { readStoreData } from '@/lib/store-data';

export default async function AdminProductsPage() {
  requireAdminSession();

  const store = await readStoreData();

  return (
    <div className="admin-shell">
      <aside className="side-nav">
        <h3>Admin</h3>
        <nav>
          <Link className="list-link" href="/admin">Overview</Link>
          <Link className="list-link" href="/admin/products">Products</Link>
          <Link className="list-link" href="/admin/settings">Settings</Link>
        </nav>
      </aside>
      <section>
        <div className="section-head">
          <h1>Products</h1>
          <Link href="/admin/products/new" className="primary-button">Add product</Link>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {store.products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>₹{((product.variants[0]?.pricePaise || 0) / 100).toFixed(2)}</td>
                <td>{product.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
