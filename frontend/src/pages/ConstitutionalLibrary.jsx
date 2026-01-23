import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ConstitutionalLibrary() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex overflow-hidden font-display">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-primary flex flex-col h-screen shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="NyayNeti Logo" className="h-10 w-auto object-contain" />
            </Link>
          </div>
          <nav className="space-y-1">
            <Link
              className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors"
              to="/dashboard"
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link
              className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors"
              to="/precedents"
            >
              <span className="material-symbols-outlined text-[20px]">search_insights</span>
              <span className="text-sm font-medium">Precedent Explorer</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 text-white sidebar-active" to="/constitutional">
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
              <span className="text-sm font-medium">Constitutional Library</span>
            </Link>
            <Link
              className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors"
              to="/research"
            >
              <span className="material-symbols-outlined text-[20px]">bookmarks</span>
              <span className="text-sm font-medium">My Research</span>
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-lg">
            <span className="material-symbols-outlined text-green-400 text-[18px]">cloud_done</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-none">Offline Database</span>
              <span className="text-[11px] text-white font-medium">Synced: 24 Oct 2023</span>
            </div>
          </div>
          <div className="relative">
            <div
              className="flex items-center gap-3 px-3 py-4 mt-2 cursor-pointer hover:bg-slate-800/30 rounded-lg transition-colors"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center border border-accent-gold/30">
                <span className="text-accent-gold text-xs font-bold">G</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">Guest</span>
                <span className="text-[10px] text-slate-500 truncate">Supreme Court of India</span>
              </div>
            </div>
            {isProfileOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-2 z-50">
                <button className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white">Profile</button>
                <button className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white border-t border-slate-800">Logout</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-background-dark shrink-0">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-slate-500 hover:text-slate-800 dark:hover:text-white">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                Constitutional Archive
              </h2>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* PDF viewer section Placeholder */}
          <section className="flex-1 bg-slate-50 dark:bg-slate-900/50 overflow-y-auto p-12 flex items-center justify-center">
            <div className="max-w-md text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-blue-600 dark:text-blue-400">menu_book</span>
              </div>
              <h3 className="text-xl font-bold dark:text-white mb-2">Select a Landmark Judgment</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Use the <Link to="/precedents" className="text-blue-500 font-bold hover:underline">Precedent Explorer</Link> to search for landmark cases and open them here for deep intelligence analysis.
              </p>
            </div>
          </section>

          {/* Right intelligence panel Placeholder */}
          <section className="w-[400px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50">
              <span className="material-symbols-outlined text-blue-500">analytics</span>
              <h3 className="text-sm font-bold uppercase tracking-wider">Analysis Hub</h3>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-30">
              <span className="material-symbols-outlined text-6xl mb-4">query_stats</span>
              <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                Deep mapping engine waiting for document selection
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ConstitutionalLibrary;

