import { Router, Request, Response } from 'express';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { apiLimiter } from '../middlewares/rateLimiter';
import { supabase } from '../lib/supabase';

const router = Router();

// Save a problem
router.post('/save', clerkMiddleware(), requireAuth(), apiLimiter, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).auth?.userId;

  try {
    const { title, description, marketNeed, matchScore } = req.body;

    if (!title || !description || !marketNeed || matchScore === undefined) {
      res.status(400).json({ error: 'Missing required problem fields' });
      return;
    }

    const { data, error } = await supabase
      .from('saved_problems')
      .insert([
        {
          user_id: userId,
          title,
          description,
          market_need: marketNeed,
          match_score: matchScore,
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error inserting problem:', error);
      res.status(500).json({ error: 'Failed to save problem' });
      return;
    }

    res.status(201).json({ message: 'Problem saved successfully', data });

  } catch (error: any) {
    console.error('Error saving problem:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get all saved problems for the user
router.get('/', clerkMiddleware(), requireAuth(), apiLimiter, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).auth?.userId;

  try {
    const { data, error } = await supabase
      .from('saved_problems')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching problems:', error);
      res.status(500).json({ error: 'Failed to fetch saved problems' });
      return;
    }

    res.json({ problems: data });

  } catch (error: any) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
