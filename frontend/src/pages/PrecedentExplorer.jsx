import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';

function PrecedentExplorer() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // Load system status on mount
  useEffect(() => {
    apiClient.getStatus().then(setStatus).catch(console.error);
    // Initial load of documents
    handleSearch('landmark judgments in India');
  }, []);

  const handleSearch = async (query) => {
    const q = query || searchQuery;
    if (!q) return;

    setLoading(true);
    try {
      const data = await apiClient.query(q);
      if (data.context_snippets) {
        setResults(data.context_snippets);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex font-display">
      {/* Side Navigation Bar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-primary flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-baseline">
              <span className="text-white text-2xl font-bold logo-hindi">न्याय</span>
              <span className="text-accent-gold text-2xl font-light ml-1">Neti</span>
            </div>
          </div>
          <nav className="space-y-1">
            <Link
              className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors"
              to="/dashboard"
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 text-white sidebar-active" to="/precedents">
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
            <Link
              className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors"
              to="/research"
            >
              <span className="material-symbols-outlined text-[20px]">bookmarks</span>
              <span className="text-sm font-medium">My Research</span>
            </Link>
          </nav>
          <div className="mt-10">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Court Hierarchy
            </p>
            <div className="space-y-1">
              <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/5 rounded">
                <input
                  type="checkbox"
                  className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500/20"
                  defaultChecked
                />
                <span className="text-xs text-slate-300">Supreme Court</span>
              </label>
              <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/5 rounded">
                <input
                  type="checkbox"
                  className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500/20"
                />
                <span className="text-xs text-slate-300">High Courts</span>
              </label>
              <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/5 rounded">
                <input
                  type="checkbox"
                  className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500/20"
                />
                <span className="text-xs text-slate-300">District Courts</span>
              </label>
            </div>
          </div>
        </div>
        <div className="mt-auto p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-lg">
            <span className={`material-symbols-outlined ${status?.ollama_available ? 'text-green-400' : 'text-amber-400'} text-[18px]`}>
              {status?.ollama_available ? 'cloud_done' : 'offline_pin'}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-none">Offline Database</span>
              <span className="text-[11px] text-white font-medium">
                {status?.indexed_docs_count || 0} Cases Indexed
              </span>
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
                <span className="text-[10px] text-slate-500">Legal Researcher</span>
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white dark:bg-background-dark sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">
              Precedent Explorer
            </h2>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                Semantic Mode
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              <Link to="/analysis" className="flex items-center gap-2 px-3 py-1.5 bg-accent-gold text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all text-xs">
                <span className="material-symbols-outlined text-sm">analytics</span>
                Analysis
              </Link>
              <Link to="/boundaries" className="flex items-center gap-2 px-3 py-1.5 border border-accent-gold text-accent-gold font-bold rounded-lg hover:bg-accent-gold hover:text-primary transition-all text-xs">
                <span className="material-symbols-outlined text-sm">explore</span>
                Boundaries
              </Link>
            </div>
          </div>
        </header>

        {/* Search Section */}
        <section className="p-8 max-w-5xl w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Explore Legal Precedents
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Search across your locally indexed Indian jurisprudence.
            </p>
          </div>

          {/* Search Bar Component */}
          <div className="relative group mb-6">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''} text-slate-400 group-focus-within:text-blue-500 transition-colors`}>
                {loading ? 'sync' : 'search'}
              </span>
            </div>
            <input
              type="text"
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm placeholder:text-slate-500"
              placeholder="Enter semantic query (e.g., 'Principles of bail in non-bailable offences')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <div className="absolute inset-y-2 right-2 flex items-center gap-2">
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="bg-primary hover:bg-blue-900 text-white px-5 rounded-lg h-full text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Searching...' : 'Analyze'}</span>
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                {results.length > 0 ? `Matches (${results.length})` : 'Waiting for query...'}
              </h3>
            </div>

            {results.map((res, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest">
                        Legal Document
                      </span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-slate-500 text-xs font-medium">{res.doc_id}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight underline decoration-blue-500/30">
                      {res.doc_id.replace('.PDF', '').replace('.pdf', '').replace(/_/g, ' ')}
                    </h4>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-500 rounded transition-colors">
                      <span className="material-symbols-outlined text-xl">bookmark</span>
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-blue-500 text-sm">auto_awesome</span>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                      Analysis Insight
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    {res.text}...
                  </p>
                </div>
              </div>
            ))}

            {results.length === 0 && !loading && (
              <div className="text-center py-20 opacity-30">
                <span className="material-symbols-outlined text-6xl mb-4">gavel</span>
                <p>Start searching to explore precedents</p>
              </div>
            )}

          </div>
        </section>

        {/* Floating Quick Action for Offline Export */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-3">
          <button className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-xl transition-all hover:scale-105">
            <span className="material-symbols-outlined">print</span>
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold">
              Print for Court
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default PrecedentExplorer;

