import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function GeneralDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      // In a real app, we might store this in a global state or context
      // Redirect to analysis page
      navigate('/analysis');
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex font-display">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-primary flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-baseline">
              <span className="text-white text-2xl font-bold logo-hindi">न्याय</span>
              <span className="text-accent-gold text-2xl font-light ml-1">Neti</span>
            </div>
          </div>
          <nav className="space-y-1">
            <Link className="flex items-center gap-3 px-3 py-2.5 sidebar-active" to="/dashboard">
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
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-lg mb-4">
            <span className="material-symbols-outlined text-accent-gold text-[18px]">verified_user</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-none">Offline Database</span>
              <span className="text-[11px] text-white font-medium italic">Fully Encrypted</span>
            </div>
          </div>
          <div className="relative">
            <div
              className="flex items-center gap-3 px-3 py-4 cursor-pointer hover:bg-slate-800/30 rounded-lg transition-colors"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center border border-accent-gold/30">
                <span className="text-accent-gold text-xs font-bold">G</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Guest</span>
                <span className="text-[10px] text-slate-500">Chief Justice&apos;s Bench</span>
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

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white dark:bg-card-dark sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-slate-800 dark:text-white">Central Hub</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Local Engine Active
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Supreme Court of India</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Intelligence Dashboard • October 24, 2023
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/analysis" className="flex items-center gap-2 px-4 py-2 bg-accent-gold text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all text-sm">
                <span className="material-symbols-outlined text-lg">analytics</span>
                Analysis
              </Link>
              <Link to="/boundaries" className="flex items-center gap-2 px-4 py-2 border border-accent-gold text-accent-gold font-bold rounded-lg hover:bg-accent-gold hover:text-primary transition-all text-sm">
                <span className="material-symbols-outlined text-lg">explore</span>
                Research Boundaries
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Upload card */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">
                    Upload Judgment for Analysis
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-accent-gold tracking-widest bg-accent-gold/10 px-2 py-1 rounded">
                    Offline Processing
                  </span>
                </div>
                <div className="p-8 flex-1">
                  <div
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/20 p-12 text-center flex flex-col items-center justify-center hover:border-accent-gold transition-colors cursor-pointer group dropzone-pattern"
                    onClick={triggerFileUpload}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf"
                      className="hidden"
                    />
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-accent-gold text-3xl">upload_file</span>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Drop judgment PDF here
                    </h4>
                    <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
                      Analyze facts, issues, and precedents automatically using the NyayNeti local engine.
                    </p>
                    <button className="mt-6 px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      Select File
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column cards */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-primary border border-accent-gold/30 rounded-xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-8xl text-accent-gold">analytics</span>
                </div>
                <h3 className="text-accent-gold text-xs font-black uppercase tracking-[0.2em] mb-4">
                  Research Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                    <div>
                      <p className="text-slate-400 text-[11px] font-bold">SAVED PRECEDENTS</p>
                      <p className="text-3xl font-bold text-white">1,248</p>
                    </div>
                    <span className="material-symbols-outlined text-accent-gold">bookmark_added</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                    <div>
                      <p className="text-slate-400 text-[11px] font-bold">LOCAL DATABASES</p>
                      <p className="text-3xl font-bold text-white">4.2 TB</p>
                    </div>
                    <span className="material-symbols-outlined text-accent-gold">database</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                    <div>
                      <p className="text-slate-400 text-[11px] font-bold">CITATIONS ANALYZED</p>
                      <p className="text-3xl font-bold text-white">12.4k</p>
                    </div>
                    <span className="material-symbols-outlined text-accent-gold">query_stats</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-accent-gold">auto_awesome</span>
                  Recommended Reads
                </h3>
                <div className="space-y-4">
                  <div className="group cursor-pointer">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Landmark</p>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-accent-gold transition-colors">
                      Evolution of Basic Structure Doctrine
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      Analysis of Kesavananda Bharati through modern lenses.
                    </p>
                  </div>
                  <div className="group cursor-pointer">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                      Constitutional
                    </p>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-accent-gold transition-colors">
                      Privacy in Digital Surveillance
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      Review of Post-Puttaswamy compliance by High Courts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity table */}
            <div className="col-span-12">
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">Recent Activity</h3>
                  <button className="text-xs font-bold text-accent-gold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left bg-slate-50 dark:bg-slate-800/40">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Case Name / Action
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Type
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Status
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Timestamp
                        </th>
                        <th className="px-6 py-4" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <span className="material-symbols-outlined text-lg">description</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                A. Verma v. State of Maharashtra
                              </p>
                              <p className="text-[10px] text-slate-500">Citations extracted: 42</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Judgment Analysis
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Complete
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">Today, 10:24 AM</td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-1 hover:text-accent-gold">
                            <span className="material-symbols-outlined text-lg">more_vert</span>
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                              <span className="material-symbols-outlined text-lg">search_spark</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                Query: &apos;Right to be forgotten&apos;
                              </p>
                              <p className="text-[10px] text-slate-500">
                                Across High Courts (1995-2023)
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Precedent Search
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Complete
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">Yesterday, 4:45 PM</td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-1 hover:text-accent-gold">
                            <span className="material-symbols-outlined text-lg">more_vert</span>
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                              <span className="material-symbols-outlined text-lg">folder_zip</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                Offline Sync: SC Landmarks
                              </p>
                              <p className="text-[10px] text-slate-500">Updated 1,400 local documents</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            System Update
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Indexing...
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">Oct 22, 11:30 AM</td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-1 hover:text-accent-gold">
                            <span className="material-symbols-outlined text-lg">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Legal Assistant button removed */}
    </div>
  );
}

export default GeneralDashboard;

