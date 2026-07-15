import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await hashPassword(password);

    const result = await sql`
      INSERT INTO users (username, email, password_hash, status, bot_enabled, ai_reply_enabled)
      VALUES (${username}, ${email}, ${passwordHash}, 'pending', false, false)
      RETURNING id, username, email, status
    `;

    return res.status(201).json({
      message: 'Registration successful. Your account is pending admin approval.',
      user: result[0],
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
