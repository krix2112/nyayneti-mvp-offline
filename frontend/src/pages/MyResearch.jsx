import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';

function MyResearch() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    apiClient.getStatus().then(setStatus).catch(console.error);
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex font-display">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-primary flex flex-col h-screen sticky top-0 shrink-0">
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
            <Link
              className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors"
              to="/constitutional"
            >
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
              <span className="text-sm font-medium">Constitutional Library</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 sidebar-active" to="/research">
              <span className="material-symbols-outlined text-[20px]">bookmarks</span>
              <span className="text-sm font-medium">My Research</span>
            </Link>
          </nav>
          <div className="mt-10">
            <div className="flex items-center justify-between px-3 mb-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Research Folders
              </p>
            </div>
            <div className="px-3 py-8 text-center opacity-20 border border-dashed border-slate-700 rounded-lg">
              <p className="text-[10px] uppercase font-bold text-slate-400">No Folders Created</p>
            </div>
          </div>
        </div>
        <div className="mt-auto p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-lg">
            <span className={`material-symbols-outlined ${status?.ollama_available ? 'text-green-500' : 'text-amber-500'} text-[18px]`}>
              {status?.ollama_available ? 'verified_user' : 'pending'}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-none">Security</span>
              <span className="text-[11px] text-white font-medium">Hardware-Locked</span>
            </div>
          </div>
          <div className="relative">
            <div
              className="flex items-center gap-3 px-3 py-4 mt-2 cursor-pointer hover:bg-slate-800/30 rounded-lg transition-colors"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center border border-accent-gold/30">
                <span className="text-accent-gold text-xs font-bold">V</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Vansh</span>
                <span className="text-[10px] text-slate-500">Legal Bench</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white dark:bg-background-dark sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">Research Workspace</h2>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-4 mb-10">
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                Saved Judgments
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">0</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                Active Folders
              </p>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">0</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                Research Notes
              </p>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">0</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Local Library</p>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{status?.indexed_docs_count || 0}</span>
            </div>
          </div>

          {/* Recent Bookmarks */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest">
                Recent Bookmarks
              </h3>
            </div>
            <div className="py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center opacity-30">
              <span className="material-symbols-outlined text-4xl mb-2">bookmark_add</span>
              <p className="text-xs font-bold uppercase tracking-widest">No Bookmarked Precedents</p>
            </div>
          </div>

          {/* Workspace Files Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest">Workspace Files</h3>
            </div>
            <div className="p-20 text-center text-slate-500 opacity-20">
              <span className="material-symbols-outlined text-6xl mb-4">analytics</span>
              <p className="text-sm font-bold uppercase tracking-widest">Research Workspace Empty</p>
              <p className="text-[10px] mt-1">Start analyzing documents to see them here.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MyResearch;
