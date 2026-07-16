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

  const { platform, phone_number_id, page_id } = req.query;

  if (!platform) {
    return res.status(400).json({ error: 'Platform is required' });
  }

  try {
    let connections;
    if (platform === 'whatsapp' && phone_number_id) {
      connections = await sql`
        SELECT pc.*, u.business_description, u.bot_enabled, u.ai_reply_enabled, u.status
        FROM platform_connections pc
        JOIN users u ON u.id = pc.user_id
        WHERE pc.platform = 'whatsapp' AND pc.phone_number_id = ${phone_number_id}
      `;
    } else if ((platform === 'facebook' || platform === 'instagram') && page_id) {
      connections = await sql`
        SELECT pc.*, u.business_description, u.bot_enabled, u.ai_reply_enabled, u.status
        FROM platform_connections pc
        JOIN users u ON u.id = pc.user_id
        WHERE pc.platform = ${platform} AND pc.page_id = ${page_id}
      `;
    } else {
      return res.status(400).json({ error: 'Missing identifier' });
    }

    if (connections.length === 0) {
      return res.status(404).json({ error: 'No matching user found' });
    }

    const conn = connections[0];

    if (conn.status !== 'approved' || !conn.bot_enabled || !conn.ai_reply_enabled || !conn.is_enabled) {
      return res.status(200).json({ active: false });
    }

    const welcomeRows = await sql`
      SELECT message FROM welcome_messages WHERE user_id = ${conn.user_id}
    `;

    return res.status(200).json({
      active: true,
      user_id: conn.user_id,
      access_token: conn.access_token,
      business_description: conn.business_description,
      welcome_message: welcomeRows[0]?.message || null,
    });
  } catch (error) {
    console.error('Bot context error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
