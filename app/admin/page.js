import Link from 'next/link';
import { requireAdminSession } from '@/lib/auth';
import { readStoreData } from '@/lib/store-data';

export default async function AdminDashboard() {
  requireAdminSession();

  const store = await readStoreData();
  const products = store.products.filter((product) => product.status === 'published');
  const variants = products.flatMap((product) => product.variants || []);
  const lowStock = variants.filter((variant) => (variant.inventory?.availableQuantity ?? 0) <= (variant.inventory?.lowStockThreshold ?? 5));
  const pendingOrders = store.orders.filter((order) => order.paymentStatus !== 'paid' && order.orderStatus !== 'cancelled');
  const recent = [...store.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

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
        <h1>Dashboard</h1>
        <div className="metric-grid">
          <div className="metric"><strong>{products.length}</strong><div>Published products</div></div>
          <div className="metric"><strong>{variants.length}</strong><div>Total variants</div></div>
          <div className="metric"><strong>{lowStock.length}</strong><div>Low-stock variants</div></div>
          <div className="metric"><strong>{pendingOrders.length}</strong><div>Pending orders</div></div>
        </div>
        <div className="section-head">
          <h2>Recent orders</h2>
        </div>
        <table className="table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead><tbody>{recent.map((order) => <tr key={order.id}><td>{order.orderNumber}</td><td>{order.customerName}</td><td>{order.paymentStatus}</td><td>₹{(order.totalPaise / 100).toFixed(2)}</td></tr>)}</tbody></table>
      </section>
    </div>
  );
}
