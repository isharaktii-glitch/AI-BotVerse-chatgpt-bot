import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';
import { serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Your account has been rejected. Please contact support.' });
    }

    const token = signToken({ id: user.id, email: user.email, role: 'user' });

    res.setHeader('Set-Cookie', serialize('botverse_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    }));

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
        bot_enabled: user.bot_enabled,
        ai_reply_enabled: user.ai_reply_enabled,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
