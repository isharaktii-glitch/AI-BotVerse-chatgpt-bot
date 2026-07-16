import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = req.headers['x-internal-secret'];
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { user_id, platform, customer_identifier } = req.query;

  if (!user_id || !platform || !customer_identifier) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const rows = await sql`
      SELECT id FROM welcome_message_log
      WHERE user_id = ${Number(user_id)} AND platform = ${platform} AND customer_identifier = ${customer_identifier}
    `;
    return res.status(200).json({ already_sent: rows.length > 0 });
  } catch (error) {
    console.error('Check welcome sent error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
