import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart3,
    ChevronRight,
    AlertTriangle,
    CheckCircle2,
    Lightbulb,
    ShieldCheck,
    FileText,
    Search,
    Activity,
    Zap,
    ArrowRight
} from 'lucide-react';
import { apiClient } from '../api/client';

const StrengthAnalyzer = () => {
    const [documents, setDocuments] = useState([]);
    const [selectedDocId, setSelectedDocId] = useState('');
    const [textToAnalyze, setTextToAnalyze] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const resp = await apiClient.listDocuments();
            setDocuments(resp.documents || []);
        } catch (e) {
            console.error('Failed to load documents:', e);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedDocId && !textToAnalyze.trim()) {
            setError('Please select a document or paste text to analyze');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setAnalysis(null);

        try {
            const result = await apiClient.analyzeStrength({
                doc_id: selectedDocId || null,
                text: selectedDocId ? null : textToAnalyze
            });
            setAnalysis(result);
        } catch (err) {
            setError('Analysis failed. Please ensure backend is running.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-gold';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-500/20 shadow-[0_0_20px_rgba(74,222,128,0.2)]';
        if (score >= 60) return 'bg-gold/20 shadow-[0_0_20px_rgba(255,215,0,0.2)]';
        if (score >= 40) return 'bg-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.2)]';
        return 'bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]';
    };

    return (
        <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
            {/* Left Selection Panel */}
            <div className="w-[400px] border-r border-white/10 bg-slate-800/50 flex flex-col">
                <div className="p-8 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-2 mb-8">
                        <span className="text-2xl font-black tracking-tighter text-gold">NyayNeti</span>
                    </Link>
                    <h1 className="text-2xl font-black mb-2 flex items-center gap-3">
                        <BarChart3 className="text-gold" /> Strength Analyzer
                    </h1>
                    <p className="text-sm text-gray-400">Evaluate legal weight and technical robustness of your arguments.</p>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* Selector */}
                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 block">
                            CHOOSE DOCUMENT FOR ANALYSIS
                        </label>
                        <div className="space-y-3">
                            <select
                                value={selectedDocId}
                                onChange={(e) => {
                                    setSelectedDocId(e.target.value);
                                    setTextToAnalyze('');
                                }}
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-gold transition-all"
                            >
                                <option value="">Select from repository...</option>
                                {documents.map(doc => (
                                    <option key={doc.doc_id} value={doc.doc_id}>{doc.filename || doc.doc_id}</option>
                                ))}
                            </select>

                            <div className="relative py-4 flex items-center gap-4">
                                <div className="h-px bg-white/5 flex-1"></div>
                                <span className="text-[10px] font-black text-gray-600">OR PASTE RAW TEXT</span>
                                <div className="h-px bg-white/5 flex-1"></div>
                            </div>

                            <textarea
                                placeholder="Paste legal text here for instant analysis..."
                                value={textToAnalyze}
                                onChange={(e) => {
                                    setTextToAnalyze(e.target.value);
                                    setSelectedDocId('');
                                }}
                                rows={6}
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-gold transition-all placeholder:text-gray-700 resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || (!selectedDocId && !textToAnalyze.trim())}
                        className="w-full py-5 bg-gradient-to-r from-gold to-orange-600 hover:from-orange-600 hover:to-gold text-slate-900 font-black rounded-2xl transition-all shadow-xl shadow-gold/10 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                    >
                        {isAnalyzing ? (
                            <div className="size-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                        ) : (
                            <>RUN DEEP ANALYSIS <Zap size={18} fill="currentColor" /></>
                        )}
                    </button>
                </div>

                <div className="p-8 border-t border-white/10">
                    <Link to="/dashboard" className="text-sm text-gray-500 hover:text-white flex items-center gap-2">
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            {/* Main Analysis Results */}
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar relative">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gold/5 blur-[100px] rounded-full"></div>

                {!analysis && !isAnalyzing && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                        <ShieldCheck size={120} className="mb-6 text-gray-500" />
                        <h2 className="text-3xl font-black">LITIGATION READINESS SCORE</h2>
                        <p className="max-w-md mt-4">Select a document to retrieve a detailed breakdown of citation strength, argument quality, and legal basis.</p>
                    </div>
                )}

                {isAnalyzing && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="size-20 border-4 border-gold/10 border-t-gold rounded-full animate-spin mb-8"></div>
                        <h2 className="text-2xl font-black animate-pulse">ANALYZING LEGAL WEIGHT...</h2>
                        <p className="text-gray-500 mt-2">Checking precedents, hierarchy of courts, and evidence diversity.</p>

                        <div className="mt-12 w-full max-w-md space-y-4">
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gold w-1/3 animate-[loading_2s_ease-in-out_infinite]"></div>
                            </div>
                        </div>
                    </div>
                )}

                {analysis && (
                    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-700">
                        {/* Summary Card */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                            <div className={`col-span-1 rounded-[40px] p-10 flex flex-col items-center justify-center text-center border border-white/10 ${getScoreBg(analysis.overall_score)}`}>
                                <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">LITIGATION WEIGHT</span>
                                <div className="relative mb-6">
                                    <svg className="size-40 rotate-[-90deg]">
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent"
                                            strokeDasharray={440}
                                            strokeDashoffset={440 - (440 * analysis.overall_score) / 100}
                                            className={getScoreColor(analysis.overall_score)} />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-5xl font-black ${getScoreColor(analysis.overall_score)}`}>{analysis.overall_score}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">OUT OF 100</span>
                                    </div>
                                </div>
                                <div className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-black/30 mb-2 ${getScoreColor(analysis.overall_score)}`}>
                                    {analysis.grade}
                                </div>
                            </div>

                            <div className="col-span-1 lg:col-span-2 bg-slate-800/40 border border-white/5 rounded-[40px] p-10 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                                        <Activity className="text-gold" /> Key Insights
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(analysis.components).map(([key, val]) => (
                                            <div key={key} className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-black text-gray-500 uppercase">{key.replace('_', ' ')}</span>
                                                    <span className={`text-sm font-bold ${getScoreColor(val.score)}`}>{val.score}%</span>
                                                </div>
                                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div className={`h-full ${getScoreColor(val.score).replace('text-', 'bg-')} transition-all duration-1000`} style={{ width: `${val.score}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Precedents Verified</span>
                                        <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Evidence Checked</span>
                                    </div>
                                    <span>Analysis Time: {analysis.analysis_time?.toFixed(2)}s</span>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations & Weaknesses */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-slate-800/40 border border-white/5 rounded-[40px] p-10">
                                <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-gold">
                                    <Lightbulb fill="currentColor" size={20} /> Optimization Required
                                </h3>
                                <div className="space-y-4">
                                    {analysis.recommendations.map((rec, i) => (
                                        <div key={i} className="group p-5 bg-slate-900/50 rounded-3xl border border-white/5 hover:border-gold/30 transition-all flex gap-4">
                                            <div className={`size-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${rec.priority === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {rec.priority === 'high' ? <AlertTriangle size={18} /> : <ArrowRight size={18} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black uppercase text-gray-500">{rec.area}</span>
                                                    {rec.priority === 'high' && <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">CRITICAL</span>}
                                                </div>
                                                <p className="text-sm text-gray-300 leading-relaxed font-medium">{rec.suggestion}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-800/40 border border-white/5 rounded-[40px] p-10">
                                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                    <ShieldCheck className="text-gold" size={20} /> Detected Strengths
                                </h3>
                                <div className="space-y-3">
                                    {analysis.strengths.map((s, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-green-500/5 border border-green-500/10">
                                            <CheckCircle2 size={18} className="text-green-500 mt-0.5" />
                                            <p className="text-sm text-gray-300 font-medium">{s}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10">
                                    <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                        <AlertTriangle className="text-orange-500" size={20} /> Areas of Concern
                                    </h3>
                                    <div className="space-y-3">
                                        {analysis.weaknesses.map((w, i) => (
                                            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                                                <AlertTriangle size={18} className="text-orange-500 mt-0.5" />
                                                <p className="text-sm text-gray-300 font-medium">{w}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx="true">{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.2);
          border-radius: 4px;
        }
      `}</style>
        </div>
    );
};

export default StrengthAnalyzer;
