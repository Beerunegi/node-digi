'use client';

import { useState } from 'react';

export default function AdminLoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      username: String(formData.get('username') || ''),
      password: String(formData.get('password') || ''),
    };

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message || 'Login failed.');
      return;
    }

    window.location.href = '/admin';
  }

  return (
    <form className="admin-auth-card" onSubmit={handleSubmit}>
      <div className="section-head">
        <span className="eyebrow">CMS Access</span>
        <h1>Admin Login</h1>
        <p>Sign in to create, update, publish, and manage blog content.</p>
      </div>

      <label>
        Username
        <input type="text" name="username" autoComplete="username" required />
      </label>
      <label>
        Password
        <input type="password" name="password" autoComplete="current-password" required />
      </label>

      {error ? <p className="admin-form-error">{error}</p> : null}

      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
