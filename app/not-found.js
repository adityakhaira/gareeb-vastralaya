import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container section">
      <div className="info-box">
        <h1>Page not found</h1>
        <p>The page you are looking for is unavailable or has moved.</p>
        <Link href="/" className="primary-button">Return home</Link>
      </div>
    </div>
  );
}
