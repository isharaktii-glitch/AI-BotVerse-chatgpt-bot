import { useState } from 'react';

export default function Setup() {
  const [setupKey, setSetupKey] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('Creating...');
    try {
      const res = await fetch('/api/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupKey, email, password }),
      });
      const data = await res.json();
      setMessage(res.ok ? data.message : data.error);
    } catch {
      setMessage('Something went wrong');
    }
  }

  return (
    <div style={{ padding: 20, color: 'white', background: '#000', minHeight: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300 }}>
        <input placeholder="Setup Key (INTERNAL_API_SECRET)" value={setupKey} onChange={(e) => setSetupKey(e.target.value)} style={{ padding: 10 }} />
        <input placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: 10 }} />
        <input placeholder="Admin Password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: 10 }} />
        <button type="submit" style={{ padding: 10, background: '#00ff88' }}>Create Admin</button>
        <p>{message}</p>
      </form>
    </div>
  );
}
