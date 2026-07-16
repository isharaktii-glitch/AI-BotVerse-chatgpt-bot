import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUserFromRequest';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const users = await sql`
      SELECT id, username, email, status, bot_enabled, ai_reply_enabled, business_description
      FROM users WHERE id = ${payload.id}
    `;
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
