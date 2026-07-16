import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: number;
  username: string;
  email: string;
  status: string;
  bot_enabled: boolean;
  ai_reply_enabled: boolean;
  business_description: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [savingDesc, setSavingDesc] = useState(false);
  const [descSaved, setDescSaved] = useState(false);

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
      setDescription(data.user.business_description || '');
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

  async function toggleField(field: 'bot_enabled' | 'ai_reply_enabled') {
    if (!user) return;
    try {
      const res = await fetch('/api/user/toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field }),
      });
      if (res.ok) {
        setUser({ ...user, [field]: !user[field] });
      }
    } catch {
      setError('Failed to update setting');
    }
  }

  async function saveDescription() {
    setSavingDesc(true);
    setDescSaved(false);
    try {
      const res = await fetch('/api/user/business-description', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      if (res.ok) {
        setDescSaved(true);
        setTimeout(() => setDescSaved(false), 2000);
      }
    } catch {
      setError('Failed to save description');
    } finally {
      setSavingDesc(false);
    }
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

  const isApproved = user.status === 'approved';

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
                isApproved
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

        {!isApproved && (
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-4 text-sm">
            {user.status === 'rejected'
              ? 'Your account was rejected. Please contact support.'
              : 'Your account is pending admin approval. Bot features will unlock once approved.'}
          </div>
        )}

        {isApproved && (
          <>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold">Bot Status</span>
                <button
                  onClick={() => toggleField('bot_enabled')}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                    user.bot_enabled ? 'bg-botverse-green text-black' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {user.bot_enabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">AI Auto-Reply</span>
                <button
                  onClick={() => toggleField('ai_reply_enabled')}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                    user.ai_reply_enabled ? 'bg-botverse-green text-black' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {user.ai_reply_enabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <p className="font-semibold mb-2">About Your Business</p>
              <p className="text-xs text-gray-500 mb-2">
                This helps the AI understand your business so it can reply to customers correctly.
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-botverse-blue outline-none text-sm"
                placeholder="e.g. We sell handmade candles. Prices range from Rs.500 to Rs.2000. We deliver island-wide within 3-5 days..."
              />
              <button
                onClick={saveDescription}
                disabled={savingDesc}
                className="mt-2 bg-botverse-blue text-black text-sm font-semibold px-4 py-2 rounded disabled:opacity-50"
              >
                {savingDesc ? 'Saving...' : descSaved ? 'Saved ✓' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
