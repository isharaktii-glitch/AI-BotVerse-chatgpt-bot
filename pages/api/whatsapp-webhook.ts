import type { NextApiRequest, NextApiResponse } from 'next';

const VERIFY_TOKEN = 'botverse_verify_123';
const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/4jub3ji2el2l8vi1k25xfz6cuhuj8fie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Meta verification (GET request)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // Actual WhatsApp messages (POST request) - forward to Make.com
  if (req.method === 'POST') {
    try {
      await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      return res.status(200).json({ status: 'forwarded' });
    } catch (error) {
      console.error('Forward to Make.com error:', error);
      return res.status(500).json({ error: 'Failed to forward' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
