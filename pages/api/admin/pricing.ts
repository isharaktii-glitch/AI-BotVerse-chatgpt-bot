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
      const pricing = await sql`SELECT platform, amount FROM pricing_config ORDER BY platform`;
      return res.status(200).json({ pricing });
    } catch (error) {
      console.error('Get pricing error:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  if (req.method === 'PUT') {
    const { platform, amount } = req.body;
    if (!platform || amount === undefined) {
      return res.status(400).json({ error: 'Platform and amount are required' });
    }
    try {
      await sql`
        UPDATE pricing_config SET amount = ${amount}, updated_at = NOW()
        WHERE platform = ${platform}
      `;
      return res.status(200).json({ message: 'Updated' });
    } catch (error) {
      console.error('Update pricing error:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
