import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full bg-slate-950 border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            SkillFinder
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/sign-in" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link 
            href="/sign-up" 
            className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
