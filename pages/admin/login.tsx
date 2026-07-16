import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        router.push('/admin/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-botverse-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6">
        <span className="text-botverse-green">Bot</span>
        <span className="text-botverse-pink">Verse</span>
        <span className="text-gray-500 text-lg block text-center mt-1">Admin</span>
      </h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-gray-900 p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold mb-2">Admin Login</h2>

        {error && <p className="text-botverse-pink text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Admin Email"
          required
          className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-botverse-blue outline-none"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          required
          className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-botverse-blue outline-none"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-botverse-blue text-black font-semibold p-3 rounded disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
