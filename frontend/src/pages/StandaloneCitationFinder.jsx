import React, { useState } from 'react';
import { Upload, FileText, Brain, Zap, BookOpen, Hash } from 'lucide-react';
import { apiClient } from '../api/client';

export default function StandaloneCitationFinder() {
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'text'
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError('');
        } else {
            setError('Please select a valid PDF file');
        }
    };

    const analyzePDF = async () => {
        if (!file) {
            setError('Please select a PDF file first');
            return;
        }

        setLoading(true);
        setError('');
        setAnalysis(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post('/citation-finder/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setAnalysis(response);
        } catch (err) {
            setError(err.response?.data?.error || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const analyzeText = async () => {
        if (!text.trim()) {
            setError('Please enter some text to analyze');
            return;
        }

        setLoading(true);
        setError('');
        setAnalysis(null);

        try {
            const response = await apiClient.post('/citation-finder/analyze-text', {
                text: text.trim()
            });

            setAnalysis(response);
        } catch (err) {
            setError(err.response?.data?.error || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetAnalysis = () => {
        setAnalysis(null);
        setFile(null);
        setText('');
        setError('');
        document.getElementById('file-input')?.value && (document.getElementById('file-input').value = '');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                        <BookOpen className="text-blue-600" />
                        Standalone Citation Finder
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Upload PDFs or paste text to get instant AI-powered citation analysis
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-xl p-1 shadow-lg">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${
                                activeTab === 'upload'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-blue-600'
                            }`}
                        >
                            <Upload className="inline mr-2 h-5 w-5" />
                            Upload PDF
                        </button>
                        <button
                            onClick={() => setActiveTab('text')}
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${
                                activeTab === 'text'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-blue-600'
                            }`}
                        >
                            <FileText className="inline mr-2 h-5 w-5" />
                            Paste Text
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {!analysis ? (
                        <>
                            {activeTab === 'upload' ? (
                                /* PDF Upload Tab */
                                <div className="text-center">
                                    <div className="mb-8">
                                        <div className="border-2 border-dashed border-blue-300 rounded-2xl p-12 hover:border-blue-500 transition-colors">
                                            <input
                                                id="file-input"
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <Upload className="mx-auto h-16 w-16 text-blue-400 mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                Drop your PDF here or click to browse
                                            </h3>
                                            <p className="text-gray-500 mb-4">
                                                Supports single PDF files up to 50MB
                                            </p>
                                            {file && (
                                                <div className="bg-blue-50 rounded-lg p-3 inline-block">
                                                    <p className="text-blue-800 font-medium">{file.name}</p>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => document.getElementById('file-input').click()}
                                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                            >
                                                Choose File
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={analyzePDF}
                                        disabled={!file || loading}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 mx-auto"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                                Analyzing PDF...
                                            </>
                                        ) : (
                                            <>
                                                <Brain className="h-6 w-6" />
                                                Analyze Citations with AI
                                                <Zap className="h-5 w-5 text-yellow-300" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                /* Text Input Tab */
                                <div>
                                    <div className="mb-6">
                                        <label className="block text-lg font-medium text-gray-900 mb-3">
                                            Paste legal text for citation analysis:
                                        </label>
                                        <textarea
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            placeholder="Paste your legal document text here... (minimum 100 characters)"
                                            className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                                            minLength="100"
                                        />
                                        <p className="text-sm text-gray-500 mt-2">
                                            Tip: Longer texts provide more comprehensive citation analysis
                                        </p>
                                    </div>

                                    <button
                                        onClick={analyzeText}
                                        disabled={!text.trim() || loading}
                                        className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                                Analyzing Text...
                                            </>
                                        ) : (
                                            <>
                                                <Brain className="h-6 w-6" />
                                                Analyze Citations with AI
                                                <Zap className="h-5 w-5 text-yellow-300" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
                                    {error}
                                </div>
                            )}
                        </>
                    ) : (
                        /* Results Display */
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Citation Analysis Results
                                </h2>
                                <button
                                    onClick={resetAnalysis}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Analyze Another
                                </button>
                            </div>

                            {/* Document Info */}
                            <div className="bg-blue-50 rounded-xl p-6 mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <BookOpen className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {analysis.filename || 'Text Analysis'}
                                        </h3>
                                        <p className="text-gray-600">
                                            {analysis.stats?.total_citations || analysis.citation_count} total citations found
                                        </p>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="bg-white p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {analysis.stats?.case_law || 0}
                                        </div>
                                        <div className="text-sm text-gray-600">Case Law</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-red-600">
                                            {analysis.stats?.ipc_sections || 0}
                                        </div>
                                        <div className="text-sm text-gray-600">IPC Sections</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {analysis.stats?.crpc_sections || 0}
                                        </div>
                                        <div className="text-sm text-gray-600">CrPC Sections</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {analysis.stats?.articles || 0}
                                        </div>
                                        <div className="text-sm text-gray-600">Articles</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {analysis.stats?.acts || 0}
                                        </div>
                                        <div className="text-sm text-gray-600">Acts</div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Summary */}
                            {analysis.ai_summary || analysis.ai_analysis ? (
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border border-purple-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Brain className="h-6 w-6 text-purple-600" />
                                        <h3 className="text-lg font-bold text-purple-900">AI Legal Analysis</h3>
                                        <Zap className="h-5 w-5 text-yellow-500" />
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">
                                        {analysis.ai_summary || analysis.ai_analysis}
                                    </p>
                                </div>
                            ) : null}

                            {/* Detailed Citations */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Case Names */}
                                {analysis.citations?.case_names?.length > 0 && (
                                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-blue-600" />
                                            Case Law Citations ({analysis.citations.case_names.length})
                                        </h4>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {analysis.citations.case_names.map((caseName, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                    <Hash className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-700">{caseName}</span>
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        {analysis.citations.counts?.[caseName] || 1} mentions
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* IPC Sections */}
                                {analysis.citations?.ipc_sections?.length > 0 && (
                                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <div className="h-5 w-5 bg-red-500 rounded text-white text-xs flex items-center justify-center">⚖️</div>
                                            IPC Sections ({analysis.citations.ipc_sections.length})
                                        </h4>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {analysis.citations.ipc_sections.map((section, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                    <Hash className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-700">{section}</span>
                                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                                        {analysis.citations.counts?.[section] || 1} mentions
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* CrPC Sections */}
                                {analysis.citations?.crpc_sections?.length > 0 && (
                                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <div className="h-5 w-5 bg-purple-500 rounded text-white text-xs flex items-center justify-center">📜</div>
                                            CrPC Sections ({analysis.citations.crpc_sections.length})
                                        </h4>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {analysis.citations.crpc_sections.map((section, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                    <Hash className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-700">{section}</span>
                                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                                        {analysis.citations.counts?.[section] || 1} mentions
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Constitutional Articles */}
                                {analysis.citations?.articles?.length > 0 && (
                                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <div className="h-5 w-5 bg-green-500 rounded text-white text-xs flex items-center justify-center">🏛️</div>
                                            Constitutional Articles ({analysis.citations.articles.length})
                                        </h4>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {analysis.citations.articles.map((article, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                    <Hash className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-700">{article}</span>
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                        {analysis.citations.counts?.[article] || 1} mentions
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}