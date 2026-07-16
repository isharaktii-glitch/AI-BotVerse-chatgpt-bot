import type { NextApiRequest } from 'next';
import { verifyToken } from '@/lib/auth';

export function getUserFromRequest(req: NextApiRequest) {
  const token = req.cookies['botverse_token'];
  if (!token) return null;
  return verifyToken(token);
}

export function getAdminFromRequest(req: NextApiRequest) {
  const token = req.cookies['botverse_admin_token'];
  if (!token) return null;
  const payload = verifyToken(token);
  if (payload?.role !== 'admin') return null;
  return payload;
}
