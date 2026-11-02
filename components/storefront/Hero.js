
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-content">
          <span className="eyebrow">Jhansi showroom</span>

          <h1>
            Tradition woven into <em>every drape.</em>
          </h1>

          <p className="hero-description">
            Discover beautiful sarees and lehengas for weddings,
            celebrations, and everyday elegance. Find a style
            that feels uniquely yours.
          </p>

          <div className="hero-actions">
            <Link href="/sarees" className="primary-button">
              Explore sarees <span aria-hidden="true">→</span>
            </Link>

            <Link href="/lehengas" className="secondary-button">
              Discover lehengas
            </Link>
          </div>

          <div className="hero-note">
            <span className="hero-note-line" aria-hidden="true" />
            A little tradition. A lot of elegance.
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85"
              alt="Traditional Indian saree in an elegant drape"
              fetchPriority="high"
            />

            <div className="hero-image-caption">
              <span className="hero-caption-label">TIMELESS COLLECTION </span>
              <span className="hero-caption-title">
                Made for your moments
              </span>
            </div>
          </div>

          <div className="hero-decoration" aria-hidden="true">
            GV
          </div>
        </div>
      </div>
    </section>
  );
}
