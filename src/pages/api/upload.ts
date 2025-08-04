// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const scriptUrl =
        'https://script.google.com/macros/s/AKfycbyyvw5iG6A9K-ax5t4S-aKVVwinHBqzVJczQ3fj2MXjzlNEKEwLW4WTtOZrlMY08JkU/exec';

      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      const resultText = await response.text(); // GAS often returns plain text

      res.status(200).json({ status: 'success', result: resultText });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
      });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
  }
}
