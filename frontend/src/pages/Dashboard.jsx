import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('insights');
  const [currentPage, setCurrentPage] = useState(12);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    apiClient.getStatus().then(setStatus).catch(console.error);
  }, []);

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

          <div className="flex flex-1 overflow-hidden p-6 gap-6">
            {/* Left Panel: PDF Interaction Area */}
            <div className="flex-[3] flex flex-col bg-[#1a2332] rounded-xl border border-[#2b2f36] overflow-hidden shadow-2xl relative">
              <div className="h-12 bg-primary/40 border-b border-[#2b2f36] flex items-center justify-between px-4 shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Archive</span>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-[#0d121b] flex flex-col gap-4 custom-scrollbar">
                {chatHistory.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-40">
                    <span className="material-symbols-outlined text-6xl mb-4">account_balance</span>
                    <p className="text-sm">Enter a query to begin AI-assisted research</p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-blue-600/20 text-blue-100 rounded-tr-none border border-blue-500/30' :
                      msg.role === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-[#1a2332] text-slate-200 rounded-tl-none border border-[#2b2f36]'
                      }`}>
                      <p className="leading-relaxed">{msg.content}</p>

                      {msg.snippets && msg.snippets.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#2b2f36] space-y-3">
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Retrieved Context:</p>
                          {msg.snippets.map((s, si) => (
                            <div key={si} className="bg-black/20 p-2 rounded text-[11px] border border-[#2b2f36]">
                              <span className="font-bold text-slate-500">{s.doc_id}:</span> {s.text}...
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-blue-400 px-4 py-2">
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Neural Engine Computing...</span>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-primary/40 border-t border-[#2b2f36]">
                <div className="relative flex items-center">
                  <input
                    className="w-full bg-[#1a2332] border border-[#2b2f36] rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ask a legal question based on your documents..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="absolute right-2 p-2 text-blue-500 hover:text-blue-400"
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel: Citations & metadata */}
            <div className="flex-[1.5] flex flex-col bg-primary/40 rounded-xl border border-[#2b2f36] overflow-hidden">
              <div className="p-4 border-b border-[#2b2f36]">
                <h4 className="text-white text-xs font-bold uppercase tracking-widest">Session Summary</h4>
              </div>
              <div className="p-5 space-y-4">
                <div className="bg-[#1a2332] rounded-lg p-3 border border-[#2b2f36]">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Model Params</div>
                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex justify-between"><span>Core:</span><span className="text-blue-400">Llama-3.2-3B</span></div>
                    <div className="flex justify-between"><span>Backend:</span><span>Ollama/GGUF</span></div>
                    <div className="flex justify-between"><span>Privacy:</span><span className="text-green-500">100% Local</span></div>
                  </div>
                </div>
              </div>
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
