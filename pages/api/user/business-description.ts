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

  const { description } = req.body;

  try {
    await sql`UPDATE users SET business_description = ${description} WHERE id = ${payload.id}`;
    return res.status(200).json({ message: 'Updated' });
  } catch (error) {
    console.error('Update description error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
