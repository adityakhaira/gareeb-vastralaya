import Link from 'next/link';
import { getStoreSettings } from '@/lib/store-config';

export default async function Header() {
  const store = await getStoreSettings();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">{store.name}</Link>
        <nav className="nav-links" aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/sarees">Sarees</Link>
          <Link href="/lehengas">Lehengas</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/cart">Cart</Link>
        </nav>
        <form action="/search" className="search-box">
          <input type="search" name="q" aria-label="Search products" placeholder="Search sarees" />
          <button type="submit" className="ghost-button">Search</button>
        </form>
      </div>
    </header>
  );
}
