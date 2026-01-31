import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    Split,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Search,
    Highlighter,
    Gavel,
    Scale,
    Sparkles,
    Zap,
    ArrowLeft,
    SearchIcon,
    BookMarked
} from 'lucide-react';
import PDFViewer from '../components/PDFViewer';
import { apiClient } from '../api/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VoiceInput from '../components/VoiceInput';
import VoiceOutput from '../components/VoiceOutput';

const SmartViewer = () => {
    const location = useLocation();
    const [documents, setDocuments] = useState([]);
    const [selectedDocId, setSelectedDocId] = useState('');
    const [highlights, setHighlights] = useState([]);
    const [chatOpen, setChatOpen] = useState(true);
    const [messages, setMessages] = useState([]);
    const [query, setQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [citations, setCitations] = useState([]);

    useEffect(() => {
        loadDocuments();
        const params = new URLSearchParams(location.search);
        const preselected = params.get('selected');
        if (preselected) {
            handleDocSelect(preselected);
        }
    }, [location]);

    const loadDocuments = async () => {
        try {
            const resp = await apiClient.listDocuments();
            setDocuments(resp.documents || []);
        } catch (e) {
            console.error('Failed to load documents:', e);
        }
    };

    const handleDocSelect = async (docId) => {
        setSelectedDocId(docId);
        setMessages([]);
        setHighlights([]);

        // Fetch citations for this document
        try {
            const resp = await apiClient.getCitations(docId);
            setCitations(resp.citations || []);

            // Auto-add system message
            setMessages([{
                type: 'assistant',
                content: `I've analyzed **${docId}**. Found **${resp.counts?.total || 0}** legal citations. You can ask me to explain any section or find related precedents.`
            }]);
        } catch (e) {
            console.error('Failed to fetch citations:', e);
        }
    };

    const handleSend = async () => {
        if (!query.trim() || !selectedDocId) return;

        const userMsg = query;
        setMessages(prev => [...prev, { type: 'user', content: userMsg }]);
        setQuery('');
        setIsTyping(true);

        try {
            // Updated to call query/stream with doc_id for high-precision targeted answers
            const response = await fetch('http://localhost:8000/api/query/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doc_id: selectedDocId,
                    question: userMsg
                }),
            });

            if (!response.ok) throw new Error('Query failed');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let streamedContent = '';

            setMessages(prev => [...prev, { type: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);

                // Process metadata and filter logs
                const lines = chunk.split('\n');
                const filteredChunk = lines
                    .filter(line => !line.startsWith('DATA:'))
                    .join('\n');

                streamedContent += filteredChunk;

                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last.type === 'assistant') {
                        return [...prev.slice(0, -1), { ...last, content: streamedContent }];
                    }
                    return prev;
                });
            }
        } catch (err) {
            setMessages(prev => [...prev, { type: 'error', content: 'Connection error. Is the local AI active?' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
            {/* Mini Sidebar */}
            <div className="w-16 border-r border-white/10 bg-slate-950 flex flex-col items-center py-6 gap-8">
                <Link to="/dashboard">
                    <div className="size-10 bg-gold rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-gold/20 hover:scale-110 transition-all">
                        <span className="font-black text-lg">N</span>
                    </div>
                </Link>
                <div className="flex flex-col gap-4">
                    <button onClick={() => setChatOpen(!chatOpen)} className={`p-3 rounded-xl transition-all ${chatOpen ? 'bg-gold/10 text-gold' : 'text-gray-500 hover:text-white'}`}>
                        <MessageSquare size={20} />
                    </button>
                    <button className="p-3 rounded-xl text-gray-500 hover:text-white transition-all">
                        <Search size={20} />
                    </button>
                    <button className="p-3 rounded-xl text-gray-500 hover:text-white transition-all">
                        <BookMarked size={20} />
                    </button>
                </div>
                <div className="mt-auto">
                    <Link to="/dashboard" className="p-3 rounded-xl text-gray-500 hover:text-white transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                </div>
            </div>

            {/* Main Split Interface */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: PDF Viewer (60-70%) */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-hidden">
                    <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-slate-800/30">
                        <div className="flex items-center gap-4">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Document:</label>
                            <select
                                value={selectedDocId}
                                onChange={(e) => handleDocSelect(e.target.value)}
                                className="bg-transparent text-sm font-bold text-gray-200 border-none focus:ring-0 cursor-pointer hover:text-gold transition-colors truncate max-w-[300px]"
                            >
                                <option value="">Select a document...</option>
                                {documents.map(doc => (
                                    <option key={doc.doc_id} value={doc.doc_id} className="bg-slate-800">{doc.filename || doc.doc_id}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-green-500 bg-green-500/10 px-2 py-1 rounded">SECURE OFFLINE NODE</span>
                            <button className="text-gray-500 hover:text-white transition-all">
                                <Split size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-4 overflow-hidden">
                        {selectedDocId ? (
                            <PDFViewer
                                fileUrl={`http://localhost:8000/api/document/${selectedDocId}/pdf`}
                                highlights={highlights}
                            />
                        ) : (
                            <div className="h-full border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center opacity-30">
                                <Gavel size={64} className="mb-4" />
                                <h2 className="text-xl font-bold">SELECT DOCUMENT TO ACTIVATE PREVIEW</h2>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: AI Chat & Citations (30-40%) */}
                {chatOpen && (
                    <div className="w-[450px] border-l border-white/10 bg-slate-900 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20 overflow-hidden">
                        <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-slate-800/50">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-gold" />
                                <span className="text-sm font-black uppercase tracking-widest text-gold">NyayNeti Assistant</span>
                            </div>
                            <button onClick={() => setChatOpen(false)} className="text-gray-500 hover:text-white">
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed ${msg.type === 'user'
                                        ? 'bg-gold text-slate-900 font-bold'
                                        : msg.type === 'error'
                                            ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                            : 'bg-slate-800 border border-white/5 text-gray-200'
                                        }`}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                strong: ({ node, ...props }) => <span className="font-bold text-gold" {...props} />,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>

                                        {/* Voice Output for AI messages */}
                                        {msg.type === 'assistant' && msg.content && (
                                            <div className="mt-3 pt-3 border-t border-white/5">
                                                <VoiceOutput text={msg.content} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-2 p-4 bg-slate-800/50 rounded-2xl border border-white/5 w-fit">
                                    <div className="size-2 bg-gold/50 rounded-full animate-bounce"></div>
                                    <div className="size-2 bg-gold/50 rounded-full animate-bounce delay-100"></div>
                                    <div className="size-2 bg-gold/50 rounded-full animate-bounce delay-200"></div>
                                </div>
                            )}
                        </div>

                        {/* Citation Drawer in Chat */}
                        {citations.length > 0 && (
                            <div className="p-4 bg-slate-950/20 border-t border-white/5">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <BookMarked size={12} className="text-gold" /> Identified Citations
                                </h4>
                                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                    {citations.flatMap(c => c.instances.map((inst, i) => (
                                        <button
                                            key={`${c.text}-${i}`}
                                            className="shrink-0 px-3 py-2 bg-slate-800 hover:bg-gold/10 hover:text-gold border border-white/5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap"
                                        >
                                            {c.text}
                                        </button>
                                    )))}
                                </div>
                            </div>
                        )}

                        <div className="p-6 border-t border-white/5 bg-slate-800/20">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Ask AI about this document..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-4 pr-24 text-sm focus:outline-none focus:border-gold transition-all"
                                />

                                {/* Voice Input Button */}
                                <div className="absolute right-14 top-2.5">
                                    <VoiceInput
                                        onTranscription={(text) => setQuery(text)}
                                        language={null}
                                    />
                                </div>

                                <button
                                    onClick={handleSend}
                                    disabled={!query.trim()}
                                    className="absolute right-2 top-1.5 p-2.5 bg-gold hover:bg-orange-600 rounded-xl text-slate-900 transition-all disabled:opacity-50"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
                                <Zap size={10} /> POWERED BY LOCAL DEEPSEEK R1 • NO DATA LEAVES DEVICE
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.1);
          border-radius: 3px;
        }
      `}</style>
        </div>
    );
};

export default SmartViewer;
