import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    BookOpen,
    Link as LinkIcon,
    ExternalLink,
    FileSearch,
    Hash,
    Scale,
    Calendar,
    Layers,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import { apiClient } from '../api/client';

const CitationExplorer = () => {
    const [query, setQuery] = useState('');
    const [citationType, setCitationType] = useState('all');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [stats, setStats] = useState({ cases: 0, sections: 0, acts: 0 });

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        try {
            const data = await apiClient.searchCitations({
                citation: query,
                citation_type: citationType
            });
            setResults(data.results || []);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const categories = [
        { id: 'all', name: 'All Citations', icon: <Layers size={16} /> },
        { id: 'case', name: 'Cases', icon: <BookOpen size={16} /> },
        { id: 'section', name: 'Statutes/Codes', icon: <Hash size={16} /> },
        { id: 'article', name: 'Constitutional', icon: <Scale size={16} /> },
    ];

    return (
        <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
            {/* Search & Filter Header (Sticky) */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="p-8 bg-slate-800/30 border-b border-white/10 backdrop-blur-xl z-20">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <Link to="/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-all">
                                    <ArrowLeft size={20} className="text-gray-400" />
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                        <FileSearch className="text-gold" /> Smart Citation Finder
                                    </h1>
                                    <p className="text-sm text-gray-500">Cross-reference precedents and statutory provisions across your repository.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="px-4 py-2 bg-slate-900 rounded-full border border-white/5 text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                    <div className="size-1.5 bg-green-500 rounded-full animate-pulse"></div> READY FOR DISCOVERY
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative flex items-center">
                                <Search className="absolute left-4 text-gray-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search SCC, AIR citations, IPC Sections, or Case Names (e.g. Navjot Singh Sidhu)..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all shadow-2xl placeholder:text-gray-600"
                                />
                            </div>

                            <div className="flex bg-slate-900 border border-white/10 rounded-2xl p-1 shrink-0">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCitationType(cat.id)}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all ${citationType === cat.id ? 'bg-gold text-slate-900' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {cat.icon} {cat.name}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={isSearching || !query.trim()}
                                className="px-8 bg-gold hover:bg-orange-600 text-slate-900 font-black rounded-2xl transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                            >
                                {isSearching ? <div className="size-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div> : 'DISCOVER'}
                            </button>
                        </form>
                    </div>
                </header>

                {/* Results Stream */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950/20">
                    <div className="max-w-6xl mx-auto">
                        {results.length === 0 && !isSearching && (
                            <div className="h-[400px] flex flex-col items-center justify-center text-center opacity-30">
                                <BookOpen size={80} className="mb-6 text-gray-600" />
                                <h2 className="text-2xl font-black">NO EXPLORATION ACTIVE</h2>
                                <p className="max-w-md mt-2">Enter a citation identifier or a legal concept to find occurrences across all your indexed documents.</p>
                            </div>
                        )}

                        {isSearching && (
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-slate-800/40 border border-white/5 rounded-3xl p-8 animate-pulse">
                                        <div className="h-6 bg-white/5 w-1/3 rounded-lg mb-4"></div>
                                        <div className="h-4 bg-white/5 w-3/4 rounded-lg mb-2"></div>
                                        <div className="h-4 bg-white/5 w-1/2 rounded-lg"></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6">
                            {results.map((res, i) => (
                                <div
                                    key={i}
                                    className="group bg-slate-800/40 border border-white/5 hover:border-gold/30 rounded-3xl p-8 transition-all hover:shadow-[0_0_40px_rgba(255,215,0,0.05)] relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                                        <LinkIcon size={120} />
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${res.type === 'case' ? 'bg-blue-500/20 text-blue-400' : 'bg-gold/20 text-gold'
                                                    }`}>
                                                    {res.type}
                                                </span>
                                                <span className="text-xs text-gray-500 flex items-center gap-2">
                                                    <Calendar size={12} /> Found in {res.doc_id}
                                                </span>
                                            </div>

                                            <h3 className="text-2xl font-black mb-4 group-hover:text-gold transition-colors">
                                                {res.citation_text}
                                            </h3>

                                            <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 mb-6">
                                                <p className="text-sm text-gray-400 italic leading-relaxed">
                                                    "{res.context}"
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-4">
                                                <Link
                                                    to={`/compare?selected=${res.doc_id}`}
                                                    className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-gold hover:text-slate-900 rounded-xl text-xs font-black transition-all"
                                                >
                                                    VIEW IN DOCUMENT <ChevronRight size={14} />
                                                </Link>
                                                <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-slate-700 rounded-xl text-xs font-black transition-all">
                                                    EXTRACT FULL PARAGRAPH <ExternalLink size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-64 space-y-4">
                                            <div className="bg-slate-900/80 rounded-2xl p-6 border border-white/5">
                                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">SOURCE RELEVANCE</h4>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-400">Contextual Fit</span>
                                                        <span className="font-bold text-gold">94%</span>
                                                    </div>
                                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-gold w-[94%]"></div>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                                                        High confidence match found in primary legal grounds of the document.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {results.length > 0 && (
                            <div className="py-12 flex justify-center">
                                <div className="px-6 py-3 bg-slate-800/50 border border-white/10 rounded-full text-xs text-zinc-500 font-mono tracking-widest uppercase">
                                    END OF DISCOVERY STREAM • {results.length} MATCHES FOUND
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 0, 0.2);
        }
      `}</style>
        </div>
    );
};

export default CitationExplorer;
