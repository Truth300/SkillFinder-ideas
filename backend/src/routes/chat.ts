import { Router, Request, Response } from 'express';
import { streamText, tool } from 'ai';
import { azure } from '@ai-sdk/azure';
import { z } from 'zod';
import axios from 'axios';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { apiLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Azure OpenAI configuration
const endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
const apiKey = process.env.AZURE_OPENAI_API_KEY || '';
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o';

const fallbackEndpoint = process.env.AZURE_OPENAI_FALLBACK_ENDPOINT || '';
const fallbackApiKey = process.env.AZURE_OPENAI_FALLBACK_API_KEY || '';

// Tavily configuration
const tavilyApiKey = process.env.TAVILY_API_KEY || '';

router.post('/', clerkMiddleware(), requireAuth(), apiLimiter, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).auth?.userId;

  try {
    const { messages } = req.body;

    if (!endpoint || !apiKey) {
      res.status(500).json({ error: 'Azure OpenAI credentials are not configured.' });
      return;
    }

    const result = streamText({
      model: azure(deployment),
      system: 'You are a helpful AI assistant. You can search the web for current information if needed.',
      messages,
      tools: {
        webSearch: tool({
          description: 'Search the web for up-to-date information.',
          parameters: z.object({
            query: z.string().describe('The search query'),
          }),
          execute: async ({ query }: { query: string }): Promise<any> => {
            if (!tavilyApiKey) {
              return { error: 'Web search API key is not configured.' };
            }
            try {
              const searchRes = await axios.post('https://api.tavily.com/search', {
                api_key: tavilyApiKey,
                query,
                search_depth: 'basic',
                include_answer: true,
                max_results: 3
              });
              return {
                answer: searchRes.data.answer,
                results: searchRes.data.results
              };
            } catch (e: any) {
              return { error: e.message || 'Search failed' };
            }
          },
        } as any),
      },
    });

    result.pipeUIMessageStreamToResponse(res);
  } catch (error: any) {
    console.error('Error in chat route:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
