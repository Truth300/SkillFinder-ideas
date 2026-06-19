import { Router, Request, Response } from 'express';
import { AzureOpenAI } from 'openai';
import axios from 'axios';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { apiLimiter } from '../middlewares/rateLimiter';
import { redis } from '../lib/redis';

const router = Router();

// Azure OpenAI configuration
const endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
const apiKey = process.env.AZURE_OPENAI_API_KEY || '';
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o';
const apiVersion = '2024-02-15-preview';

const fallbackEndpoint = process.env.AZURE_OPENAI_FALLBACK_ENDPOINT || '';
const fallbackApiKey = process.env.AZURE_OPENAI_FALLBACK_API_KEY || '';

// Tavily configuration
const tavilyApiKey = process.env.TAVILY_API_KEY || '';

router.post('/', clerkMiddleware(), requireAuth(), apiLimiter, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).auth?.userId;

  try {
    const { skills } = req.body;

    if (!skills) {
      res.status(400).json({ error: 'Skills are required' });
      return;
    }

    if (!endpoint || !apiKey) {
      res.status(500).json({ 
        error: 'Azure OpenAI credentials are not configured. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY.' 
      });
      return;
    }

    const cacheKey = `analyze:${skills.toLowerCase().trim()}`;
    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const cachedResult = await redis.get(cacheKey);
        if (cachedResult) {
          console.log(`Cache hit for key: ${cacheKey}`);
          const parsed = typeof cachedResult === 'string' ? JSON.parse(cachedResult) : cachedResult;
          res.json(parsed);
          return;
        }
      }
    } catch (cacheError) {
      console.error('Redis cache get error:', cacheError);
    }

    // Step 1: Web Search for current trends/problems related to skills (using Tavily)
    let searchContext = "";
    if (tavilyApiKey) {
      try {
        const searchRes = await axios.post('https://api.tavily.com/search', {
          api_key: tavilyApiKey,
          query: `current problems and business needs requiring ${skills} skills`,
          search_depth: "basic",
          include_answer: true,
          max_results: 3
        });
        searchContext = searchRes.data.answer || JSON.stringify(searchRes.data.results);
      } catch (e) {
        console.warn("Tavily search failed. Continuing without real-time web context.", e);
      }
    } else {
      console.warn("Tavily API key not found. Skipping web search.");
    }

    // Step 2: Use Azure Foundry AI (Azure OpenAI) to generate problems
    const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
    const fallbackClient = fallbackEndpoint && fallbackApiKey ? new AzureOpenAI({ endpoint: fallbackEndpoint, apiKey: fallbackApiKey, apiVersion, deployment }) : null;

    const systemPrompt = `You are an expert career and startup advisor. 
The user will provide their skills. Based on their skills and the current market context provided, you must list 4 real-world problems that the user is uniquely equipped to solve.

Provide the response in raw JSON format with the following structure:
{
  "problems": [
    {
      "title": "Problem Title",
      "description": "A 2-3 sentence description of the problem and how the user's skills apply.",
      "marketNeed": "Why is this important right now? (1 sentence)",
      "matchScore": 95
    }
  ]
}

Ensure the output is strictly valid JSON without markdown wrapping like \`\`\`json.`;

    const userPrompt = `User Skills: ${skills}
Market Context (Web Search Results): ${searchContext ? searchContext : 'No real-time market context available. Use your general knowledge.'}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    let content;
    try {
      const completion = await client.chat.completions.create({
        model: deployment,
        messages: messages as any,
        response_format: { type: 'json_object' }
      });
      content = completion.choices[0]?.message?.content;
    } catch (err: any) {
      if (fallbackClient) {
        console.warn('Primary AI region failed, falling back to secondary...', err.message);
        const fallbackCompletion = await fallbackClient.chat.completions.create({
          model: deployment,
          messages: messages as any,
          response_format: { type: 'json_object' }
        });
        content = fallbackCompletion.choices[0]?.message?.content;
      } else {
        throw err;
      }
    }

    if (!content) {
      throw new Error('No content returned from Azure OpenAI');
    }

    const parsedContent = JSON.parse(content);

    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        await redis.set(cacheKey, JSON.stringify(parsedContent), { ex: 86400 });
      }
    } catch (cacheError) {
      console.error('Redis cache set error:', cacheError);
    }

    res.json(parsedContent);

  } catch (error: any) {
    console.error('Error in analyze route:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
