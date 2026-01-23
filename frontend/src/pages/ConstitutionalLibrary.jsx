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
            <button className="text-slate-500 hover:text-slate-800 dark:hover:text-white">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-md">
                Justice K.S. Puttaswamy (Retd.) v. Union of India (2017)
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Link to="/analysis" className="flex items-center gap-2 px-3 py-1 bg-accent-gold text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all text-[10px]">
                <span className="material-symbols-outlined text-sm">analytics</span>
                Analysis
              </Link>
              <Link to="/boundaries" className="flex items-center gap-2 px-3 py-1 border border-accent-gold text-accent-gold font-bold rounded-lg hover:bg-accent-gold hover:text-primary transition-all text-[10px]">
                <span className="material-symbols-outlined text-sm">explore</span>
                Boundaries
              </Link>
            </div>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2" />
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <span className="material-symbols-outlined text-sm">settings</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* PDF viewer section */}
          <section className="flex-1 bg-slate-200 dark:bg-slate-900 overflow-y-auto pdf-viewer-scroll p-8">
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 shadow-2xl min-h-[1200px] p-16 relative">
              <div className="absolute top-8 right-8 text-slate-300 dark:text-slate-700 select-none">
                <p className="text-4xl font-black">CONFIDENTIAL</p>
              </div>
              <div className="text-center mb-12">
                <h3 className="text-xl font-bold uppercase mb-2">In the Supreme Court of India</h3>
                <p className="text-sm text-slate-500">Civil Advisory Jurisdiction</p>
                <div className="w-16 h-1 bg-slate-900 dark:bg-slate-400 mx-auto mt-4" />
              </div>
              <div className="space-y-6 text-slate-800 dark:text-slate-200 leading-relaxed text-justify">
                <p className="font-bold">Writ Petition (Civil) No. 494 of 2012</p>
                <p className="italic text-sm">
                  Justice K.S. Puttaswamy (Retd.) and Anr. ...Petitioners
                </p>
                <p className="font-bold text-center py-4 text-lg">Versus</p>
                <p className="italic text-sm">Union of India and Ors. ...Respondents</p>

                <div className="h-px bg-slate-200 dark:bg-slate-700 my-8" />

                <h4 className="font-bold text-lg uppercase mb-4">Judgment</h4>
                <p>
                  1. The challenge in the present case is directed against the Constitutional validity
                  of the Aadhaar Card Scheme. The petitioners contend that the mandatory requirement of
                  an Aadhaar card for various government services violates the fundamental right to
                  privacy.
                </p>
                <p>
                  2. During the course of hearings, a question of significant constitutional
                  importance has arisen: whether the Constitution of India guarantees a fundamental
                  right to privacy. The respondents, relying on the decisions in M.P. Sharma v. Satish
                  Chandra (1954) and Kharak Singh v. State of U.P. (1962), argue that privacy is not a
                  fundamental right.
                </p>
                <p>
                  3. Having considered the evolution of jurisprudence on personal liberty under
                  Article 21, this Bench is of the opinion that the previous decisions require a
                  comprehensive re-examination by a larger Bench of nine judges...
                </p>
              </div>
            </div>
          </section>

          {/* Right intelligence panel */}
          <section className="w-[450px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">analytics</span>
                <h3 className="text-sm font-bold uppercase tracking-wider">AI Intelligence Panel</h3>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500">
                  <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Key Legal Concepts
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-800">
                    Right to Privacy
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                    Article 21
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                    Digital Surveillance
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                    Informed Consent
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined text-[18px]">summarize</span>
                  <span className="text-xs font-bold uppercase">Executive Summary</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  This landmark judgment affirms the right to privacy as an intrinsic part of the
                  right to life and personal liberty under Article 21. It establishes the
                  &quot;Proportionality Test&quot; for any state intrusion into individual privacy.
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Precedent Alignment
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-r-lg">
                    <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">warning</span>
                    <div>
                      <p className="text-[11px] font-bold text-red-700 dark:text-red-400">
                        ADM Jabalpur Case (1976)
                      </p>
                      <p className="text-[10px] text-slate-500 leading-normal mt-1 italic">
                        Explicitly overruled in this judgment regarding suspension of rights during
                        emergency.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-emerald-500 rounded-r-lg">
                    <span className="material-symbols-outlined text-emerald-500 text-sm mt-0.5">
                      check_circle
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        Maneka Gandhi v. UOI (1978)
                      </p>
                      <p className="text-[10px] text-slate-500 leading-normal mt-1 italic">
                        Principles of due process and personal liberty reaffirmed and expanded.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Procedural Timeline
                </h4>
                <div className="space-y-4 relative before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-4 border-white dark:border-background-dark" />
                    <p className="text-[11px] font-bold dark:text-white">Aug 24, 2017</p>
                    <p className="text-[10px] text-slate-500">
                      9-Judge Bench delivers final verdict on fundamental right status.
                    </p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <p className="text-[11px] font-bold dark:text-white">Jul 18, 2017</p>
                    <p className="text-[10px] text-slate-500">
                      Commencement of arguments before the Constitution Bench.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative">
                <textarea
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none resize-none placeholder:text-slate-400"
                  placeholder="Ask intelligence query about this document..."
                />
                <button className="absolute bottom-2 right-2 p-1.5 bg-primary text-white rounded-lg hover:bg-blue-900 transition-all">
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-slate-400 font-medium">Neural Processing Active</span>
                <div className="flex gap-2">
                  <button className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight">
                    Cite Insight
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ConstitutionalLibrary;

