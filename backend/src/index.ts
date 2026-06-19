import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import analyzeRouter from './routes/analyze';
import chatRouter from './routes/chat';
import problemsRouter from './routes/problems';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/chat', chatRouter);
app.use('/api/problems', problemsRouter);

Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
