import { requireAdminSession } from '@/lib/auth';
import { getStoreSettings, updateStoreSettings } from '@/lib/store-config';

export default async function SettingsPage() {
  requireAdminSession();

  const settings = await getStoreSettings();

  return (
    <div className="admin-shell">
      <aside className="side-nav">
        <h3>Admin</h3>
        <nav>
          <a className="list-link" href="/admin">Overview</a>
          <a className="list-link" href="/admin/products">Products</a>
          <a className="list-link" href="/admin/settings">Settings</a>
        </nav>
      </aside>
      <section>
        <h1>Store settings</h1>
        <form action={async (formData) => {
          'use server';
          const payload = {
            address: formData.get('address'),
            phone: formData.get('phone'),
            whatsapp: formData.get('whatsapp'),
            email: formData.get('email'),
            openingHours: formData.get('openingHours')
          };
          await updateStoreSettings(payload);
        }} className="checkout-form">
          <div className="form-grid">
            <div>
              <label>Address</label>
              <textarea name="address" defaultValue={settings.address} />
            </div>
            <div>
              <label>Phone</label>
              <input name="phone" defaultValue={settings.phone} />
            </div>
            <div>
              <label>WhatsApp</label>
              <input name="whatsapp" defaultValue={settings.whatsapp} />
            </div>
            <div>
              <label>Email</label>
              <input name="email" defaultValue={settings.email} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Opening hours</label>
              <input name="openingHours" defaultValue={settings.openingHours} />
            </div>
          </div>
          <button className="primary-button" type="submit">Save settings</button>
        </form>
      </section>
    </div>
  );
}
