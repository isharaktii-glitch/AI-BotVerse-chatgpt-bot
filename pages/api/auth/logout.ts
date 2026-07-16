import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', serialize('botverse_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: -1,
    path: '/',
  }));
  return res.status(200).json({ message: 'Logged out' });
}
