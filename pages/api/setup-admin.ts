import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { setupKey, email, password } = req.body;

  if (setupKey !== process.env.INTERNAL_API_SECRET) {
    return res.status(403).json({ error: 'Invalid setup key' });
  }

  try {
    const existing = await sql`SELECT id FROM admins WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Admin already exists' });
    }

    const passwordHash = await hashPassword(password);
    await sql`INSERT INTO admins (email, password_hash) VALUES (${email}, ${passwordHash})`;

    return res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    console.error('Setup admin error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
