
import Link from "next/link";
import { getStoreSettings } from "@/lib/store-config";
import AccountActions from "@/components/AccountActions";

export default async function Header() {
  const store = await getStoreSettings();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link
          href="/"
          className="brand"
          aria-label={`${store.name} home`}
        >
          <span className="brand-mark" aria-hidden="true">
            G
          </span>

          <span className="brand-copy">
            <span className="brand-name">{store.name}</span>
            <span className="brand-tagline">
              THE ART OF INDIAN DRAPING
            </span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/sarees">Sarees</Link>
          <Link href="/lehengas">Lehengas</Link>
          <Link href="/about">Our Story</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <div className="header-actions">
          <form action="/search" className="search-box">
            <input
              type="search"
              name="q"
              aria-label="Search products"
              placeholder="Find your saree..."
            />

            <button type="submit" aria-label="Search">
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.2 4.2" />
              </svg>
            </button>
          </form>

          <Link href="/cart" className="cart-link">
            Cart
          </Link>

          <AccountActions />
        </div>
      </div>
    </header>
  );
}
