import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzeMood } from '@/ai/flows/analyze-mood';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { journalEntry } = req.body;
    const result = await analyzeMood({ journalEntry });
    res.status(200).json(result);
  } catch (error) {
    console.error('Mood analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze mood' });
  }
}
