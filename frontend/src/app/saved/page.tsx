"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Loader2, Bookmark, ArrowLeft } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { api } from '../../services/api';

interface SavedProblem {
  id: string;
  title: string;
  description: string;
  market_need: string;
  match_score: number;
  created_at: string;
}

export default function SavedProblems() {
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<SavedProblem[]>([]);
  const [error, setError] = useState('');

  const { getToken, isLoaded, isSignedIn } = useAuth();

  const fetchSavedProblems = async () => {
    try {
      const token = await getToken();
      const data = await api.getSavedProblems(token);
      setProblems(data.problems || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSavedProblems();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
      setError('Please sign in to view saved problems.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      <Head>
        <title>Saved Problems | SkillFinder</title>
      </Head>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <header className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Bookmark className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Saved Problems</h1>
              <p className="text-slate-400 mt-1">Review the opportunities you&apos;ve bookmarked.</p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-indigo-400">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-center max-w-2xl mx-auto">
            <p className="font-medium text-lg">{error}</p>
            {!isSignedIn && (
              <Link href="/signin" className="mt-4 inline-block bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Sign In
              </Link>
            )}
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">No saved problems yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              Go back and analyze your skills to find problems worth solving.
            </p>
            <Link href="/" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Find Problems
            </Link>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {problems.map((problem, i) => (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/30 transition-all hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)] flex flex-col h-full relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-100 group-hover:text-indigo-300 transition-colors pr-16">
                      {problem.title}
                    </h3>
                    <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                      <div className="bg-slate-800 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        {problem.match_score}% Match
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed flex-grow mb-6">
                    {problem.description}
                  </p>
                  <div className="bg-slate-950 rounded-xl p-4 mt-auto">
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Market Need</div>
                    <p className="text-sm text-slate-300">{problem.market_need}</p>
                  </div>
                  <div className="mt-4 text-xs text-slate-600 text-right">
                    Saved on {new Date(problem.created_at).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
