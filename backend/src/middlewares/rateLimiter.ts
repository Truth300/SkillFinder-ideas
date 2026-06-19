import { Request } from 'express';
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP/User to 10 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Disable the strict IP key generator validation block to allow custom key logic safely
  validate: false,
  keyGenerator: (req: Request) => {
    // If user is authenticated, use their Clerk userId
    const userId = (req as any).auth?.userId;
    if (userId) return userId;
    // Otherwise fallback to IP
    return req.ip || req.socket?.remoteAddress || 'unknown';
  },
  message: { error: 'Too many requests, please try again later.' }
});
