
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';

function Dashboard() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [status, setStatus] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Auto-scroll to bottom of chat
  const chatContainerRef = useRef(null);

  useEffect(() => {
    apiClient.getStatus().then(setStatus).catch(console.error);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSendMessage = async () => {
    if (!question.trim()) return;

    const userMsg = { role: 'user', content: question };
    setChatHistory(prev => [...prev, userMsg]);
    setLoading(true);
    setQuestion('');

    try {
      // Use streaming query for better UX
      let aiResponseText = "";
      let currentMetadata = null;

      const aiMsgId = Date.now();
      // Add placeholder
      setChatHistory(prev => [...prev, { role: 'ai', content: '', id: aiMsgId }]);

      await apiClient.streamQuery(
        userMsg.content,
        (token) => {
          aiResponseText += token;
          setChatHistory(prev => prev.map(msg =>
            msg.id === aiMsgId ? { ...msg, content: aiResponseText, snippets: currentMetadata?.context_snippets } : msg
          ));
        },
        (metadata) => {
          currentMetadata = metadata;
        }
      );

    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'error', content: 'Failed to connect to Neural Engine. Ensure backend is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-200 overflow-hidden h-screen flex flex-col font-display">
      {/* Top Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#2b2f36] bg-primary px-6 py-3 shrink-0">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="NyayNeti Logo" className="h-10 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-2 bg-[#1a2332] px-3 py-1.5 rounded-lg border border-[#2b2f36]">
            <span className={`material-symbols-outlined ${status?.ollama_available ? 'text-green-400' : 'text-amber-400'} text-sm`}>
              {status?.ollama_available ? 'check_circle' : 'pending'}
            </span>
            <p className="text-xs font-medium text-slate-300 uppercase tracking-wider">
              {status?.ollama_available ? 'Neural Engine Active' : 'Connecting to Core...'}
            </p>
          </div>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 mr-4 border-r border-[#2b2f36] pr-6">
            <Link className="text-slate-400 hover:text-white text-sm font-medium transition-colors" to="/constitutional">Library</Link>
            <Link className="text-slate-400 hover:text-white text-sm font-medium transition-colors" to="/matcher">Case Matcher</Link>
          </div>
          <div className="relative" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 ring-2 ring-blue-500/20 bg-slate-700 flex items-center justify-center cursor-pointer">
              <span className="text-white text-xs font-bold">V</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#2b2f36] bg-primary flex flex-col h-full sticky top-0 shrink-0">
          <div className="p-4 space-y-2">
            <Link to="/analysis" className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-500/20">
              <span className="material-symbols-outlined">chat</span>
              <span className="text-sm font-bold">Legal Assistant</span>
            </Link>
            <Link to="/matcher" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined">compare_arrows</span>
              <span className="text-sm font-medium">Case Matcher</span>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="text-sm font-medium">Overview</span>
            </Link>
          </div>

          <div className="mt-auto p-4 border-t border-[#2b2f36]">
            <div className="bg-[#1a2332] p-3 rounded-xl border border-[#2b2f36]">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">System Status</div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Corpus:</span>
                <span className="text-white font-bold">{status?.indexed_docs_count || 0} Docs</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300 mt-1">
                <span>Mode:</span>
                <span className="text-green-400 font-bold">Offline</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-[#0d121b] relative">
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar" ref={chatContainerRef}>
            {chatHistory.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                <span className="material-symbols-outlined text-7xl text-slate-600 mb-4">smart_toy</span>
                <h2 className="text-2xl font-bold text-slate-400">NyayNeti Legal Assistant</h2>
                <p className="text-sm text-slate-500 mt-2 max-w-md text-center">
                  Ask complex legal questions, request case summaries, or draft arguments based on the offline local corpus.
                </p>
              </div>
            )}

            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[80%] rounded-2xl p-5 text-sm leading-relaxed shadow-lg ${msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-[#1a2332] text-slate-200 border border-[#2b2f36] rounded-tl-none'
                  }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Context Citations */}
                  {msg.snippets && msg.snippets.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Sources Cited:</p>
                      <div className="space-y-2">
                        {msg.snippets.map((s, si) => (
                          <div key={si} className="bg-black/20 p-2 rounded text-[11px] border border-slate-700/50">
                            <span className="font-bold text-accent-gold">{s.doc_id}:</span>
                            <span className="text-slate-400 ml-1 italic">"{s.text.substring(0, 100)}..."</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && chatHistory[chatHistory.length - 1]?.role === 'user' && (
              <div className="flex items-center gap-2 text-blue-400 px-4">
                <span className="size-2 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="size-2 bg-blue-400 rounded-full animate-bounce delay-75"></span>
                <span className="size-2 bg-blue-400 rounded-full animate-bounce delay-150"></span>
              </div>
            )}
          </div>

          {/* Input Zone */}
          <div className="p-4 bg-primary border-t border-[#2b2f36]">
            <div className="max-w-4xl mx-auto relative flex items-center">
              <input
                className="w-full bg-[#1a2332] border border-[#2b2f36] rounded-xl py-4 pl-5 pr-14 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xl"
                placeholder="Ask a legal question... (e.g. 'What are the bail conditions for economic offenses?')"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !question.trim()}
                className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
            <div className="text-center mt-2">
              <p className="text-[10px] text-slate-500">
                AI can make mistakes. Always verify citations with the <Link to="/constitutional" className="text-blue-400 hover:underline">Library</Link>.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
