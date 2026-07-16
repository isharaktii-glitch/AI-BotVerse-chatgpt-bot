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
      const platforms = await sql`
        SELECT platform, phone_number_id, page_id, is_connected, is_enabled
        FROM platform_connections WHERE user_id = ${payload.id}
      `;
      return res.status(200).json({ platforms });
    } catch (error) {
      console.error('Get platforms error:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  if (req.method === 'POST') {
    const { platform, phone_number_id, page_id, access_token } = req.body;

    if (!platform || !['whatsapp', 'facebook', 'instagram'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    try {
      await sql`
        INSERT INTO platform_connections (user_id, platform, phone_number_id, page_id, access_token, is_connected, is_enabled)
        VALUES (${payload.id}, ${platform}, ${phone_number_id || null}, ${page_id || null}, ${access_token}, true, true)
        ON CONFLICT (user_id, platform)
        DO UPDATE SET
          phone_number_id = ${phone_number_id || null},
          page_id = ${page_id || null},
          access_token = ${access_token},
          is_connected = true
      `;
      return res.status(200).json({ message: 'Connected successfully' });
    } catch (error) {
      console.error('Save platform error:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
