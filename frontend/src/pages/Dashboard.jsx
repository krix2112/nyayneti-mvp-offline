import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MatchResultsPanel from '../components/MatchResultsPanel';
import { apiClient } from '../api/client';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('insights');
  const [currentPage, setCurrentPage] = useState(12);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [uploadedDoc, setUploadedDoc] = useState(null);

  const [chatHistory, setChatHistory] = useState([]); // Keep for legacy if needed
  const [status, setStatus] = useState(null);

  useEffect(() => {
    apiClient.getStatus().then(setStatus).catch(console.error);
  }, []);

  const handleFileUpload = async (file) => {
    setLoading(true);
    setUploadedDoc(null);
    setMatches([]);

    try {
      // 1. Upload
      const uploadRes = await apiClient.uploadFile(file);
      if (uploadRes && uploadRes.error) throw new Error(uploadRes.error);

      // 2. Match
      // Note: backend expects doc_id, which defaults to filename in upload_pdf
      const matchRes = await apiClient.matchCases(file.name);

      if (matchRes) {
        setUploadedDoc({
          filename: file.name,
          metadata: matchRes.extracted_metadata
        });
        setMatches(matchRes.matches || []);
      }
    } catch (err) {
      console.error(err);
      // alert("Failed to analyze case: " + err.message); 
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPdf = (docId) => {
    // Open in new tab using the backend servlet
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.open(`${baseUrl}/api/pdf/${docId}`, '_blank');
  };

  // Legacy Chat Handler (Hidden from UI but kept for ref)
  const handleSendMessage = async () => {
    if (!question.trim()) return;

    const userMsg = { role: 'user', content: question };
    setChatHistory(prev => [...prev, userMsg]);
    setLoading(true);
    setQuestion('');

    try {
      const data = await apiClient.query(question);
      const aiMsg = {
        role: 'ai',
        content: data.answer,
        snippets: data.context_snippets || []
      };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'error', content: 'Failed to connect to Neural Engine.' }]);
    } finally {
      setLoading(false);
    }
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
        {/* Side Navigation */}
        <aside className="w-16 flex flex-col items-center py-6 bg-primary border-r border-[#2b2f36] gap-8">
          <div className="flex flex-col gap-6">
            <button className="text-blue-400 flex items-center justify-center p-2 rounded-xl bg-blue-500/10">
              <span className="material-symbols-outlined">folder</span>
            </button>
          </div>
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
                  NyayNeti Legal Analysis Lab
                </h1>
                <p className="text-[#a1a8b5] text-xs mt-1 font-normal">
                  {status?.indexed_docs_count || 0} local documents available for cross-referencing
                </p>
              </div>
            </div>
          </div>

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

              {/* Metadata Preview (if uploaded) */}
              {uploadedDoc && (
                <div className="bg-[#0d121b] rounded-xl p-4 border border-[#2b2f36] animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#2b2f36]">
                    <span className="material-symbols-outlined text-green-400">description</span>
                    <div>
                      <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{uploadedDoc.filename}</h4>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Processed & Extracted</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Case Type</span>
                      <span className="text-slate-300 font-medium">{uploadedDoc.metadata?.case_type || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Sections</span>
                      <span className="text-slate-300 font-medium text-right max-w-[150px] truncate">
                        {(uploadedDoc.metadata?.sections || []).join(", ") || "None"}
                      </span>
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

export default Dashboard;
