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

interface Platform {
  platform: string;
  phone_number_id: string | null;
  page_id: string | null;
  is_connected: boolean;
  is_enabled: boolean;
}

const PLATFORM_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  instagram: 'Instagram',
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [savingDesc, setSavingDesc] = useState(false);
  const [descSaved, setDescSaved] = useState(false);

  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [savingWelcome, setSavingWelcome] = useState(false);
  const [welcomeSaved, setWelcomeSaved] = useState(false);

  const [formPlatform, setFormPlatform] = useState<string | null>(null);
  const [formPhoneId, setFormPhoneId] = useState('');
  const [formPageId, setFormPageId] = useState('');
  const [formToken, setFormToken] = useState('');
  const [savingPlatform, setSavingPlatform] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchPlatforms();
    fetchWelcomeMessage();
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

  async function fetchPlatforms() {
    try {
      const res = await fetch('/api/user/platforms');
      if (res.ok) {
        const data = await res.json();
        setPlatforms(data.platforms);
      }
    } catch {
      // silent fail, non-critical
    }
  }

  async function fetchWelcomeMessage() {
    try {
      const res = await fetch('/api/user/welcome-message');
      if (res.ok) {
        const data = await res.json();
        setWelcomeMsg(data.message);
      }
    } catch {
      // silent fail, non-critical
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

  async function saveWelcomeMessage() {
    setSavingWelcome(true);
    setWelcomeSaved(false);
    try {
      const res = await fetch('/api/user/welcome-message', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: welcomeMsg }),
      });
      if (res.ok) {
        setWelcomeSaved(true);
        setTimeout(() => setWelcomeSaved(false), 2000);
      }
    } catch {
      setError('Failed to save welcome message');
    } finally {
      setSavingWelcome(false);
    }
  }

  function getPlatform(name: string): Platform | undefined {
    return platforms.find((p) => p.platform === name);
  }

  function openForm(name: string) {
    const existing = getPlatform(name);
    setFormPlatform(name);
    setFormPhoneId(existing?.phone_number_id || '');
    setFormPageId(existing?.page_id || '');
    setFormToken('');
  }

  async function savePlatform() {
    if (!formPlatform) return;
    setSavingPlatform(true);
    try {
      const res = await fetch('/api/user/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: formPlatform,
          phone_number_id: formPhoneId,
          page_id: formPageId,
          access_token: formToken,
        }),
      });
      if (res.ok) {
        setFormPlatform(null);
        fetchPlatforms();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to connect');
      }
    } catch {
      setError('Failed to connect');
    } finally {
      setSavingPlatform(false);
    }
  }

  async function togglePlatform(name: string) {
    try {
      const res = await fetch('/api/user/platforms-toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: name }),
      });
      if (res.ok) fetchPlatforms();
    } catch {
      setError('Failed to toggle platform');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-botverse-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-botverse-black text-white flex items-center justify-center">
        <p className="text-botverse-pink">{error}</p>
      </div>
    );
  }

  if (!user) return null;

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

        {error && <p className="text-botverse-pink text-sm mb-4">{error}</p>}

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

            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <p className="font-semibold mb-2">Welcome Message</p>
              <p className="text-xs text-gray-500 mb-2">
                This message is sent once, automatically, the first time a customer messages you.
              </p>
              <textarea
                value={welcomeMsg}
                onChange={(e) => setWelcomeMsg(e.target.value)}
                rows={3}
                className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-botverse-blue outline-none text-sm"
                placeholder="e.g. Hi! Thanks for reaching out to us. How can we help you today?"
              />
              <button
                onClick={saveWelcomeMessage}
                disabled={savingWelcome}
                className="mt-2 bg-botverse-blue text-black text-sm font-semibold px-4 py-2 rounded disabled:opacity-50"
              >
                {savingWelcome ? 'Saving...' : welcomeSaved ? 'Saved ✓' : 'Save'}
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <p className="font-semibold mb-3">Platform Connections</p>

              {['whatsapp', 'facebook', 'instagram'].map((name) => {
                const conn = getPlatform(name);
                return (
                  <div key={name} className="border-t border-gray-800 py-3 first:border-t-0 first:pt-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{PLATFORM_LABELS[name]}</span>
                      <div className="flex gap-2 items-center">
                        {conn?.is_connected && (
                          <button
                            onClick={() => togglePlatform(name)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              conn.is_enabled ? 'bg-botverse-green text-black' : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            {conn.is_enabled ? 'ON' : 'OFF'}
                          </button>
                        )}
                        <button
                          onClick={() => openForm(name)}
                          className="text-xs border border-botverse-blue text-botverse-blue px-3 py-1 rounded-full"
                        >
                          {conn?.is_connected ? 'Edit' : 'Connect'}
                        </button>
                      </div>
                    </div>

                    {conn?.is_connected && (
                      <p className="text-xs text-gray-500">✓ Connected</p>
                    )}

                    {formPlatform === name && (
                      <div className="mt-2 space-y-2 bg-gray-800 p-3 rounded">
                        {name === 'whatsapp' && (
                          <input
                            placeholder="Phone Number ID"
                            value={formPhoneId}
                            onChange={(e) => setFormPhoneId(e.target.value)}
                            className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-sm outline-none"
                          />
                        )}
                        {(name === 'facebook' || name === 'instagram') && (
                          <input
                            placeholder="Page ID"
                            value={formPageId}
                            onChange={(e) => setFormPageId(e.target.value)}
                            className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-sm outline-none"
                          />
                        )}
                        <input
                          placeholder="Access Token"
                          value={formToken}
                          onChange={(e) => setFormToken(e.target.value)}
                          className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-sm outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={savePlatform}
                            disabled={savingPlatform}
                            className="bg-botverse-green text-black text-xs font-semibold px-3 py-1.5 rounded disabled:opacity-50"
                          >
                            {savingPlatform ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setFormPlatform(null)}
                            className="text-xs text-gray-400 px-3 py-1.5"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
