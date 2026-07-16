import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = req.headers['x-internal-secret'];
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { user_id, platform, customer_identifier, sender, message } = req.body;

  if (!user_id || !platform || !customer_identifier || !sender || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await sql`
      INSERT INTO conversations (user_id, platform, customer_identifier, sender, message)
      VALUES (${user_id}, ${platform}, ${customer_identifier}, ${sender}, ${message})
    `;
    return res.status(201).json({ message: 'Logged' });
  } catch (error) {
    console.error('Log conversation error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
