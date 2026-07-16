import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/getUserFromRequest';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { id } = req.query;
  const userId = Number(id);

  if (req.method === 'PUT') {
    const { action } = req.body; // 'approve' | 'reject' | 'toggle_bot'

    try {
      if (action === 'approve') {
        await sql`UPDATE users SET status = 'approved' WHERE id = ${userId}`;
      } else if (action === 'reject') {
        await sql`UPDATE users SET status = 'rejected' WHERE id = ${userId}`;
      } else if (action === 'toggle_bot') {
        await sql`UPDATE users SET bot_enabled = NOT bot_enabled WHERE id = ${userId}`;
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }
      return res.status(200).json({ message: 'Updated successfully' });
    } catch (error) {
      console.error('Admin update user error:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM users WHERE id = ${userId}`;
      return res.status(200).json({ message: 'User deleted' });
    } catch (error) {
      console.error('Admin delete user error:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
