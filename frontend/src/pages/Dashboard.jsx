import React, { useState } from 'react';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('insights');
  const [currentPage, setCurrentPage] = useState(12);
  const [zoomLevel, setZoomLevel] = useState(100);

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-200 overflow-hidden h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#2b2f36] bg-primary px-6 py-3 shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-white">
            <div className="size-6 text-blue-400">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  clipRule="evenodd"
                  d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-white text-xl font-bold leading-tight tracking-tight">NyayNeti</h2>
          </div>
          <div className="flex items-center gap-2 bg-[#1a2332] px-3 py-1.5 rounded-lg border border-[#2b2f36]">
            <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
            <p className="text-xs font-medium text-slate-300 uppercase tracking-wider">
              Offline Intelligence Active
            </p>
          </div>
        </div>
        <div className="flex flex-1 justify-center max-w-xl mx-8">
          <label className="flex flex-col w-full !h-10">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div
                className="text-[#a1a8b5] flex border-none bg-[#1a2332] items-center justify-center pl-4 rounded-l-lg"
                data-icon="search"
              >
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 border-none bg-[#1a2332] text-white focus:ring-0 h-full placeholder:text-[#a1a8b5] px-4 rounded-r-lg text-sm font-normal"
                placeholder="Search precedents, statutes or case laws..."
                defaultValue=""
              />
            </div>
          </label>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 mr-4 border-r border-[#2b2f36] pr-6">
            <a className="text-slate-400 hover:text-white text-sm font-medium transition-colors" href="#">
              Library
            </a>
            <a className="text-slate-400 hover:text-white text-sm font-medium transition-colors" href="#">
              Research Logs
            </a>
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center justify-center rounded-lg h-10 w-10 bg-[#2b2f36] text-white hover:bg-[#3b414d] transition-colors"
              title="Print Case"
            >
              <span className="material-symbols-outlined text-[20px]">print</span>
            </button>
            <button
              className="flex items-center justify-center rounded-lg h-10 w-10 bg-[#2b2f36] text-white hover:bg-[#3b414d] transition-colors"
              title="Download Offline Bundle"
            >
              <span className="material-symbols-outlined text-[20px]">download_for_offline</span>
            </button>
          </div>
          <div
            className="ml-2 bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 ring-2 ring-blue-500/20"
            data-alt="User profile avatar"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDwH2zYj8l2ZgkB2J5TZZwvLRulGiouYWUbBM2MSkiCkGTw7k2HtxnTrX8kq9vnQzMUO6hnz58BLFRA5NnjcZg2XLlCAomTnK6jCGWYRO_LLNpB6CAlq91uuW-bjANCZzDWDkiOqa90kfj5pBMUo1RvxtvfqaTNlMsNf7SrqnQ2FjXZPDe0xx6kEUKJyZycOiPdTFTV3BuVo02_0ZMFCJamOm23QyWiA4KEYqcQ5rVJnoTKKkPd1F_992n_-XBYpv6QPTekBuzwx6Zs")'
            }}
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Side Navigation (Collapsed Icons Only) */}
        <aside className="w-16 flex flex-col items-center py-6 bg-primary border-r border-[#2b2f36] gap-8">
          <div className="flex flex-col gap-6">
            <button
              className="text-blue-400 flex items-center justify-center p-2 rounded-xl bg-blue-500/10"
              title="Dashboard"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                dashboard
              </span>
            </button>
            <button
              className="text-slate-400 hover:text-white flex items-center justify-center p-2 rounded-xl hover:bg-white/5 transition-all"
              title="Active Cases"
            >
              <span className="material-symbols-outlined">gavel</span>
            </button>
            <button
              className="text-slate-400 hover:text-white flex items-center justify-center p-2 rounded-xl hover:bg-white/5 transition-all"
              title="Citations"
            >
              <span className="material-symbols-outlined">menu_book</span>
            </button>
            <button
              className="text-slate-400 hover:text-white flex items-center justify-center p-2 rounded-xl hover:bg-white/5 transition-all"
              title="Archives"
            >
              <span className="material-symbols-outlined">folder</span>
            </button>
          </div>
          <div className="mt-auto flex flex-col gap-6">
            <button className="text-slate-400 hover:text-white" title="Settings">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumbs & Heading */}
          <div className="px-6 pt-4 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <a className="text-[#a1a8b5] text-xs font-medium hover:text-white" href="#">
                Case Archive
              </a>
              <span className="text-[#3f4550] text-xs">/</span>
              <span className="text-white text-xs font-medium">Supreme Court of India</span>
            </div>
            <div className="flex justify-between items-end pb-4 border-b border-[#2b2f36]">
              <div>
                <h1 className="text-white text-2xl font-bold leading-tight">
                  State of Maharashtra vs. XYZ (Appellate Jurisdiction)
                </h1>
                <p className="text-[#a1a8b5] text-xs mt-1 font-normal">
                  Case ID: SC-2023-4421 • Bench: Justice Khanna, Justice Maheshwari • Decision Date: Oct 24,
                  2023
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 h-9 rounded-lg bg-[#2b2f36] text-white text-xs font-semibold hover:bg-[#3b414d] transition-all border border-[#3f4550]">
                  <span className="material-symbols-outlined text-sm">share</span>
                  Internal Share
                </button>
                <button className="flex items-center gap-2 px-4 h-9 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
                  <span className="material-symbols-outlined text-sm">description</span>
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Split View */}
          <div className="flex flex-1 overflow-hidden p-6 gap-6">
            {/* Left Panel: PDF Viewer */}
            <div className="flex-[3] flex flex-col bg-[#1a2332] rounded-xl border border-[#2b2f36] overflow-hidden shadow-2xl relative">
              <div className="h-12 bg-primary/40 border-b border-[#2b2f36] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-black/30 rounded px-2 py-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mr-2">
                      Page
                    </span>
                    <input
                      className="bg-transparent border-none p-0 w-6 text-xs text-white text-center focus:ring-0"
                      type="text"
                      value={currentPage}
                      onChange={(e) => setCurrentPage(parseInt(e.target.value) || 12)}
                    />
                    <span className="text-slate-500 text-xs ml-1">/ 142</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="text-slate-400 hover:text-white"
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                  >
                    <span className="material-symbols-outlined text-lg">zoom_out</span>
                  </button>
                  <span className="text-xs font-medium text-slate-300">{zoomLevel}%</span>
                  <button
                    className="text-slate-400 hover:text-white"
                    onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                  >
                    <span className="material-symbols-outlined text-lg">zoom_in</span>
                  </button>
                  <div className="w-px h-4 bg-[#2b2f36] mx-1" />
                  <button className="text-slate-400 hover:text-white">
                    <span className="material-symbols-outlined text-lg">search</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-[#0d121b] p-8 custom-scrollbar">
                {/* Simulated PDF Page */}
                <div
                  className="max-w-2xl mx-auto bg-white dark:bg-[#eef1f5] p-16 text-[#1a1a1a] pdf-page-shadow rounded-sm min-h-[1000px] relative"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                >
                  <div className="absolute left-4 top-16 flex flex-col gap-6 text-[10px] text-blue-500 font-bold opacity-30 select-none">
                    <span>PARA 14</span>
                    <span>PARA 15</span>
                    <span>PARA 16</span>
                    <span>PARA 17</span>
                  </div>
                  <h3 className="text-center font-bold text-lg mb-8 uppercase border-b-2 border-black pb-4">
                    In the Supreme Court of India
                  </h3>
                  <div className="space-y-6 text-sm leading-relaxed text-justify">
                    <p>
                      <span className="font-bold">14.</span> It is observed that the High Court failed to account
                      for the precedence set in{' '}
                      <span className="bg-blue-100 px-1 border-b-2 border-blue-400">
                        Arjun Panditrao Khotkar vs. Kailash Kushanrao Gorantyal (2020)
                      </span>
                      , particularly regarding the interpretation of Section 65B of the Indian Evidence Act. The
                      requirement of a certificate is not merely procedural but substantive when electronic records
                      are produced from a primary source not in possession of the party.
                    </p>
                    <p className="bg-amber-100/80 ring-1 ring-amber-200 rounded-sm p-1 -mx-1">
                      <span className="font-bold">15.</span> We find merit in the appellant&apos;s argument that the
                      integrity of the hash value produced by the forensic lab was compromised during the initial
                      seizure. The chain of custody, as documented in Exhibit P-42, shows a gap of 48 hours where
                      the digital assets were stored in a non-secured environment without electromagnetic shielding.
                    </p>
                    <p>
                      <span className="font-bold">16.</span> Consequently, the reliance placed by the lower court on
                      the forensic report (CFSL-2021-998) is misplaced. The presumption of regularity of official
                      acts under Section 114(e) cannot override the specific procedural safeguards mandated for
                      digital evidence.
                    </p>
                    <p>
                      <span className="font-bold">17.</span> In light of these discrepancies, the conviction stands
                      on shaky ground. The foundational evidence required to establish the nexus between the digital
                      communications and the alleged conspiracy is insufficient to meet the standard of
                      &apos;beyond reasonable doubt&apos;.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Analysis Panel */}
            <div className="flex-[2] flex flex-col bg-primary/40 rounded-xl border border-[#2b2f36] overflow-hidden">
              <div className="shrink-0">
                <div className="flex border-b border-[#2b2f36] px-4">
                  <button
                    onClick={() => setActiveTab('insights')}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider ${
                      activeTab === 'insights'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">psychology</span>
                    AI Insights
                  </button>
                  <button
                    onClick={() => setActiveTab('citations')}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider ${
                      activeTab === 'citations'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">bookmark</span>
                    Citations
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider ${
                      activeTab === 'history'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">history</span>
                    History
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
                {/* Summary Section */}
                <div className="bg-[#1a2332] rounded-lg p-4 border border-[#2b2f36]">
                  <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400 text-sm">summarize</span>
                    Executive Summary
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    The court is examining the admissibility of electronic evidence lacking proper certification under{' '}
                    <span className="text-blue-400 font-medium">Sec 65B(4)</span>. Current focus is on procedural
                    gaps in digital chain-of-custody.
                  </p>
                </div>

                {/* Key Findings Feed */}
                <div className="space-y-4">
                  <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-1">
                    Intelligent Extractions
                  </h4>

                  {/* Card 1 */}
                  <div className="group bg-[#1a2332] hover:bg-[#202a3d] transition-all rounded-lg border border-[#2b2f36] p-4 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/50" />
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        PROCEDURAL ERROR
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-slate-500">Relevance</span>
                        <div className="w-12 h-1 bg-[#2b2f36] rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full w-[92%]" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-400">92%</span>
                      </div>
                    </div>
                    <p className="text-slate-200 text-sm font-medium mb-3">
                      Chain of custody gap (48 hours) identified in digital forensic handling.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1 bg-[#2b2f36] rounded px-2 py-1 text-[10px] text-slate-300">
                          <span className="material-symbols-outlined text-xs">description</span>
                          P. 12, Para 15
                        </div>
                      </div>
                      <button className="text-blue-400 text-xs font-bold hover:underline flex items-center gap-1">
                        View in PDF
                        <span className="material-symbols-outlined text-xs">arrow_right_alt</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="group bg-[#1a2332] hover:bg-[#202a3d] transition-all rounded-lg border border-[#2b2f36] p-4 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50" />
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
                        PRECEDENT LINK
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-slate-500">Relevance</span>
                        <div className="w-12 h-1 bg-[#2b2f36] rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full w-[85%]" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-400">85%</span>
                      </div>
                    </div>
                    <p className="text-slate-200 text-sm font-medium mb-3">
                      Application of Arjun Panditrao Khotkar (2020) regarding mandatory 65B certification.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1 bg-[#2b2f36] rounded px-2 py-1 text-[10px] text-slate-300">
                          <span className="material-symbols-outlined text-xs">description</span>
                          P. 12, Para 14
                        </div>
                      </div>
                      <button className="text-blue-400 text-xs font-bold hover:underline flex items-center gap-1">
                        View in PDF
                        <span className="material-symbols-outlined text-xs">arrow_right_alt</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="group bg-[#1a2332] hover:bg-[#202a3d] transition-all rounded-lg border border-[#2b2f36] p-4 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500/50" />
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">
                        STATUTORY INTERP.
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-slate-500">Relevance</span>
                        <div className="w-12 h-1 bg-[#2b2f36] rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full w-[70%]" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-400">70%</span>
                      </div>
                    </div>
                    <p className="text-slate-200 text-sm font-medium mb-3">
                      Exclusion of presumption under Section 114(e) for specialized digital procedures.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1 bg-[#2b2f36] rounded px-2 py-1 text-[10px] text-slate-300">
                          <span className="material-symbols-outlined text-xs">description</span>
                          P. 12, Para 16
                        </div>
                      </div>
                      <button className="text-blue-400 text-xs font-bold hover:underline flex items-center gap-1">
                        View in PDF
                        <span className="material-symbols-outlined text-xs">arrow_right_alt</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Local Processed Info */}
                <div className="pt-4 border-t border-[#2b2f36]">
                  <div className="flex items-center justify-between text-[#a1a8b5] text-[10px] font-medium px-1">
                    <span>Analysis Latency: 420ms (Local)</span>
                    <span>Model: NyayNeti-v2.1-Legal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Footer/Status Bar */}
          <footer className="h-10 bg-primary border-t border-[#2b2f36] flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="size-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                  Local Neural Engine Ready
                </span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">storage</span>
                Synced: 2 mins ago
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-slate-500 uppercase font-medium">
                Shortcuts:{' '}
                <kbd className="bg-[#2b2f36] px-1 rounded text-slate-300">Ctrl + F</kbd> Find,{' '}
                <kbd className="bg-[#2b2f36] px-1 rounded text-slate-300">Ctrl + L</kbd> Cite
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
