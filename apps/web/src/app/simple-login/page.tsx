'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [adminCheckResult, setAdminCheckResult] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('Logging in...');
    setAdminCheckResult(null);

    const response = await authClient.signIn.email({
      email,
      password,
    });

    if (response.error) {
      setStatus(response.error.message || 'Login failed');
      return;
    }

    // You no longer need to manually extract a token here.
    // The browser has already securely stored the HttpOnly cookie.
    setStatus('Logged in successfully');
  };

  const handleAdminCheck = async () => {
    setAdminCheckResult('Checking admin route...');

    // We rely entirely on the browser automatically sending the cookie
    const response = await fetch(`${API_BASE_URL}/api/auth/admin-only-check`, {
      method: 'GET',
      credentials: 'include', // This is all you need for cookie auth
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    setAdminCheckResult(`${response.status} ${response.statusText}: ${text}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Simple Login</h1>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Login
          </button>
        </form>

        {status && <p className="text-sm text-slate-700">{status}</p>}

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleAdminCheck}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold"
          >
            Check Admin Route
          </button>

          {adminCheckResult && (
            <pre className="max-h-48 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100 whitespace-pre-wrap">
              {adminCheckResult}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
