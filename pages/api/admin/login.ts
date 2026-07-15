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
    const admins = await sql`SELECT * FROM admins WHERE email = ${email}`;

    if (admins.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const admin = admins[0];
    const isValid = await verifyPassword(password, admin.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ id: admin.id, email: admin.email, role: 'admin' });

    res.setHeader('Set-Cookie', serialize('botverse_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    }));

    return res.status(200).json({
      message: 'Login successful',
      admin: { id: admin.id, email: admin.email },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
