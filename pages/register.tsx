import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        setSuccess(data.message);
        setTimeout(() => router.push('/login'), 2000);
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
      </h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-gray-900 p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold mb-2">Create Account</h2>

        {error && <p className="text-botverse-pink text-sm">{error}</p>}
        {success && <p className="text-botverse-green text-sm">{success}</p>}

        <input
          type="text"
          placeholder="Username"
          required
          className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-botverse-blue outline-none"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          required
          className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-botverse-blue outline-none"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          required
          className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-botverse-blue outline-none"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-botverse-green text-black font-semibold p-3 rounded disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="text-sm text-gray-400 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-botverse-blue">Login</a>
        </p>
      </form>
    </div>
  );
}
