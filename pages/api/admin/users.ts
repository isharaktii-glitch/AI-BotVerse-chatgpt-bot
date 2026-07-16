import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/getUserFromRequest';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method === 'GET') {
    try {
      const users = await sql`
        SELECT id, username, email, status, bot_enabled, ai_reply_enabled, created_at
        FROM users ORDER BY created_at DESC
      `;
      return res.status(200).json({ users });
    } catch (error) {
      console.error('Admin get users error:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
