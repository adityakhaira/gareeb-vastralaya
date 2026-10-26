"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/login', { method: 'POST', body: form });

    if (response.ok) {
      router.push('/admin');
      router.refresh();
      return;
    }

    const payload = await response.json();
    setError(payload.error || 'Unable to log in.');
  };

  return (
    <div className="container section">
      <div className="checkout-form" style={{ maxWidth: 480, margin: '0 auto' }}>
        <h1>Admin login</h1>
        {error && <p style={{ color: 'var(--primary)' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label>Username</label>
            <input name="username" required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Password</label>
            <input type="password" name="password" required />
          </div>
          <button className="primary-button" type="submit">Log in</button>
        </form>
      </div>
    </div>
  );
}
