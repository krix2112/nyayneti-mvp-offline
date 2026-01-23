import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ResearchBoundaries() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-solid border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 md:px-20 py-3">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-baseline">
              <span className="text-primary dark:text-white text-xl font-bold logo-hindi">न्याय</span>
              <span className="text-accent-gold text-xl font-light ml-1">Neti</span>
            </div>
          </div>
          <div className="flex flex-1 justify-end gap-6 no-print">
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                className="text-slate-600 dark:text-slate-300 hover:text-accent-gold text-sm font-medium transition-colors"
                to="/dashboard"
              >
                Dashboard
              </Link>
              <Link
                className="text-accent-gold text-sm font-bold transition-colors border-b-2 border-accent-gold pb-1"
                to="/boundaries"
              >
                Research Boundaries
              </Link>
              <Link
                className="flex items-center gap-2 px-3 py-1 bg-accent-gold text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all text-xs"
                to="/analysis"
              >
                <span className="material-symbols-outlined text-sm">analytics</span>
                Analysis
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <button className="flex size-10 items-center justify-center rounded-lg bg-slate-200 dark:bg-surface-dark text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <div className="relative">
                <button
                  className="flex size-10 items-center justify-center rounded-lg bg-slate-200 dark:bg-surface-dark text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <span className="material-symbols-outlined">account_circle</span>
                </button>
                {isProfileOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Guest</p>
                      <p className="text-[10px] text-slate-500">Chief Justice&apos;s Bench</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">Profile</button>
                    <button className="w-full text-left px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 md:px-20 py-8 flex gap-12">
        <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-24 h-fit no-print">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-slate-900 dark:text-white text-lg font-bold">Data Framework</h1>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">
                Version 2.4.0 Offline
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <a
                className="active-sidebar-item flex items-center gap-3 px-3 py-3 rounded-r-lg transition-all group"
                href="#sc-precedents"
              >
                <span className="material-symbols-outlined text-accent-gold">account_balance</span>
                <p className="text-slate-900 dark:text-white text-sm font-semibold">SC Precedents</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-200 dark:hover:bg-surface-dark transition-all text-slate-600 dark:text-slate-400"
                href="#hc-rulings"
              >
                <span className="material-symbols-outlined">gavel</span>
                <p className="text-sm font-medium">High Court Rulings</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-200 dark:hover:bg-surface-dark transition-all text-slate-600 dark:text-slate-400"
                href="#central-statutes"
              >
                <span className="material-symbols-outlined">menu_book</span>
                <p className="text-sm font-medium">Central Statutes</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-200 dark:hover:bg-surface-dark transition-all text-slate-600 dark:text-slate-400"
                href="#state-gazettes"
              >
                <span className="material-symbols-outlined">description</span>
                <p className="text-sm font-medium">State Gazettes</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-200 dark:hover:bg-surface-dark transition-all text-slate-600 dark:text-slate-400"
                href="#updates"
              >
                <span className="material-symbols-outlined">cloud_sync</span>
                <p className="text-sm font-medium">Sync Protocol</p>
              </a>
            </div>
            <div className="p-4 rounded-lg bg-accent-gold/5 border border-accent-gold/20">
              <p className="text-xs font-bold text-accent-gold uppercase mb-2">Offline Storage</p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                <div className="bg-accent-gold h-full w-[85%]" />
              </div>
              <p className="text-[10px] text-slate-500">850GB / 1TB Index Localized</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 print-container">
          <nav className="flex items-center gap-2 mb-6 text-sm font-medium no-print">
            <a className="text-slate-500 hover:text-accent-gold" href="#">
              Home
            </a>
            <span className="text-slate-400 font-light">/</span>
            <span className="text-slate-900 dark:text-white">Research Boundaries Framework</span>
          </nav>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-2xl">
              <h1 className="text-slate-900 dark:text-white text-4xl font-extrabold tracking-tight mb-3">
                Research Boundaries Framework
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg serif-content italic">
                Defining the indexed domains and jurisdictional scope for secure offline intelligence.
              </p>
            </div>
            <button
              className="no-print flex items-center gap-2 rounded-lg h-10 px-4 bg-primary dark:bg-surface-dark text-white text-sm font-bold border border-slate-800 dark:border-slate-700 hover:bg-slate-900 transition-colors"
              onClick={handlePrint}
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              Export Framework
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <section
              className="p-8 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 transition-all hover:border-accent-gold/50"
              id="sc-precedents"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary text-accent-gold rounded-lg shadow-inner">
                  <span className="material-symbols-outlined text-2xl">account_balance</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold dark:text-white">Supreme Court Precedents</h3>
                  <p className="text-xs font-bold text-accent-gold uppercase tracking-widest">
                    Full Digital Archive
                  </p>
                </div>
              </div>
              <div className="serif-content text-slate-700 dark:text-slate-300 text-lg leading-relaxed space-y-4">
                <p>Comprehensive offline indexing of all reported judgments from 1950 to current release.</p>
                <ul className="text-base space-y-2 list-none">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-accent-gold text-sm mt-1">
                      check_circle
                    </span>
                    <span>Full-text search across 50,000+ judgments.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-accent-gold text-sm mt-1">
                      check_circle
                    </span>
                    <span>Cross-referenced citation mapping (SCR, SCC, AIR).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-accent-gold text-sm mt-1">
                      check_circle
                    </span>
                    <span>Overruled/Reversed status tracking.</span>
                  </li>
                </ul>
              </div>
            </section>

            <section
              className="p-8 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 transition-all hover:border-accent-gold/50"
              id="hc-rulings"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary text-accent-gold rounded-lg shadow-inner">
                  <span className="material-symbols-outlined text-2xl">gavel</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold dark:text-white">High Court Rulings</h3>
                  <p className="text-xs font-bold text-accent-gold uppercase tracking-widest">
                    25 Jurisdictions
                  </p>
                </div>
              </div>
              <div className="serif-content text-slate-700 dark:text-slate-300 text-lg leading-relaxed space-y-4">
                <p>Jurisdiction-specific datasets covering all 25 High Courts in India.</p>
                <ul className="text-base space-y-2 list-none">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-accent-gold text-sm mt-1">
                      check_circle
                    </span>
                    <span>Filter by specific High Court or Full-India search.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-accent-gold text-sm mt-1">
                      check_circle
                    </span>
                    <span>Digitized records back to establishment dates.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-accent-gold text-sm mt-1">
                      check_circle
                    </span>
                    <span>Verified offline corpus for citation validation.</span>
                  </li>
                </ul>
              </div>
            </section>

            <section
              className="p-8 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 transition-all hover:border-accent-gold/50"
              id="central-statutes"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary text-accent-gold rounded-lg shadow-inner">
                  <span className="material-symbols-outlined text-2xl">menu_book</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold dark:text-white">Central Statutes</h3>
                  <p className="text-xs font-bold text-accent-gold uppercase tracking-widest">
                    Bare Acts &amp; Rules
                  </p>
                </div>
              </div>
              <div className="serif-content text-slate-700 dark:text-slate-300 text-lg leading-relaxed space-y-4">
                <p>Live-amended central acts including primary legislation and delegated rules.</p>
                <ul className="text-base space-y-2 list-none">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-accent-gold text-sm mt-1">
                      check_circle
                    </span>
                    <span>Indexed Section-wise for granular retrieval.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-accent-gold text-sm mt-1">
                      check_circle
                    </span>
                    <span>Historical amendment tracking (version control).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-accent-gold text-sm mt-1">
                      check_circle
                    </span>
                    <span>Comparative analysis of legislative changes.</span>
                  </li>
                </ul>
              </div>
            </section>

            <section
              className="p-8 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 transition-all hover:border-accent-gold/50"
              id="state-gazettes"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary text-accent-gold rounded-lg shadow-inner">
                  <span className="material-symbols-outlined text-2xl">description</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold dark:text-white">State Gazettes</h3>
                  <p className="text-xs font-bold text-accent-gold uppercase tracking-widest">
                    Local Laws &amp; Notifications
                  </p>
                </div>
              </div>
              <div className="serif-content text-slate-700 dark:text-slate-300 text-lg leading-relaxed space-y-4">
                <p>
                  State-specific legal intelligence including gazette notifications and local amendments.
                </p>
                <ul className="text-base space-y-2 list-none">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-accent-gold text-sm mt-1">
                      check_circle
                    </span>
                    <span>Multi-lingual OCR support for regional gazettes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-accent-gold text-sm mt-1">
                      check_circle
                    </span>
                    <span>Local government notification repository.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-accent-gold text-sm mt-1">
                      check_circle
                    </span>
                    <span>State-specific Rules and Regulations index.</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>

          <section className="bg-primary text-white rounded-xl p-8 mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-2/3">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent-gold">security</span>
                  Institutional Scope &amp; Compliance
                </h2>
                <p className="serif-content text-slate-300 text-lg leading-relaxed">
                  The dataset provided by NyayNeti is designed for judicial support and institutional
                  verification. Every indexed record is cryptographically signed to ensure authenticity
                  against official government repositories.{' '}
                  <strong>Offline availability</strong> is guaranteed for all core datasets to maintain
                  air-gapped security protocols within court premises.
                </p>
              </div>
              <div className="md:w-1/3 flex flex-col items-center justify-center p-6 border border-accent-gold/30 rounded-lg bg-white/5">
                <div className="text-4xl font-black text-accent-gold mb-1">99.8%</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Index Integrity
                </div>
                <div className="mt-4 text-[10px] text-center text-slate-500 font-medium">
                  Daily differential sync protocol active via institutional secure LAN.
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 text-center mb-10">
            <div className="inline-flex flex-col items-center p-6 border border-accent-gold/20 rounded-xl bg-slate-50 dark:bg-surface-dark/50">
              <div className="flex items-center gap-4 text-primary dark:text-white mb-4">
                <div className="size-8 text-accent-gold">
                  <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path
                      clipRule="evenodd"
                      d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                      fill="currentColor"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-lg font-bold tracking-tight">
                  <span className="font-serif italic text-accent-gold normal-case">न्याय</span>NETI CORE
                </span>
              </div>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                Authenticated Research Boundary Framework - V.2023.10.12
              </p>
              <p className="mt-2 text-slate-400 text-xs italic serif-content">
                For the exclusive use of Judges and Legal Institutions of India.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default ResearchBoundaries;
