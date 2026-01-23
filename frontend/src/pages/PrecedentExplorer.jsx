import React from 'react';

function PrecedentExplorer() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex font-display">
      {/* Side Navigation Bar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-primary flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <span className="material-symbols-outlined text-white text-2xl">balance</span>
            </div>
            <div>
              <h1 className="text-white text-lg font-bold leading-none tracking-tight">NyayNeti</h1>
              <p className="text-blue-400 text-[10px] uppercase tracking-widest mt-1 font-semibold">
                Intelligence Platform
              </p>
            </div>
          </div>
          <nav className="space-y-1">
            <a
              className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 text-white sidebar-active" href="#">
              <span className="material-symbols-outlined text-[20px]">search_insights</span>
              <span className="text-sm font-medium">Precedent Explorer</span>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
              <span className="text-sm font-medium">Constitutional Library</span>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-[20px]">bookmarks</span>
              <span className="text-sm font-medium">My Research</span>
            </a>
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
            <span className="material-symbols-outlined text-green-400 text-[18px]">cloud_done</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-none">Offline Database</span>
              <span className="text-[11px] text-white font-medium">Synced: 20 Oct 2023</span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-4 mt-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBy8ZDfG2zcQMAikzUenTEbqEtWpm8JtOaK-PWCFEwrcLbNOj6hYk2fVdSVzF8b8hlAI02ZLMzRi3XMEPhskVTDkh5TfZ1GW-tviPOJxc1tRr3jLIY33BbBIZtA3rMvsYdrer5RXCHUDSHFLUVoETUV1nFucgrCVGLEutp6epkPn7h_vrV8pT-IbOTlOtE5WvAd76dvWR80y8LmuD9mGbnZXp5uIf6Hfqt3WTcDytQJrgywtRBmdW6kuzXd3PQRwOxICinapkKLATYc"
                alt="Profile picture of a professional legal user"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Hon&apos;ble Justice A. Sharma</span>
              <span className="text-[10px] text-slate-500">Chief Justice&apos;s Bench</span>
            </div>
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
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
              <span className="material-symbols-outlined text-slate-500">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <span className="material-symbols-outlined text-slate-500">settings</span>
            </button>
          </div>
        </header>

        {/* Search Section */}
        <section className="p-8 max-w-5xl w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Explore Legal Precedents
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Search across 70 years of Indian jurisprudence using natural language queries.
            </p>
          </div>

          {/* Search Bar Component */}
          <div className="relative group mb-6">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors">
                search
              </span>
            </div>
            <input
              type="text"
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm placeholder:text-slate-500"
              placeholder="Enter semantic query (e.g., 'Right to privacy in digital surveillance and data collection')"
            />
            <div className="absolute inset-y-2 right-2 flex items-center gap-2">
              <button className="bg-primary hover:bg-blue-900 text-white px-5 rounded-lg h-full text-sm font-semibold transition-all flex items-center gap-2">
                <span>Analyze</span>
              </button>
            </div>
          </div>

          {/* Chips / Filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
              <span>Bench Strength</span>
              <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium">
              <span>Year Range</span>
              <span className="material-symbols-outlined text-sm">calendar_month</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium">
              <span>Subject Matter</span>
              <span className="material-symbols-outlined text-sm">category</span>
            </button>
            <div className="h-8 w-px bg-slate-300 dark:bg-slate-800 mx-1" />
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-xs font-bold">
              <span className="material-symbols-outlined text-sm">grade</span>
              <span>Landmark Only</span>
            </button>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                Top Matches (128 Results)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Sort by:</span>
                <select className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-0 p-0 cursor-pointer">
                  <option>Relevance</option>
                  <option>Citation Count</option>
                  <option>Recency</option>
                </select>
              </div>
            </div>

            {/* Case Card 1 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest">
                      Constitution Bench
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-slate-500 text-xs font-medium">Supreme Court of India</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    Justice K.S. Puttaswamy (Retd.) v. Union of India
                  </h4>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-mono mt-0.5">
                    2017 (10) SCC 1
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Save Offline"
                  >
                    <span className="material-symbols-outlined text-xl">download_for_offline</span>
                  </button>
                  <button
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Bookmark"
                  >
                    <span className="material-symbols-outlined text-xl">bookmark</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-y border-slate-100 dark:border-slate-800/50">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Bench</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">9-Judge Bench</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Decision Date</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Aug 24, 2017</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Cited by</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">4,281 cases</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="material-symbols-outlined text-blue-500 text-sm">auto_awesome</span>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                    Citation Insight
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &quot;The right to privacy is protected as an intrinsic part of the right to life and
                  personal liberty under Article 21 and as a part of the freedoms guaranteed by Part
                  III of the Constitution.&quot;
                </p>
              </div>
            </div>

            {/* Case Card 2 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm opacity-90">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                      Leading Case
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-slate-500 text-xs font-medium">Delhi High Court</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    State v. XYZ Data Systems Ltd.
                  </h4>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-mono mt-0.5">2021 DHC 4421</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Save Offline"
                  >
                    <span className="material-symbols-outlined text-xl">download_for_offline</span>
                  </button>
                  <button
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Bookmark"
                  >
                    <span className="material-symbols-outlined text-xl">bookmark_added</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-y border-slate-100 dark:border-slate-800/50">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Bench</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Division Bench</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Decision Date</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Nov 12, 2021</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Compliance</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    In Force
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Applied the Puttaswamy proportionality test to government data collection for public
                  health monitoring during emergency protocols.
                </p>
              </div>
            </div>

            {/* Case Card 3 (Overruled State) */}
            <div className="bg-white dark:bg-slate-900 border-l-4 border-red-500 border-y border-r border-slate-200 dark:border-slate-800 rounded-xl p-5 opacity-75">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[9px] font-black uppercase tracking-widest">
                      Overruled
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-slate-500 text-xs font-medium">Supreme Court of India</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    ADM Jabalpur v. Shivkant Shukla
                  </h4>
                  <p className="text-slate-500 text-sm font-mono mt-0.5 line-through">1976 (2) SCC 521</p>
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 mt-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500 text-sm">warning</span>
                  <span className="text-[11px] font-bold text-red-600 dark:text-red-400">
                    CITATIONAL WARNING
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                  This case was expressly overruled by the 9-judge bench in{' '}
                  <span className="font-bold text-blue-600 dark:text-blue-400">Puttaswamy (2017)</span>{' '}
                  regarding the suspension of fundamental rights.
                </p>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-12 flex items-center justify-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="flex gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold">
                1
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                2
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                3
              </button>
              <span className="w-10 h-10 flex items-center justify-center text-slate-400">...</span>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                12
              </button>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
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
          <button className="bg-primary hover:bg-blue-900 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110">
            <span className="material-symbols-outlined text-2xl">question_answer</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default PrecedentExplorer;

