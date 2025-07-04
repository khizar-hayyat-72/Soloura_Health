// src/pages/api/get-wellbeing-tips.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getPersonalizedWellbeingTips } from '@/ai/flows/personalized-wellbeing-tips';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { mood, journalEntry } = req.body;

  try {
    const tips = await getPersonalizedWellbeingTips({ mood, journalEntry });
    res.status(200).json(tips);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Failed to generate wellbeing tips' });
  }
}
