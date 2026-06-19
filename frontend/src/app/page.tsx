"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, Search, Briefcase, Bookmark, Check } from 'lucide-react';
import Head from 'next/head';
import { useAuth } from '@clerk/nextjs';
import { api } from '../services/api';
interface Problem {
  title: string;
  description: string;
  marketNeed: string;
  matchScore: number;
}

export default function Home() {
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [error, setError] = useState('');
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  const { getToken, isSignedIn } = useAuth();

  const handleSaveProblem = async (problem: Problem, index: number) => {
    if (!isSignedIn) {
      setError('You must be signed in to save problems. Please sign up or log in.');
      return;
    }

    try {
      const token = await getToken();
      await api.saveProblem(problem as Record<string, unknown>, token);
      setSavedIds((prev) => new Set(prev).add(index));
      setError(''); // clear any previous errors
    } catch (err) {
      console.error('Failed to save problem:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while saving.';
      setError(`Failed to save problem: ${errorMessage}`);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skills.trim()) return;

    setLoading(true);
    setError('');
    setProblems([]);
    setSavedIds(new Set());

    try {
      const token = await getToken();
      const data = await api.analyzeSkills(skills, token);
      setProblems(data.problems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      <Head>
        <title>SkillFinder | Discover Problems You Can Solve</title>
        <meta name="description" content="AI-powered tool that matches your unique skills with real-world problems that need solving." />
      </Head>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <header className="mb-16 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium border border-indigo-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Powered by Azure Foundry AI</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold tracking-tight"
          >
            Find problems <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">you</span> can solve.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Enter your skills and let our AI search the web to find real-world challenges that perfectly match your expertise.
          </motion.p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <form onSubmit={handleAnalyze} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-slate-900 rounded-2xl border border-slate-800 p-2 shadow-2xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
              <Search className="w-6 h-6 text-slate-500 ml-4" />
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Python, Data Analysis, UI/UX..."
                className="w-full bg-transparent border-none text-slate-200 placeholder-slate-500 focus:ring-0 px-4 py-3 text-lg outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !skills.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Analyze <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {problems.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Briefcase className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold">Opportunities Found</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {problems.map((problem, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/30 transition-all hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)] flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {problem.title}
                      </h3>
                      <div className="flex flex-col items-end gap-2">
                        <div className="bg-slate-800 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          {problem.matchScore}% Match
                        </div>
                        <button
                          onClick={() => handleSaveProblem(problem, i)}
                          disabled={savedIds.has(i)}
                          className="text-slate-400 hover:text-indigo-400 transition-colors disabled:text-indigo-400 disabled:opacity-50"
                          title="Save this problem"
                        >
                          {savedIds.has(i) ? <Check className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed flex-grow mb-6">
                      {problem.description}
                    </p>
                    <div className="bg-slate-950 rounded-xl p-4 mt-auto">
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Market Need</div>
                      <p className="text-sm text-slate-300">{problem.marketNeed}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}