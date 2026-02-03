import React, { useState, useEffect } from 'react';
import { Search, Upload, FileText, Brain, Zap, BookOpen, Hash, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function PerfectCitationFinder() {
    const [activeTab, setActiveTab] = useState('text');
    const [textInput, setTextInput] = useState('');
    const [file, setFile] = useState(null);
    const [useAI, setUseAI] = useState(true);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [apiStatus, setApiStatus] = useState('unknown');

    // Check API status on component mount
    useEffect(() => {
        checkApiStatus();
    }, []);

    const checkApiStatus = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/health');
            if (response.ok) {
                setApiStatus('connected');
            } else {
                setApiStatus('disconnected');
            }
        } catch (err) {
            setApiStatus('disconnected');
        }
    };

    const analyzeText = async () => {
        if (!textInput.trim()) {
            setError('Please enter some text to analyze');
            return;
        }

        setLoading(true);
        setError('');
        setResults(null);

        try {
            const response = await fetch('http://localhost:8000/api/citation-finder/analyze-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: textInput.trim(),
                    use_ai: useAI
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(`Analysis failed: ${err.message}. Make sure the backend is running on port 8000.`);
            setApiStatus('disconnected');
        } finally {
            setLoading(false);
        }
    };

    const analyzeFile = async () => {
        if (!file) {
            setError('Please select a PDF file');
            return;
        }

        setLoading(true);
        setError('');
        setResults(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:8000/api/citation-finder/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(`File analysis failed: ${err.message}. Make sure the backend is running on port 8000.`);
            setApiStatus('disconnected');
        } finally {
            setLoading(false);
        }
    };

    const resetAll = () => {
        setTextInput('');
        setFile(null);
        setResults(null);
        setError('');
        document.getElementById('file-input')?.value && (document.getElementById('file-input').value = '');
    };

    const getStatusIndicator = () => {
        switch (apiStatus) {
            case 'connected':
                return <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Backend Connected</span>
                </div>;
            case 'disconnected':
                return <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Backend Disconnected</span>
                </div>;
            default:
                return <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Checking Connection...</span>
                </div>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
                        <BookOpen className="text-blue-600" />
                        Perfect Citation Finder
                    </h1>
                    <p className="text-xl text-gray-600">
                        AI-powered legal citation analysis with real-time processing
                    </p>
                    <div className="mt-4">
                        {getStatusIndicator()}
                    </div>
                </div>

                {/* Main Interface */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="flex">
                            <button
                                onClick={() => { setActiveTab('text'); resetAll(); }}
                                className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                                    activeTab === 'text'
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <FileText className="inline mr-2 h-4 w-4" />
                                Analyze Text
                            </button>
                            <button
                                onClick={() => { setActiveTab('file'); resetAll(); }}
                                className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                                    activeTab === 'file'
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <Upload className="inline mr-2 h-4 w-4" />
                                Upload PDF
                            </button>
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="p-8">
                        {!results ? (
                            <div>
                                {/* Input Section */}
                                {activeTab === 'text' ? (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-lg font-medium text-gray-900 mb-3">
                                                Enter legal text for citation analysis:
                                            </label>
                                            <textarea
                                                value={textInput}
                                                onChange={(e) => setTextInput(e.target.value)}
                                                placeholder="Paste your legal document text here...&#10;&#10;Example:&#10;In the case of Maneka Gandhi v. Union of India (1978) 1 SCC 248,&#10;the Supreme Court held that Article 21 protects the right to life&#10;and personal liberty. Section 420 IPC deals with cheating."
                                                className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 resize-none"
                                            />
                                        </div>

                                        {/* AI Toggle */}
                                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="relative inline-block w-12 h-6">
                                                    <input
                                                        type="checkbox"
                                                        checked={useAI}
                                                        onChange={(e) => setUseAI(e.target.checked)}
                                                        className="opacity-0 w-0 h-0 peer"
                                                        id="ai-toggle"
                                                    />
                                                    <label
                                                        htmlFor="ai-toggle"
                                                        className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition-colors duration-200 peer-checked:bg-blue-600"
                                                    >
                                                        <span className="absolute h-4 w-4 bg-white rounded-full left-1 top-1 transition-transform duration-200 peer-checked:translate-x-6"></span>
                                                    </label>
                                                </div>
                                                <div>
                                                    <label htmlFor="ai-toggle" className="flex items-center gap-2 font-medium text-gray-900">
                                                        <Brain className="h-5 w-5 text-blue-600" />
                                                        Enable AI Analysis
                                                    </label>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Get intelligent legal insights powered by AI
                                                    </p>
                                                </div>
                                            </div>
                                            <Zap className="h-6 w-6 text-yellow-500" />
                                        </div>

                                        <button
                                            onClick={analyzeText}
                                            disabled={!textInput.trim() || loading || apiStatus !== 'connected'}
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-6 w-6 animate-spin" />
                                                    Analyzing with AI...
                                                </>
                                            ) : (
                                                <>
                                                    <Search className="h-6 w-6" />
                                                    Analyze Citations
                                                    {useAI && <Zap className="h-5 w-5 text-yellow-300" />}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="border-2 border-dashed border-blue-300 rounded-2xl p-12 hover:border-blue-500 transition-colors mb-6">
                                            <input
                                                id="file-input"
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => {
                                                    const selectedFile = e.target.files[0];
                                                    if (selectedFile && selectedFile.type === 'application/pdf') {
                                                        setFile(selectedFile);
                                                        setError('');
                                                    } else {
                                                        setError('Please select a valid PDF file');
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                            <Upload className="mx-auto h-16 w-16 text-blue-400 mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                Drop your PDF here or click to browse
                                            </h3>
                                            <p className="text-gray-500 mb-4">
                                                Supports single PDF files for citation analysis
                                            </p>
                                            {file && (
                                                <div className="bg-blue-50 rounded-lg p-3 inline-block">
                                                    <p className="text-blue-800 font-medium">{file.name}</p>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => document.getElementById('file-input').click()}
                                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                            >
                                                Choose PDF File
                                            </button>
                                        </div>

                                        <button
                                            onClick={analyzeFile}
                                            disabled={!file || loading || apiStatus !== 'connected'}
                                            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-6 w-6 animate-spin" />
                                                    Processing PDF with AI...
                                                </>
                                            ) : (
                                                <>
                                                    <Brain className="h-6 w-6" />
                                                    Analyze PDF Citations
                                                    <Zap className="h-5 w-5 text-yellow-300" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* Error Display */}
                                {error && (
                                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5" />
                                            <span className="font-medium">Error:</span>
                                        </div>
                                        <p className="mt-2">{error}</p>
                                    </div>
                                )}

                                {/* Help Text */}
                                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                                    <h3 className="font-bold text-gray-900 mb-3">💡 How to use:</h3>
                                    <ul className="text-gray-700 space-y-2 text-sm">
                                        <li>• <strong>Text Analysis:</strong> Paste legal text and get instant citation breakdown</li>
                                        <li>• <strong>PDF Upload:</strong> Upload legal documents for comprehensive analysis</li>
                                        <li>• <strong>AI Toggle:</strong> Enable for intelligent legal insights and context analysis</li>
                                        <li>• <strong>Supported Citations:</strong> Case names, IPC/CrPC sections, constitutional articles, acts</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            /* Results Display */
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
                                    <button
                                        onClick={resetAll}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Search className="h-4 w-4" />
                                        New Analysis
                                    </button>
                                </div>

                                {/* Document Info */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <BookOpen className="h-8 w-8 text-blue-600" />
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {results.filename || 'Text Analysis'}
                                            </h3>
                                            <p className="text-gray-600">
                                                {results.stats?.total_citations || results.citation_count || 0} total citations found
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {[
                                            { label: 'Case Law', count: results.stats?.case_law || 0, color: 'blue', icon: '👨‍⚖️' },
                                            { label: 'IPC Sections', count: results.stats?.ipc_sections || 0, color: 'red', icon: '⚖️' },
                                            { label: 'CrPC Sections', count: results.stats?.crpc_sections || 0, color: 'purple', icon: '📜' },
                                            { label: 'Articles', count: results.stats?.articles || 0, color: 'green', icon: '🏛️' },
                                            { label: 'Acts', count: results.stats?.acts || 0, color: 'yellow', icon: '📖' }
                                        ].map((stat, index) => (
                                            <div key={index} className="bg-white p-4 rounded-lg text-center shadow-sm">
                                                <div className="text-2xl mb-1">{stat.icon}</div>
                                                <div className={`text-2xl font-bold text-${stat.color}-600`}>
                                                    {stat.count}
                                                </div>
                                                <div className="text-sm text-gray-600">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Analysis */}
                                {(results.ai_summary || results.ai_analysis) && (
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Brain className="h-6 w-6 text-purple-600" />
                                            <h3 className="text-lg font-bold text-purple-900">AI Legal Analysis</h3>
                                            <Zap className="h-5 w-5 text-yellow-500" />
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">
                                            {results.ai_summary || results.ai_analysis}
                                        </p>
                                    </div>
                                )}

                                {/* Detailed Citations */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.entries({
                                        'case_names': { title: 'Case Law Citations', icon: '👨‍⚖️', color: 'blue' },
                                        'ipc_sections': { title: 'IPC Sections', icon: '⚖️', color: 'red' },
                                        'crpc_sections': { title: 'CrPC Sections', icon: '📜', color: 'purple' },
                                        'articles': { title: 'Constitutional Articles', icon: '🏛️', color: 'green' },
                                        'acts': { title: 'Legal Acts', icon: '📖', color: 'yellow' }
                                    }).map(([key, config]) => {
                                        const citations = results.citations?.[key] || [];
                                        return citations.length > 0 ? (
                                            <div key={key} className="bg-white border border-gray-200 rounded-xl p-5">
                                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <span className="text-xl">{config.icon}</span>
                                                    {config.title} ({citations.length})
                                                </h4>
                                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                                    {citations.map((citation, index) => (
                                                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                            <Hash className="h-4 w-4 text-gray-400" />
                                                            <span className="text-gray-700 flex-1">{citation}</span>
                                                            <span className={`text-xs bg-${config.color}-100 text-${config.color}-800 px-2 py-1 rounded-full`}>
                                                                {results.citations?.counts?.[citation] || 1} mentions
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}