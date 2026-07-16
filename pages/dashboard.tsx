import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: number;
  username: string;
  email: string;
  status: string;
  bot_enabled: boolean;
  ai_reply_enabled: boolean;
  created_at: string;
}

interface Price {
  platform: string;
  amount: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  instagram: 'Instagram',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pricing, setPricing] = useState<Price[]>([]);
  const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [priceSaved, setPriceSaved] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchPricing();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setUsers(data.users);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function fetchPricing() {
    try {
      const res = await fetch('/api/admin/pricing');
      if (res.ok) {
        const data = await res.json();
        setPricing(data.pricing);
        const initial: Record<string, string> = {};
        data.pricing.forEach((p: Price) => { initial[p.platform] = p.amount; });
        setEditingPrices(initial);
      }
    } catch {
      // silent fail
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  async function handleAction(userId: number, action: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch {
      setError('Action failed');
    }
  }

  async function handleDelete(userId: number) {
    if (!confirm('Are you sure you want to remove this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      }
    } catch {
      setError('Delete failed');
    }
  }

  async function savePrice(platform: string) {
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, amount: editingPrices[platform] }),
      });
      if (res.ok) {
        setPriceSaved(platform);
        setTimeout(() => setPriceSaved(null), 2000);
        fetchPricing();
      }
    } catch {
      setError('Failed to update price');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-botverse-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-botverse-black text-white px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            <span className="text-botverse-green">Bot</span>
            <span className="text-botverse-pink">Verse</span>
            <span className="text-gray-500 text-base ml-2">Admin Panel</span>
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 border border-gray-700 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>

        {error && <p className="text-botverse-pink mb-4">{error}</p>}

        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Pricing Settings</h2>
          <p className="text-xs text-gray-500 mb-3">
            Set how much users are charged for each platform (in Rs.)
          </p>
          {['whatsapp', 'facebook', 'instagram'].map((platform) => (
            <div key={platform} className="flex items-center gap-2 mb-2">
              <span className="text-sm w-24">{PLATFORM_LABELS[platform]}</span>
              <input
                type="number"
                value={editingPrices[platform] || ''}
                onChange={(e) => setEditingPrices({ ...editingPrices, [platform]: e.target.value })}
                className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 text-sm outline-none"
              />
              <button
                onClick={() => savePrice(platform)}
                className="bg-botverse-blue text-black text-xs font-semibold px-3 py-2 rounded"
              >
                {priceSaved === platform ? 'Saved ✓' : 'Save'}
              </button>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold mb-3">Registered Users ({users.length})</h2>

        {users.length === 0 && <p className="text-gray-500">No users registered yet.</p>}

        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{u.username}</p>
                  <p className="text-sm text-gray-400">{u.email}</p>
                </div>
                <span
                  className={
                    u.status === 'approved'
                      ? 'text-botverse-green text-sm'
                      : u.status === 'rejected'
                      ? 'text-botverse-pink text-sm'
                      : 'text-yellow-400 text-sm'
                  }
                >
                  {u.status}
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-3">
                Bot: {u.bot_enabled ? 'ON' : 'OFF'}
              </p>

              <div className="flex flex-wrap gap-2">
                {u.status !== 'approved' && (
                  <button
                    onClick={() => handleAction(u.id, 'approve')}
                    className="bg-botverse-green text-black text-xs px-3 py-1.5 rounded font-semibold"
                  >
                    Approve
                  </button>
                )}
                {u.status !== 'rejected' && (
                  <button
                    onClick={() => handleAction(u.id, 'reject')}
                    className="bg-yellow-600 text-black text-xs px-3 py-1.5 rounded font-semibold"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => handleAction(u.id, 'toggle_bot')}
                  className="border border-botverse-blue text-botverse-blue text-xs px-3 py-1.5 rounded font-semibold"
                >
                  Toggle Bot
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="bg-botverse-pink text-black text-xs px-3 py-1.5 rounded font-semibold"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
