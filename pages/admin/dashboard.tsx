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

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
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
        <h1 className="text-2xl font-bold mb-6">
          <span className="text-botverse-green">Bot</span>
          <span className="text-botverse-pink">Verse</span>
          <span className="text-gray-500 text-base ml-2">Admin Panel</span>
        </h1>

        {error && <p className="text-botverse-pink mb-4">{error}</p>}

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
