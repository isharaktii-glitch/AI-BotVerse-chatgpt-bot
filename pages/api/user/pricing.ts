import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUserFromRequest';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const pricing = await sql`SELECT platform, amount FROM pricing_config ORDER BY platform`;
    return res.status(200).json({ pricing });
  } catch (error) {
    console.error('Get pricing error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
