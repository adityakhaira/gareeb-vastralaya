import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <div className="eyebrow">Jhansi showroom</div>
          <h1>Beautiful sarees and lehengas for every occasion.</h1>
          <p>Discover an affordable, diverse collection for festive moments, weddings, and daily elegance. Every style is built around a customer-first shopping experience.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/sarees" className="primary-button">Shop sarees</Link>
            <Link href="/lehengas" className="secondary-button">Shop lehengas</Link>
          </div>
        </div>
        <div className="hero-card">
          <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80" alt="Traditional Indian saree display" />
        </div>
      </div>
    </section>
  );
}
