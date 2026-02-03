import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiClient } from '../api/client';

function Compare() {
    const location = useLocation();
    const [documents, setDocuments] = useState([]);
    const [selectedPdf, setSelectedPdf] = useState('');
    const [query, setQuery] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [messages, setMessages] = useState([]); // Chat history
    const [currentMessage, setCurrentMessage] = useState(''); // Currently streaming message
    const [metadata, setMetadata] = useState(null);
    const [progress, setProgress] = useState(0);
    const [progressStatus, setProgressStatus] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadDocuments();

        const params = new URLSearchParams(location.search);
        const preselected = params.get('selected');
        if (preselected) {
            setSelectedPdf(preselected);
        }
    }, [location]);

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentMessage]);

    // Reset chat when PDF changes
    useEffect(() => {
        setMessages([]);
        setCurrentMessage('');
        setMetadata(null);
    }, [selectedPdf]);

    const loadDocuments = async () => {
        try {
            const resp = await apiClient.listDocuments();
            setDocuments(resp.documents || []);
        } catch (e) {
            console.error('Failed to load documents:', e);
        }
    };

    const handleAnalyze = async (customQuery = '') => {
        if (!selectedPdf) {
            alert('Please select a PDF first');
            return;
        }

        const queryToUse = customQuery || query;

        // Add user question to chat if there is one
        if (queryToUse) {
            setMessages(prev => [...prev, { type: 'user', content: queryToUse }]);
        } else {
            setMessages(prev => [...prev, { type: 'system', content: 'Starting comparison analysis...' }]);
        }

        setQuery(''); // Clear input immediately
        setAnalyzing(true);
        setCurrentMessage('');
        setProgress(0);
        setProgressStatus('Initializing...');

        try {
            setProgress(10);
            setProgressStatus('Loading documents...');

            await new Promise(resolve => setTimeout(resolve, 200));
            setProgress(30);
            setProgressStatus('Preparing analysis...');

            await new Promise(resolve => setTimeout(resolve, 200));
            setProgress(50);
            setProgressStatus('Analyzing with DeepSeek R1...');

            const response = await fetch('http://localhost:8000/api/compare-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selected_pdf_id: selectedPdf,
                    query: queryToUse
                }),
            });

            if (!response.ok) {
                throw new Error('Comparison failed');
            }

            setProgress(70);
            setProgressStatus('Streaming response...');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let metadataProcessed = false;
            let streamedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                if (!metadataProcessed) {
                    const boundary = buffer.indexOf('\n\n');
                    if (boundary !== -1) {
                        const metadataPart = buffer.substring(0, boundary);
                        const remaining = buffer.substring(boundary + 2);

                        if (metadataPart.startsWith('DATA: ')) {
                            try {
                                const jsonStr = metadataPart.replace('DATA: ', '').trim();
                                const meta = JSON.parse(jsonStr);
                                setMetadata(meta);
                                setProgress(80);
                            } catch (e) {
                                console.error('Failed to parse metadata', e);
                            }
                        }
                        metadataProcessed = true;
                        buffer = remaining;
                    }
                }

                if (metadataProcessed && buffer) {
                    // Filter out status messages and update progressStatus
                    const lines = buffer.split('\n');
                    let cleanChunk = '';
                    for (const line of lines) {
                        if (line.startsWith('[STATUS]:')) {
                            const statusText = line.replace('[STATUS]:', '').trim();
                            setProgressStatus(statusText);
                            continue;
                        }
                        cleanChunk += line + (lines.length > 1 ? '\n' : '');
                    }

                    // Stream the content
                    streamedContent += cleanChunk;
                    setCurrentMessage(streamedContent);
                    setProgress(90);
                    buffer = '';
                }
            }

            // Move completed message to chat history
            if (streamedContent) {
                setMessages(prev => [...prev, { type: 'assistant', content: streamedContent }]);
            }
            setCurrentMessage('');

            setProgress(100);
            setProgressStatus('Complete!');
        } catch (err) {
            console.error('Analysis failed:', err);
            setMessages(prev => [...prev, {
                type: 'error',
                content: 'Error: Failed to analyze. Please ensure the backend is running.'
            }]);
            setProgressStatus('Analysis failed');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleQuickAnalyze = () => {
        handleAnalyze('');
    };

    // Helper to render think block
    const ReasoningBlock = ({ content }) => {
        const thinkMatch = content.match(/<think>([\s\S]*?)(?:<\/think>|$)/i);
        if (!thinkMatch) return null;

        return (
            <div className="mb-4 bg-slate-950/40 rounded-xl border border-white/10 p-4 overflow-hidden group">
                <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-tighter text-blue-400 opacity-50">
                    <span className="material-symbols-outlined text-[10px]">psychology</span> AI Internal Reasoning
                </div>
                <div className="text-xs text-slate-400 italic font-medium leading-relaxed">
                    {thinkMatch[1].trim()}
                </div>
            </div>
        );
    };

    const cleanContent = (text) => {
        return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    };

    return (
        <div className="flex h-screen bg-slate-900 text-white font-display overflow-hidden">
            {/* Left Panel - 30% */}
            <div className="w-[30%] border-r border-white/10 flex flex-col bg-slate-800/50">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <Link to="/" className="flex items-center mb-4">
                        <img src="/logo.png" alt="NyayNeti Logo" className="h-14 w-auto object-contain" />
                    </Link>
                    <h2 className="text-2xl font-bold text-gold">PDF Comparison</h2>
                    <p className="text-sm text-gray-400 mt-1">AI-powered document analysis</p>
                </div>

                {/* PDF Selection */}
                <div className="p-6 border-b border-white/10">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                        Select PDF
                    </label>
                    <select
                        value={selectedPdf}
                        onChange={(e) => setSelectedPdf(e.target.value)}
                        disabled={analyzing}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-gold transition-all disabled:opacity-50"
                    >
                        <option value="">Choose a document...</option>
                        {documents.map((doc, i) => (
                            <option key={i} value={doc.doc_id}>
                                {doc.doc_id.replace('.pdf', '').replace('.PDF', '').replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>

                    {selectedPdf && (
                        <button
                            onClick={handleQuickAnalyze}
                            disabled={analyzing}
                            className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-gold to-orange-600 hover:from-orange-600 hover:to-gold rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {analyzing ? (
                                <>
                                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    {messages.length > 0 ? 'New Analysis' : 'Analyze Document'}
                                </>
                            )}
                        </button>
                    )}

                    {/* Progress Bar */}
                    {analyzing && (
                        <div className="mt-4">
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-gold to-orange-400 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">{progressStatus}</p>
                        </div>
                    )}
                </div>

                {/* PDF Preview */}
                {selectedPdf && (
                    <div className="flex-1 overflow-y-auto p-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Document Info
                        </h3>
                        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="material-symbols-outlined text-gold text-2xl">description</span>
                                <div className="flex-1">
                                    <p className="font-bold text-sm line-clamp-2">
                                        {selectedPdf.replace('.pdf', '').replace('.PDF', '').replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {documents.find(d => d.doc_id === selectedPdf)?.chunks || 0} chunks indexed
                                    </p>
                                </div>
                            </div>

                            {metadata && (
                                <div className="mt-4 pt-4 border-t border-slate-600">
                                    <p className="text-xs text-gray-400 mb-2">Comparing against {metadata.total_documents - 1} documents</p>
                                    <div className="flex items-center gap-2 text-xs text-green-400">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        <span>Analysis ready</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="p-6 border-t border-white/10 space-y-2">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                        <span className="material-symbols-outlined text-sm">upload_file</span>
                        <span className="text-sm font-medium">Upload</span>
                    </Link>
                    <Link
                        to="/my-research"
                        className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                        <span className="material-symbols-outlined text-sm">folder_open</span>
                        <span className="text-sm font-medium">My Research</span>
                    </Link>
                </div>
            </div>

            {/* Right Panel - 70% - Chat Interface */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-slate-800/30">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-gold rounded-full"></div>
                        <h2 className="text-lg font-bold">AI Comparison Chat</h2>
                        {analyzing && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="size-3 border-2 border-gold/30 border-t-gold rounded-full animate-spin"></span>
                                <span>{progress}%</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                            <span className="size-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            DEEPSEEK R1
                        </span>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {!selectedPdf ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <span className="material-symbols-outlined text-8xl text-gray-600 mb-4">
                                compare_arrows
                            </span>
                            <h3 className="text-2xl font-bold mb-2">Select a PDF to Begin</h3>
                            <p className="text-gray-400">
                                Choose a document from the left panel to start comparison analysis
                            </p>
                        </div>
                    ) : messages.length === 0 && !analyzing ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <span className="material-symbols-outlined text-8xl text-gold mb-4">
                                chat
                            </span>
                            <h3 className="text-2xl font-bold mb-2">Ready to Analyze</h3>
                            <p className="text-gray-400 mb-6">
                                Click "Analyze Document" or ask a question below
                            </p>
                            <p className="text-sm text-gray-500">
                                Responses will appear here in a chat format
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Chat messages */}
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex gap-4 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.type !== 'user' && (
                                        <div className="size-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-gold text-sm">
                                                {msg.type === 'system' ? 'info' : msg.type === 'error' ? 'error' : 'smart_toy'}
                                            </span>
                                        </div>
                                    )}

                                    <div className={`max-w-[80%] rounded-2xl p-4 ${msg.type === 'user'
                                        ? 'bg-gold text-slate-900 font-medium'
                                        : msg.type === 'error'
                                            ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                                            : msg.type === 'system'
                                                ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                                                : 'bg-slate-800/50 border border-white/10 text-gray-200'
                                        }`}>
                                        {msg.type === 'assistant' ? (
                                            <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                                                <ReasoningBlock content={msg.content} />
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        strong: ({ node, ...props }) => (
                                                            <strong className="font-bold text-gold bg-gold/5 px-1 rounded" {...props} />
                                                        ),
                                                        em: ({ node, ...props }) => (
                                                            <em className="italic text-gray-300" {...props} />
                                                        ),
                                                        h3: ({ node, ...props }) => (
                                                            <h3 className="text-lg font-bold mt-6 mb-3 text-white border-b border-white/10 pb-1" {...props} />
                                                        ),
                                                        ul: ({ node, ...props }) => (
                                                            <ul className="list-disc ml-6 my-3 space-y-2 text-gray-300" {...props} />
                                                        ),
                                                        ol: ({ node, ...props }) => (
                                                            <ol className="list-decimal ml-6 my-3 space-y-2 text-gray-300" {...props} />
                                                        ),
                                                        li: ({ node, ...props }) => (
                                                            <li className="leading-relaxed" {...props} />
                                                        ),
                                                        p: ({ node, ...props }) => (
                                                            <p className="mb-4 leading-relaxed text-gray-200" {...props} />
                                                        ),
                                                        table: ({ node, ...props }) => (
                                                            <div className="overflow-x-auto my-6 border border-white/10 rounded-lg">
                                                                <table className="min-w-full divide-y divide-white/10" {...props} />
                                                            </div>
                                                        ),
                                                        thead: ({ node, ...props }) => (
                                                            <thead className="bg-white/5" {...props} />
                                                        ),
                                                        th: ({ node, ...props }) => (
                                                            <th className="px-4 py-2 text-left text-xs font-bold text-gold uppercase tracking-wider" {...props} />
                                                        ),
                                                        td: ({ node, ...props }) => (
                                                            <td className="px-4 py-2 text-sm text-gray-300 border-t border-white/5" {...props} />
                                                        ),
                                                    }}
                                                >
                                                    {cleanContent(msg.content)}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {msg.content.split('\n\n').map((paragraph, j) => (
                                                    <p key={j} className={j > 0 ? 'mt-3' : ''}>
                                                        {paragraph}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {msg.type === 'user' && (
                                        <div className="size-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-blue-400 text-sm">person</span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Currently streaming message */}
                            {currentMessage && (
                                <div className="flex gap-4 justify-start">
                                    <div className="size-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-gold text-sm">smart_toy</span>
                                    </div>

                                    <div className="max-w-[80%] rounded-2xl p-4 bg-slate-800/50 border border-white/10 text-gray-200">
                                        <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                                            <ReasoningBlock content={currentMessage} />
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    strong: ({ node, ...props }) => (
                                                        <strong className="font-bold text-gold bg-gold/5 px-1 rounded" {...props} />
                                                    ),
                                                    em: ({ node, ...props }) => (
                                                        <em className="italic text-gray-300" {...props} />
                                                    ),
                                                    h3: ({ node, ...props }) => (
                                                        <h3 className="text-lg font-bold mt-6 mb-3 text-white border-b border-white/10 pb-1" {...props} />
                                                    ),
                                                    ul: ({ node, ...props }) => (
                                                        <ul className="list-disc ml-6 my-3 space-y-2 text-gray-300" {...props} />
                                                    ),
                                                    ol: ({ node, ...props }) => (
                                                        <ol className="list-decimal ml-6 my-3 space-y-2 text-gray-300" {...props} />
                                                    ),
                                                    li: ({ node, ...props }) => (
                                                        <li className="leading-relaxed" {...props} />
                                                    ),
                                                    p: ({ node, ...props }) => (
                                                        <p className="mb-4 leading-relaxed text-gray-200" {...props} />
                                                    ),
                                                    table: ({ node, ...props }) => (
                                                        <div className="overflow-x-auto my-6 border border-white/10 rounded-lg">
                                                            <table className="min-w-full divide-y divide-white/10" {...props} />
                                                        </div>
                                                    ),
                                                    th: ({ node, ...props }) => (
                                                        <th className="px-4 py-2 text-left text-xs font-bold text-gold uppercase tracking-wider" {...props} />
                                                    ),
                                                    td: ({ node, ...props }) => (
                                                        <td className="px-4 py-2 text-sm text-gray-300 border-t border-white/5" {...props} />
                                                    ),
                                                }}
                                            >
                                                {cleanContent(currentMessage)}
                                            </ReactMarkdown>
                                            <span className="inline-block w-2 h-4 bg-gold animate-pulse ml-1"></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Loading indicator */}
                            {analyzing && !currentMessage && (
                                <div className="flex gap-4 justify-start">
                                    <div className="size-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                                        <span className="size-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin"></span>
                                    </div>

                                    <div className="max-w-[80%] rounded-2xl p-4 bg-slate-800/50 border border-white/10">
                                        <div className="text-sm text-gray-400 flex items-center gap-2">
                                            <span>{progressStatus}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-3 w-48">
                                            <div
                                                className="h-full bg-gradient-to-r from-gold to-orange-400 transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Query Input */}
                {selectedPdf && (
                    <div className="p-6 bg-slate-800/30 border-t border-white/10">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center gap-3 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 focus-within:border-gold transition-all">
                                <input
                                    type="text"
                                    placeholder="Ask a question about this comparison..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !analyzing && query.trim() && handleAnalyze()}
                                    disabled={analyzing}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-2 placeholder:text-gray-500 text-white disabled:opacity-50"
                                />
                                <button
                                    onClick={() => handleAnalyze()}
                                    disabled={analyzing || !query.trim()}
                                    className="size-10 bg-gold hover:bg-orange-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
                                >
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </div>
                            <p className="text-center text-xs text-gray-500 mt-3">
                                Powered by DeepSeek R1 • 100% Offline • Responses stream in real-time
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Compare;
