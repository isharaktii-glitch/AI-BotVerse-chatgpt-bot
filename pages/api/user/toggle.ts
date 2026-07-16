import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUserFromRequest';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { field } = req.body; // 'bot_enabled' | 'ai_reply_enabled'

  if (field !== 'bot_enabled' && field !== 'ai_reply_enabled') {
    return res.status(400).json({ error: 'Invalid field' });
  }

  try {
    if (field === 'bot_enabled') {
      await sql`UPDATE users SET bot_enabled = NOT bot_enabled WHERE id = ${payload.id}`;
    } else {
      await sql`UPDATE users SET ai_reply_enabled = NOT ai_reply_enabled WHERE id = ${payload.id}`;
    }
    return res.status(200).json({ message: 'Updated' });
  } catch (error) {
    console.error('Toggle error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
