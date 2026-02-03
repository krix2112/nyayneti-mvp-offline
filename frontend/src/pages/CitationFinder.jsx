import React, { useState } from 'react';
import { Search, BookOpen, Hash, Calendar, ExternalLink, Brain, Zap } from 'lucide-react';
import { apiClient } from '../api/client';
import AppLayout from '../components/AppLayout';

export default function CitationFinder() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [useAI, setUseAI] = useState(false);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'constitutional': return '🏛️';
            case 'ipc': return '⚖️';
            case 'crpc': return '📜';
            case 'case_law': return '👨‍⚖️';
            case 'legislation': return '📖';
            default: return '📄';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'constitutional': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'ipc': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'crpc': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'case_law': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'legislation': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setLoading(true);
        try {
            const response = await apiClient.post('/search-citations', {
                term: searchTerm.trim(),
                use_ai: useAI
            });

            console.log('Citation search response:', response);
            console.log('Results:', response.results);
            setResults(response.results || []);

            // Add to search history
            if (!searchHistory.includes(searchTerm.trim())) {
                setSearchHistory(prev => [searchTerm.trim(), ...prev.slice(0, 4)]);
            }
        } catch (error) {
            console.error('Search failed:', error);
            alert('Search failed. Please try again.');
        }
        setLoading(false);
    };

    const handleHistoryClick = (term) => {
        setSearchTerm(term);
    };

    const openDocument = (docId) => {
        window.open(`/document-viewer/${docId}`, '_blank');
    };

    return (
        <AppLayout>
            <div className="min-h-screen py-12">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            🔍 Citation Finder
                        </h1>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            Search across all your legal documents to find where specific cases,
                            sections, and articles are mentioned
                        </p>
                    </div>

                    {/* Search Section */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-lg rounded-2xl border border-yellow-500/20 shadow-xl p-8 mb-8">
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="Search for citations (e.g., Article 21, Section 438 CrPC, Maneka Gandhi)"
                                        className="w-full pl-10 pr-4 py-3 border border-yellow-500/30 bg-slate-950/50 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-lg placeholder-gray-500"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={loading || !searchTerm.trim()}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-950 px-8 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-yellow-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-950"></div>
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search size={20} />
                                        Search
                                    </>
                                )}
                            </button>
                        </div>

                        {/* AI Toggle */}
                        <div className="flex items-center gap-3 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={useAI}
                                    onChange={(e) => setUseAI(e.target.checked)}
                                    className="w-4 h-4 text-yellow-500 bg-slate-950 border-yellow-500/30 rounded focus:ring-yellow-500"
                                />
                                <span className="text-gray-300 flex items-center gap-2">
                                    <Brain size={18} className="text-yellow-500" />
                                    Use AI-powered semantic search
                                </span>
                            </label>
                        </div>

                        {/* Search History */}
                        {searchHistory.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Recent Searches</h4>
                                <div className="flex flex-wrap gap-2">
                                    {searchHistory.map((term, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleHistoryClick(term)}
                                            className="px-3 py-1 bg-slate-950/50 border border-yellow-500/30 text-gray-300 rounded-full text-sm hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Results */}
                    {results.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-4">
                                Found {results.length} result{results.length !== 1 ? 's' : ''}
                            </h2>
                            {results.map((result, idx) => (
                                <div
                                    key={idx}
                                    className="bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-lg rounded-2xl border border-yellow-500/20 p-6 hover:border-yellow-500/50 transition-all shadow-lg hover:shadow-yellow-500/20"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{getTypeIcon(result.type)}</span>
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1">
                                                    {result.citation}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(result.type)}`}>
                                                        {result.type?.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30">
                                                        <Hash className="mr-1 h-3 w-3" />
                                                        {result.count || 1} mention{result.count !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openDocument(result.doc_id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all"
                                        >
                                            <ExternalLink size={16} />
                                            View
                                        </button>
                                    </div>

                                    {result.context && (
                                        <div className="bg-slate-950/50 rounded-lg p-4 border border-yellow-500/10">
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {result.context}
                                            </p>
                                        </div>
                                    )}

                                    {result.documents && result.documents.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold text-gray-400 mb-2">Found in:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.documents.map((doc, docIdx) => (
                                                    <span
                                                        key={docIdx}
                                                        className="inline-flex items-center px-3 py-1 bg-slate-950/50 border border-yellow-500/20 text-gray-300 rounded-full text-xs"
                                                    >
                                                        <BookOpen className="mr-1 h-3 w-3" />
                                                        {doc.title || doc.filename}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {!loading && searchTerm && results.length === 0 && (
                        <div className="text-center py-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-yellow-500/20">
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                            <p className="text-gray-400 max-w-md mx-auto">
                                Try searching for different terms like "Article 21", "Section 438 CrPC",
                                or case names like "Maneka Gandhi v. Union"
                            </p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!searchTerm && (
                        <div className="text-center py-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-yellow-500/20">
                            <div className="text-6xl mb-6">🔍</div>
                            <h3 className="text-2xl font-bold text-white mb-4">Search Legal Citations</h3>
                            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                                Enter a legal citation to find all documents that mention it.
                                Search for constitutional articles, IPC sections, case names, or acts.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                <div className="bg-slate-950/50 p-6 rounded-lg border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                                    <div className="text-3xl mb-3">🏛️</div>
                                    <h4 className="font-semibold mb-2 text-white">Constitutional Articles</h4>
                                    <p className="text-sm text-gray-400">Article 14, Article 21, Article 32</p>
                                </div>
                                <div className="bg-slate-950/50 p-6 rounded-lg border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                                    <div className="text-3xl mb-3">⚖️</div>
                                    <h4 className="font-semibold mb-2 text-white">Legal Sections</h4>
                                    <p className="text-sm text-gray-400">Section 438 CrPC, Section 302 IPC</p>
                                </div>
                                <div className="bg-slate-950/50 p-6 rounded-lg border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                                    <div className="text-3xl mb-3">👨‍⚖️</div>
                                    <h4 className="font-semibold mb-2 text-white">Case Names</h4>
                                    <p className="text-sm text-gray-400">Maneka Gandhi v. Union, Arnesh Kumar</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}