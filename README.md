# Skill-Based AI Problem Solver

A robust, production-ready AI agent application that identifies real-world problems users can solve based on their existing skill sets. The system leverages live web search capabilities and integrates with Microsoft Azure OpenAI to provide high-quality, actionable insights, featuring a polished UI/UX and a resilient backend architecture.

## 🌟 Key Features

- **Skill-Based Problem Solving:** Enter your skills and receive tailored real-world problems you can solve.
- **Agentic Live Web Search:** Integrates with Tavily via the Vercel AI SDK to perform real-time web searches and fetch up-to-date data.
- **Multi-Region AI Fallback:** Highly available AI integration with Azure OpenAI, automatically failing over to secondary regions during outages to ensure uninterrupted service.
- **Secure & Rate-Limited:** API routes are protected using Clerk for authentication and Upstash Redis for rate limiting to prevent abuse.
- **Robust Telemetry:** Sentry integration on both frontend and backend for comprehensive error tracking and performance profiling.
- **End-to-End Testing:** Comprehensive E2E test suite built with Playwright.

## 🏗️ Architecture

The project is structured as a monorepo with a decoupled frontend and backend:

- **`frontend/`**: A modern Next.js 16 application utilizing React 19, Tailwind CSS, and Framer Motion for a dynamic, premium user experience.
- **`backend/`**: A dedicated Node.js/Express service written in TypeScript that handles secure AI agent execution, database operations, and API endpoints.

## 💻 Tech Stack

### Frontend
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS, Framer Motion
- **Authentication:** Clerk (@clerk/nextjs)
- **AI Integration:** Vercel AI SDK (@ai-sdk/react)
- **Testing:** Playwright
- **Monitoring:** Sentry

### Backend
- **Server:** Node.js, Express, TypeScript
- **AI & Tools:** Vercel AI SDK, Azure OpenAI (@ai-sdk/azure), Tavily
- **Database/Cache:** Supabase, Upstash Redis
- **Security:** Clerk (@clerk/express), express-rate-limit
- **Validation:** Zod
- **Monitoring:** Sentry

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- npm, yarn, or pnpm
- API Keys for Clerk, Supabase, Upstash Redis, Azure OpenAI, and Tavily.

### 1. Clone the repository

```bash
git clone <repository-url>
cd ideas
```

### 2. Environment Setup

You will need to set up environment variables for both the frontend and backend.

**Frontend (`frontend/.env.local`)**
Required keys typically include Clerk publishable keys and your backend API URL.

**Backend (`backend/.env`)**
Copy the example environment file and fill in your secrets:
```bash
cd backend
cp .env.example .env
```
Ensure you provide keys for Azure OpenAI, Supabase, Upstash Redis, Tavily, and Clerk.

### 3. Install Dependencies

Install dependencies for both projects:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 4. Running Locally

You need to run both the frontend and backend development servers concurrently.

**Start the Backend Server:**
```bash
cd backend
npm run dev
```
The backend will run with `nodemon` for auto-reloading.

**Start the Frontend Next.js App:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application in action.

## 🧪 Testing

End-to-End testing is powered by Playwright. To run the tests:

```bash
cd frontend
npm run test:e2e
```
*Note: The Playwright tests run against a production build by default. Make sure to build the app before running integration tests.*

## 📈 Monitoring & Telemetry

Sentry is configured across the stack. Ensure your Sentry DSNs are correctly configured in both the frontend and backend environments to capture errors and performance metrics in production.