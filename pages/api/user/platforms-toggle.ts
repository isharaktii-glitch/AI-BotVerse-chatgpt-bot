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

  const { platform } = req.body;
  if (!platform || !['whatsapp', 'facebook', 'instagram'].includes(platform)) {
    return res.status(400).json({ error: 'Invalid platform' });
  }

  try {
    await sql`
      UPDATE platform_connections
      SET is_enabled = NOT is_enabled
      WHERE user_id = ${payload.id} AND platform = ${platform}
    `;
    return res.status(200).json({ message: 'Toggled' });
  } catch (error) {
    console.error('Toggle platform error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
