import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUserFromRequest';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT message FROM welcome_messages WHERE user_id = ${payload.id}`;
      return res.status(200).json({ message: rows[0]?.message || '' });
    } catch (error) {
      console.error('Get welcome message error:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  if (req.method === 'PUT') {
    const { message } = req.body;
    try {
      await sql`
        INSERT INTO welcome_messages (user_id, message)
        VALUES (${payload.id}, ${message})
        ON CONFLICT (user_id) DO UPDATE SET message = ${message}, updated_at = NOW()
      `;
      return res.status(200).json({ message: 'Saved' });
    } catch (error) {
      console.error('Save welcome message error:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
