import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: number;
  username: string;
  email: string;
  status: string;
  bot_enabled: boolean;
  ai_reply_enabled: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch('/api/user/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch {
      setError('Failed to load your dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-botverse-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-botverse-black text-white flex items-center justify-center">
        <p className="text-botverse-pink">{error || 'Something went wrong'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-botverse-black text-white px-4 py-6">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            <span className="text-botverse-green">Bot</span>
            <span className="text-botverse-pink">Verse</span>
          </h1>
          <button onClick={handleLogout} className="text-sm text-gray-400 border border-gray-700 px-3 py-1 rounded">
            Logout
          </button>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <p className="text-gray-400 text-sm">Welcome back,</p>
          <p className="text-lg font-semibold">{user.username}</p>
          <p className="text-sm mt-2">
            Account status:{' '}
            <span
              className={
                user.status === 'approved'
                  ? 'text-botverse-green'
                  : user.status === 'rejected'
                  ? 'text-botverse-pink'
                  : 'text-yellow-400'
              }
            >
              {user.status}
            </span>
          </p>
        </div>

        {user.status !== 'approved' && (
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-4 text-sm">
            Your account is pending admin approval. Bot features will be available once approved.
          </div>
        )}
      </div>
    </div>
  );
}
