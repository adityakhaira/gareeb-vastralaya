import Link from 'next/link';
import { getStoreSettings } from '@/lib/store-config';

export default async function Footer() {
  const settings = await getStoreSettings();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>{settings.name}</h3>
          <p>{settings.address}</p>
        </div>
        <div>
          <h3>Explore</h3>
          <p><Link href="/sarees">Sarees</Link></p>
          <p><Link href="/lehengas">Lehengas</Link></p>
          <p><Link href="/about">About</Link></p>
        </div>
        <div>
          <h3>Support</h3>
          <p><Link href="/contact">Visit store</Link></p>
          <p><Link href="/shipping">Shipping</Link></p>
          <p><Link href="/returns">Returns</Link></p>
        </div>
        <div>
          <h3>Contact</h3>
          <p>{settings.phone}</p>
          <p>{settings.email}</p>
          <p>{settings.openingHours}</p>
        </div>
      </div>
    </footer>
  );
}
