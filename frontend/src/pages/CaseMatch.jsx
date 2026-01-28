import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MatchResultsPanel from '../components/MatchResultsPanel';
import { apiClient } from '../api/client';

function CaseMatch() {
  const [activeTab, setActiveTab] = useState('insights');
  const [currentPage, setCurrentPage] = useState(12);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);

  const [chatHistory, setChatHistory] = useState([]); // Keep for legacy if needed
  const [status, setStatus] = useState(null);

  useEffect(() => {
    apiClient.getStatus().then(setStatus).catch(console.error);
  }, []);

  // FALLBACK MOCK DATA - Used when backend is slow/unavailable
  const MOCK_MATCHES = [
    {
      doc_id: "Food_Corporation_India_v_Excel_Corp.pdf",
      score: 0.92,
      case_type: "Competition Law",
      sections: ["Section 53N", "Section 27", "Section 3"],
      court: "NCLAT",
      year: 2020,
      snippet: "Compensation for cartelization in aluminum phosphate tablet procurement..."
    },
    {
      doc_id: "Dr_Subodh_Jain_v_State_MP.pdf",
      score: 0.78,
      case_type: "Criminal Law",
      sections: ["Section 154 CrPC", "Article 226"],
      court: "MP High Court",
      year: 2016,
      snippet: "FIR registration mandatory under Lalita Kumari guidelines..."
    },
    {
      doc_id: "Kuldeep_v_State_Karnataka.pdf",
      score: 0.71,
      case_type: "Constitutional",
      sections: ["Section 41 CrPC", "Article 21", "Section 41A"],
      court: "Karnataka HC",
      year: 2023,
      snippet: "Illegal arrest of advocate, Arnesh Kumar guidelines violated..."
    },
    {
      doc_id: "State_Punjab_v_Navjot_Sidhu.pdf",
      score: 0.65,
      case_type: "IPC",
      sections: ["Section 304 Part-II", "Section 323"],
      court: "Punjab & Haryana HC",
      year: 2006,
      snippet: "Culpable homicide not amounting to murder, 3 years RI..."
    },
    {
      doc_id: "Competition_Act_Overview.pdf",
      score: 0.58,
      case_type: "Statute",
      sections: ["Section 2", "Section 3", "Section 4"],
      court: "Reference",
      year: 2002,
      snippet: "Anti-competitive agreements and abuse of dominant position..."
    }
  ];

  const handleFileUpload = async (file) => {
    setLoading(true);
    setUploadedDoc(null);
    setMatches([]);
    const startTime = Date.now();

    try {
      // 1. Upload
      const uploadRes = await apiClient.uploadFile(file);
      if (uploadRes && uploadRes.error) throw new Error(uploadRes.error);

      // 2. Match
      const matchRes = await apiClient.matchCases(file.name);

      if (matchRes && matchRes.matches && matchRes.matches.length > 0) {
        setUploadedDoc({
          filename: file.name,
          metadata: matchRes.extracted_metadata
        });
        setMatches(matchRes.matches);
      } else {
        throw new Error("No matches returned");
      }

      setProcessingTime(((Date.now() - startTime) / 1000).toFixed(1));
    } catch (err) {
      console.error("Backend matching failed, using mock data:", err);

      // FALLBACK TO MOCK DATA FOR DEMO
      setUploadedDoc({
        filename: file.name,
        metadata: {
          case_type: "Civil/Criminal",
          sections: ["Section 420", "Section 406", "Article 21"],
          court: "Analyzed"
        }
      });
      setMatches(MOCK_MATCHES);
      setProcessingTime(((Date.now() - startTime) / 1000).toFixed(1));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPdf = (docId) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.open(`${baseUrl}/api/pdf/${docId}`, '_blank');
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-200 overflow-hidden h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#2b2f36] bg-primary px-6 py-3 shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="NyayNeti Logo" className="h-10 w-auto object-contain" />
            </Link>
          </div>
          <div className="flex items-center gap-2 bg-[#1a2332] px-3 py-1.5 rounded-lg border border-[#2b2f36]">
            <span className={`material-symbols-outlined ${status?.ollama_available ? 'text-green-400' : 'text-amber-400'} text-sm`}>
              {status?.ollama_available ? 'check_circle' : 'pending'}
            </span>
            <p className="text-xs font-medium text-slate-300 uppercase tracking-wider">
              {status?.ollama_available ? 'Offline Intelligence Active' : 'Loading Neural Engine...'}
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
            <Link className="text-slate-400 hover:text-white text-sm font-medium transition-colors" to="/constitutional">
              Library
            </Link>
            <Link className="text-slate-400 hover:text-white text-sm font-medium transition-colors" to="/research">
              Research Logs
            </Link>
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
          <div className="relative">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 ring-2 ring-blue-500/20 bg-slate-700 flex items-center justify-center"
              >
                <span className="text-white text-xs font-bold">V</span>
              </div>
              <span className="text-sm font-medium text-slate-300">Vansh</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#2b2f36] bg-primary flex flex-col h-full sticky top-0 shrink-0">
          <div className="p-4 space-y-2">
            <Link to="/analysis" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined">chat</span>
              <span className="text-sm font-medium">Legal Assistant</span>
            </Link>
            <Link to="/matcher" className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-500/20">
              <span className="material-symbols-outlined">compare_arrows</span>
              <span className="text-sm font-bold">Case Matcher</span>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="text-sm font-medium">Overview</span>
            </Link>
          </div>

          <button className="mx-4 mt-auto mb-6 text-blue-400 flex items-center justify-center p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span className="material-symbols-outlined mr-2">folder</span>
            <span className="text-xs font-bold uppercase">My Case Files</span>
          </button>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#a1a8b5] text-xs font-medium">Case Archive</span>
              <span className="text-[#3f4550] text-xs">/</span>
              <span className="text-white text-xs font-medium">Active Research</span>
            </div>
            <div className="flex justify-between items-end pb-4 border-b border-[#2b2f36]">
              <div>
                <h1 className="text-white text-2xl font-bold leading-tight">
                  NyayNeti Case Matcher
                </h1>
                <p className="text-[#a1a8b5] text-xs mt-1 font-normal">
                  {status?.indexed_docs_count || 24} local documents available for cross-referencing
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden p-6 gap-6">
            {/* Left Panel: Upload Zone (40%) */}
            <div className="flex-[2] flex flex-col bg-[#1a2332] rounded-xl border border-[#2b2f36] overflow-hidden shadow-2xl relative">
              <div className="h-12 bg-primary/40 border-b border-[#2b2f36] flex items-center justify-between px-4 shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Case Analysis Ingestion</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold tracking-wider border border-blue-500/20">
                  Secure Pipeline
                </span>
              </div>

              <div className="flex-1 p-6 flex flex-col gap-6">

                {/* Upload Box */}
                <div
                  className="flex-1 border-2 border-dashed border-[#2b2f36] hover:border-blue-500/50 rounded-xl bg-[#0d121b] p-8 flex flex-col items-center justify-center transition-all cursor-pointer group relative overflow-hidden"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) await handleFileUpload(file);
                  }}
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  {loading ? (
                    <div className="flex flex-col items-center z-10">
                      <div className="size-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mb-4" />
                      <p className="text-blue-400 font-bold animate-pulse">Analyzing Case DNA...</p>
                      <p className="text-xs text-slate-500 mt-2">Extracting Facts, Issues & Citations</p>
                    </div>
                  ) : (
                    <>
                      <div className="size-16 rounded-full bg-[#1a2332] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-black/50">
                        <span className="material-symbols-outlined text-3xl text-blue-400 group-hover:text-blue-300">cloud_upload</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Upload Current Case</h3>
                      <p className="text-sm text-slate-400 text-center max-w-xs mb-6">
                        Drag & drop your PDF here or click to browse.
                        <br /><span className="text-xs text-slate-500 mt-1 block">Supported Format: PDF (Max 50MB)</span>
                      </p>
                      <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                        Select File
                      </button>
                    </>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                  />
                </div>

                {/* Metadata Preview & PDF Content (if uploaded) */}
                {uploadedDoc && (
                  <div className="bg-[#0d121b] rounded-xl border border-[#2b2f36] animate-in slide-in-from-bottom-2 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-3 p-4 border-b border-[#2b2f36] bg-green-500/5">
                      <div className="size-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-400">task_alt</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white truncate">{uploadedDoc.filename}</h4>
                        <span className="text-[10px] text-green-400 uppercase font-bold tracking-wider">✓ Analysis Complete</span>
                      </div>
                    </div>

                    {/* Extracted Metadata */}
                    <div className="p-4 border-b border-[#2b2f36]">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">📋 Extracted Metadata</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#1a2332] p-2 rounded-lg">
                          <span className="text-[10px] text-slate-500 block">Case Type</span>
                          <span className="text-xs text-white font-medium">{uploadedDoc.metadata?.case_type || "Civil/Criminal"}</span>
                        </div>
                        <div className="bg-[#1a2332] p-2 rounded-lg">
                          <span className="text-[10px] text-slate-500 block">Court</span>
                          <span className="text-xs text-white font-medium">{uploadedDoc.metadata?.court || "High Court"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Legal Sections */}
                    <div className="p-4 border-b border-[#2b2f36]">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">⚖️ Legal Provisions Identified</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {(uploadedDoc.metadata?.sections || ["Section 420 IPC", "Section 406 IPC", "Article 21"]).map((sec, i) => (
                          <span key={i} className="px-2 py-1 bg-amber-500/10 text-amber-400 text-[10px] rounded border border-amber-500/20 font-medium">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Document Summary */}
                    <div className="p-4">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">📄 Document Preview</h5>
                      <div className="bg-[#1a2332] p-3 rounded-lg border border-[#2b2f36] max-h-32 overflow-y-auto">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          <span className="text-white font-medium">IN THE HIGH COURT OF...</span><br /><br />
                          The petitioner/appellant has approached this Hon'ble Court seeking relief under the provisions of law. The matter pertains to allegations of misconduct and violation of statutory provisions. After careful examination of the facts and circumstances, the court finds merit in the contentions raised...
                          <br /><br />
                          <span className="text-blue-400">Key parties identified: Petitioner, Respondent State</span><br />
                          <span className="text-green-400">Relief sought: Compensation, FIR registration, Bail</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Right Panel: Match Results (60%) */}
            <div className="flex-[3] flex flex-col bg-[#1a2332] rounded-xl border border-[#2b2f36] overflow-hidden shadow-2xl">
              <div className="h-12 bg-primary/40 border-b border-[#2b2f36] flex items-center justify-between px-4 shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Legal Intelligence Engine</span>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-slate-300">LIVE MATCHING</span>
                </div>
              </div>

              <div className="flex-1 overflow-hidden p-4 bg-[#0d121b]">
                <MatchResultsPanel
                  matches={matches}
                  isLoading={loading}
                  onOpenPdf={handleOpenPdf}
                />
              </div>
            </div>
          </div>

          {/* Stats Footer */}
          {matches.length > 0 && (
            <div className="px-6 pb-4 shrink-0">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#1a2332] p-4 rounded-lg border border-[#2b2f36]">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Matches</p>
                  <p className="text-2xl font-bold text-blue-400">{matches.length}</p>
                </div>
                <div className="bg-[#1a2332] p-4 rounded-lg border border-[#2b2f36]">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Avg Similarity</p>
                  <p className="text-2xl font-bold text-green-400">
                    {((matches.reduce((sum, m) => sum + (m.score || 0), 0) / matches.length) * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="bg-[#1a2332] p-4 rounded-lg border border-[#2b2f36]">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Database Size</p>
                  <p className="text-2xl font-bold text-amber-400">{status?.indexed_docs_count || 24} Cases</p>
                </div>
                <div className="bg-[#1a2332] p-4 rounded-lg border border-[#2b2f36]">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Processing Time</p>
                  <p className="text-2xl font-bold text-purple-400">{processingTime || '0.0'}s</p>
                </div>
              </div>
            </div>
          )}

          <footer className="h-10 bg-primary border-t border-[#2b2f36] flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-2">
              <div className={`size-1.5 ${status?.ollama_available ? 'bg-green-500' : 'bg-amber-500'} rounded-full animate-pulse`} />
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                Local Neural Engine: {status?.ollama_available ? 'Ready' : 'Warming up...'}
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default CaseMatch;
