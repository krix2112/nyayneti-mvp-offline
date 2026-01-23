import React from 'react';

function MyResearch() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex font-display">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-sidebar-dark flex flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gold-accent rounded p-1.5 shadow-lg shadow-gold-accent/10">
              <span className="material-symbols-outlined text-primary text-2xl font-bold">balance</span>
            </div>
            <div>
              <h1 className="text-white text-lg font-bold leading-none tracking-tight">NyayNeti</h1>
              <p className="text-gold-accent/70 text-[10px] uppercase tracking-widest mt-1 font-semibold">
                Legal Workspace
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
            <a
              className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors"
              href="#"
            >
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
            <a className="flex items-center gap-3 px-3 py-2.5 sidebar-active" href="#">
              <span className="material-symbols-outlined text-[20px]">bookmarks</span>
              <span className="text-sm font-medium">My Research</span>
            </a>
          </nav>
          <div className="mt-10">
            <div className="flex items-center justify-between px-3 mb-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Workspace Folders
              </p>
              <button className="text-gold-accent hover:text-white">
                <span className="material-symbols-outlined text-sm">create_new_folder</span>
              </button>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
              <a
                className="flex items-center gap-3 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 rounded transition-colors folder-hover"
                href="#"
              >
                <span className="material-symbols-outlined text-[18px] text-gold-muted">folder</span>
                <span>Privacy Law (2024)</span>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 rounded transition-colors folder-hover"
                href="#"
              >
                <span className="material-symbols-outlined text-[18px] text-gold-muted">folder</span>
                <span>Election Petitions</span>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 rounded transition-colors folder-hover"
                href="#"
              >
                <span className="material-symbols-outlined text-[18px] text-gold-muted">folder</span>
                <span>Criminal Appeals</span>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 rounded transition-colors opacity-60 folder-hover"
                href="#"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-500">folder_zip</span>
                <span>Archived 2023</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-auto p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-lg">
            <span className="material-symbols-outlined text-emerald-500 text-[18px]">verified_user</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-none">Local Mode</span>
              <span className="text-[11px] text-white font-medium">Fully Offline Ready</span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-4 mt-2">
            <div className="w-8 h-8 rounded bg-gold-accent/20 flex items-center justify-center text-gold-accent font-bold text-xs">
              AS
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Hon&apos;ble Justice A. Sharma</span>
              <span className="text-[10px] text-slate-500">My Workspace</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white dark:bg-background-dark sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">My Research</h2>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
            <div className="flex gap-4">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">cloud_done</span>
                Local Sync Active
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400 text-sm">search</span>
              <input
                type="text"
                className="pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-1 focus:ring-gold-accent w-64"
                placeholder="Search within research..."
              />
            </div>
            <button className="bg-gold-accent hover:bg-gold-muted text-primary px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span>
              New Folder
            </button>
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
                <span className="text-2xl font-bold text-slate-900 dark:text-white">124</span>
                <span className="text-[10px] text-emerald-500 font-bold">+4 this week</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                Active Folders
              </p>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">8</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                Research Notes
              </p>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">42</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Offline Size</p>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">1.2 GB</span>
            </div>
          </div>

          {/* Recent Bookmarks */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest">
                Recent Bookmarks
              </h3>
              <button className="text-xs text-gold-accent hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-gold-accent/50 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-gold-accent/10 text-amber-800 dark:text-gold-accent text-[9px] font-bold uppercase">
                    Supreme Court
                  </span>
                  <span className="text-slate-400 text-[10px]">2h ago</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                  Navtej Singh Johar v. Union of India
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 italic">
                  &quot;The right to sexual orientation is a core constituent of personhood...&quot;
                </p>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-auto">
                  <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    <span className="material-symbols-outlined text-sm">folder</span>
                    Privacy Law
                  </div>
                  <button className="text-slate-400 hover:text-gold-accent">
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </button>
                </div>
              </div>

              <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-gold-accent/50 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/10 text-emerald-800 dark:text-emerald-400 text-[9px] font-bold uppercase">
                    Delhi High Court
                  </span>
                  <span className="text-slate-400 text-[10px]">Yesterday</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                  M.S. Pharma Ltd v. Drug Controller
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 italic">
                  Critical note added regarding interim injunction protocols.
                </p>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-auto">
                  <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    <span className="material-symbols-outlined text-sm">folder</span>
                    Pharma Cases
                  </div>
                  <button className="text-slate-400 hover:text-gold-accent">
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </button>
                </div>
              </div>

              <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-gold-accent/50 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold uppercase">
                    Research Note
                  </span>
                  <span className="text-slate-400 text-[10px]">3d ago</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                  Drafting Analysis: Data Protection Act
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 italic">
                  Comparison with GDPR standards for digital sovereignty.
                </p>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-auto">
                  <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    <span className="material-symbols-outlined text-sm">sticky_note_2</span>
                    Constitutional
                  </div>
                  <button className="text-slate-400 hover:text-gold-accent">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Files Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Workspace Files</h3>
                <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded p-1">
                  <button className="p-1 px-2 text-[10px] font-bold bg-white dark:bg-slate-600 rounded shadow-sm">
                    All
                  </button>
                  <button className="p-1 px-2 text-[10px] font-bold text-slate-500">Judgments</button>
                  <button className="p-1 px-2 text-[10px] font-bold text-slate-500">Notes</button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-slate-500 hover:text-gold-accent">
                  <span className="material-symbols-outlined text-lg">view_list</span>
                </button>
                <button className="p-1.5 text-slate-400 hover:text-gold-accent">
                  <span className="material-symbols-outlined text-lg">grid_view</span>
                </button>
                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
                <button className="p-1.5 text-slate-500 hover:text-gold-accent flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">filter_list</span>
                  <span className="text-xs font-bold">Filter</span>
                </button>
              </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/30 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">Document Title</th>
                  <th className="px-6 py-3">Folder</th>
                  <th className="px-6 py-3">Last Modified</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gold-accent text-lg">description</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Kesavananda Bharati v. State of Kerala
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">1973 (4) SCC 225</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Constitutional Bench</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-600 dark:text-slate-400">14 Oct 2023</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase">
                      Landmark
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-gold-accent">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400 text-lg">note_alt</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Analysis on Basic Structure Doctrine
                        </p>
                        <p className="text-[10px] text-slate-500">Personal research summary</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Constitutional Bench</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-600 dark:text-slate-400">20 Oct 2023</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] font-bold uppercase">
                      Note
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-gold-accent">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gold-accent text-lg">description</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          S.R. Bommai v. Union of India
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">1994 (3) SCC 1</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Election Petitions</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-600 dark:text-slate-400">18 Oct 2023</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase">
                      Citation
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-gold-accent">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Showing 3 of 124 documents
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded hover:bg-white dark:hover:bg-slate-700">
                  Previous
                </button>
                <button className="px-3 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded hover:bg-white dark:hover:bg-slate-700">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating action buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-3">
          <button className="group flex items-center gap-2 bg-gold-accent hover:bg-gold-muted text-primary px-4 py-3 rounded-full shadow-xl transition-all hover:scale-105">
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-bold">
              AI Analysis Draft
            </span>
          </button>
          <button className="bg-primary hover:bg-slate-800 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all border border-slate-700">
            <span className="material-symbols-outlined text-2xl">question_answer</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default MyResearch;
