import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText,
    Download,
    Save,
    Sparkles,
    ArrowLeft,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    FileDigit,
    Scale,
    Gavel
} from 'lucide-react';
import { apiClient } from '../api/client';

const DocumentDrafter = () => {
    const [templates, setTemplates] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [contextDocId, setContextDocId] = useState(null);
    const [formData, setFormData] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(1); // 1: Select Tpl, 1.5: Select Context, 2: Impute, 3: Review

    useEffect(() => {
        fetchTemplates();
        fetchDocuments();
    }, []);

    const fetchTemplates = async () => {
        try {
            const data = await apiClient.getTemplates();
            setTemplates(data || []);
        } catch (err) {
            console.error('Failed to fetch templates:', err);
            setError('Could not load templates. Please check backend.');
        }
    };

    const fetchDocuments = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/documents');
            const data = await response.json();
            setDocuments(data.documents || []);
        } catch (err) {
            console.error('Failed to fetch documents:', err);
        }
    };

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setFormData({});
        setStep(1.5);
    };

    const skipContext = () => {
        setStep(2);
    };

    const analyzeContext = async (docId) => {
        setContextDocId(docId);
        setIsAnalyzing(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/api/analyze-draft-context', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doc_id: docId,
                    template_type: selectedTemplate.id
                })
            });
            const data = await response.json();
            if (data.success) {
                // Filter out NOT_FOUND values
                const extracted = {};
                Object.entries(data.extracted_fields).forEach(([k, v]) => {
                    if (v !== 'NOT_FOUND' && v !== 'Unknown' && v !== '') {
                        extracted[k] = v;
                    }
                });
                setFormData(extracted);
                setStep(2);
            } else {
                throw new Error(data.error || 'Analysis failed');
            }
        } catch (err) {
            setError('Failed to analyze document. You can still fill details manually.');
            setStep(2);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const generateDraft = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const response = await apiClient.draftDocument({
                template_type: selectedTemplate.id,
                user_inputs: formData,
                enhance: true
            });
            setResult(response);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const reset = () => {
        setStep(1);
        setSelectedTemplate(null);
        setContextDocId(null);
        setFormData({});
        setResult(null);
    };

    return (
        <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r border-white/10 bg-slate-800/50 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-2 mb-6">
                        <span className="text-2xl font-black tracking-tighter text-gold">NyayNeti</span>
                    </Link>
                    <div className="space-y-4">
                        <div className={`flex items-center gap-3 p-2 rounded-lg transition-all ${step === 1 ? 'bg-gold/10 text-gold' : 'text-gray-500'}`}>
                            <FileDigit size={18} />
                            <span className="text-sm font-bold">Select Template</span>
                        </div>
                        <div className={`flex items-center gap-3 p-2 rounded-lg transition-all ${step === 1.5 ? 'bg-gold/10 text-gold' : 'text-gray-500'}`}>
                            <FileText size={18} />
                            <span className="text-sm font-bold">Context (Optional)</span>
                        </div>
                        <div className={`flex items-center gap-3 p-2 rounded-lg transition-all ${step === 2 ? 'bg-gold/10 text-gold' : 'text-gray-500'}`}>
                            <Sparkles size={18} />
                            <span className="text-sm font-bold">Input Details</span>
                        </div>
                        <div className={`flex items-center gap-3 p-2 rounded-lg transition-all ${step === 3 ? 'bg-gold/10 text-gold' : 'text-gray-500'}`}>
                            <Save size={18} />
                            <span className="text-sm font-bold">Review & Save</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 mt-auto">
                    <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm transition-colors">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gold/5 blur-[120px] rounded-full pointer-events-none"></div>

                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-slate-800/30 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <Scale className="text-gold" />
                        <h1 className="text-xl font-bold tracking-tight">NyayNeti Auto-Drafter</h1>
                        <span className="text-xs bg-slate-700 text-gold px-2 py-1 rounded font-mono">V2.1 OFFLINE</span>
                    </div>
                    {step > 1 && (
                        <button onClick={reset} className="text-sm text-gray-400 hover:text-white transition-colors">
                            Restart
                        </button>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                            <AlertCircle size={20} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* STEP 1: SELECT TEMPLATE */}
                    {step === 1 && (
                        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-10">
                                <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                                    <FileText className="text-gold" size={32} /> Select specialized template
                                </h2>
                                <p className="text-gray-400">Choose from professionally vetted legal templates prepared for Indian Courts.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {templates.map(tpl => (
                                    <button
                                        key={tpl.id}
                                        onClick={() => handleTemplateSelect(tpl)}
                                        className="group bg-slate-800/40 border border-white/5 hover:border-gold/50 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(255,215,0,0.1)] relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-3xl group-hover:bg-gold/20 transition-all"></div>
                                        <div className="size-12 bg-gold/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            {tpl.id === 'bail_application' ? <Gavel className="text-gold" /> :
                                                tpl.id === 'legal_notice' ? <AlertCircle className="text-gold" /> :
                                                    tpl.id === 'charge_sheet' ? <FileText className="text-orange-400" /> :
                                                        <FileText className="text-gold" />}
                                        </div>
                                        <h3 className="text-lg font-bold mb-2 group-hover:text-gold transition-colors">{tpl.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{tpl.description}</p>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            BEGIN DRAFTING <ChevronRight size={14} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 1.5: SELECT CONTEXT */}
                    {step === 1.5 && (
                        <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center mb-10">
                                <div className="size-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Sparkles className="text-gold" size={32} />
                                </div>
                                <h2 className="text-3xl font-black mb-2">Enhance with Context?</h2>
                                <p className="text-gray-400">Select a document (complaint, previous order, etc.) and NyayNeti AI will pre-fill the fields for you.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                {documents.length > 0 ? (
                                    documents.map(doc => (
                                        <button
                                            key={doc.doc_id}
                                            onClick={() => analyzeContext(doc.doc_id)}
                                            disabled={isAnalyzing}
                                            className="p-4 bg-slate-800/40 border border-white/5 hover:border-gold/50 rounded-xl text-left transition-all flex items-center gap-4 group disabled:opacity-50"
                                        >
                                            <div className="size-10 bg-slate-900 rounded-lg flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-slate-900 transition-all">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-bold truncate">{doc.doc_id}</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{doc.chunks} chunks indexed</p>
                                            </div>
                                            {isAnalyzing && contextDocId === doc.doc_id ? (
                                                <div className="size-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin"></div>
                                            ) : (
                                                <ChevronRight size={16} className="text-gray-600 group-hover:text-gold" />
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="md:col-span-2 p-12 border-2 border-dashed border-white/5 rounded-3xl text-center">
                                        <p className="text-gray-500 mb-4 text-sm">No documents found in your repository.</p>
                                        <Link to="/dashboard" className="text-gold font-bold hover:underline text-sm">Upload a PDF first →</Link>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={skipContext}
                                    className="px-8 py-3 text-gray-400 hover:text-white border border-white/10 rounded-xl text-sm font-bold transition-all"
                                >
                                    Skip & Fill Manually
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: INPUT DETAILS */}
                    {step === 2 && selectedTemplate && (
                        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="mb-10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black mb-2">Drafting {selectedTemplate.name}</h2>
                                    <p className="text-gray-400 text-sm">Fill in the primary details. AI will handle the legal language.</p>
                                </div>
                                <div className="size-16 bg-gold/10 rounded-2xl flex items-center justify-center">
                                    <Sparkles className="text-gold animate-pulse" />
                                </div>
                            </div>

                            <div className="bg-slate-800/40 border border-white/5 rounded-3xl p-8 space-y-6 backdrop-blur-xl shadow-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {selectedTemplate.fields.map(field => (
                                        <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                                                {field.label}
                                            </label>
                                            {field.type === 'textarea' ? (
                                                <textarea
                                                    rows={4}
                                                    value={formData[field.name] || ''}
                                                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all placeholder:text-gray-600 resize-none"
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={formData[field.name] || ''}
                                                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-all placeholder:text-gray-600"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-green-500" /> Auto-citing relevant precedents enabled
                                    </p>
                                    <button
                                        onClick={generateDraft}
                                        disabled={isGenerating || Object.keys(formData).length < 2}
                                        className="px-8 py-4 bg-gradient-to-r from-gold to-orange-600 hover:from-orange-600 hover:to-gold rounded-2xl font-black text-slate-900 tracking-tight transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg shadow-gold/20 active:scale-95"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="size-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                                                GENERATING DRAFT...
                                            </>
                                        ) : (
                                            <>
                                                GENERATE LEGAL DRAFT <Sparkles size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: REVIEW & DOWNLOAD */}
                    {step === 3 && result && (
                        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in zoom-in-95 duration-700">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-slate-800/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
                                    <div className="p-4 bg-slate-800 border-b border-white/10 flex items-center justify-between">
                                        <span className="text-xs font-mono text-gray-400">Generated Content Preview</span>
                                        <div className="flex gap-1">
                                            <div className="size-2 rounded-full bg-red-500/50"></div>
                                            <div className="size-2 rounded-full bg-yellow-500/50"></div>
                                            <div className="size-2 rounded-full bg-green-500/50"></div>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-12 bg-white text-slate-900 font-serif leading-relaxed text-sm shadow-inner overflow-x-hidden custom-scrollbar">
                                        <div className="whitespace-pre-wrap font-serif">
                                            {result.full_text}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-gold/20 to-orange-500/10 border border-gold/30 rounded-3xl p-8 backdrop-blur-xl">
                                    <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                                        <Download className="text-gold" /> Success!
                                    </h3>
                                    <p className="text-sm text-gray-300 mb-6 font-medium leading-relaxed">
                                        Your document has been drafted with AI-enhanced legal language and automatically inserted citations for sections mentioned.
                                    </p>

                                    <div className="space-y-3">
                                        <a
                                            href={`http://localhost:8000/api/download/${result.filename}`}
                                            className="flex items-center justify-between p-4 bg-gold rounded-2xl text-slate-900 font-black tracking-tight hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-gold/20"
                                        >
                                            DOWNLOAD {result.filename?.endsWith('.docx') ? 'PROFESSIONAL (.DOCX)' : 'DOCUMENT (.TXT)'}
                                            <Download size={20} />
                                        </a>
                                    </div>
                                </div>

                                <div className="bg-slate-800/40 border border-white/5 rounded-3xl p-6">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">AI ANALYTICS</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs text-gray-500">Legal Complexity</span>
                                            <span className="text-sm font-bold text-gold">ADVANCED</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                            <div className="h-full bg-gold w-[85%]"></div>
                                        </div>

                                        <div className="pt-4 flex items-center gap-3 text-sm text-gray-300">
                                            <div className="size-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 flex-shrink-0">
                                                <Scale size={16} />
                                            </div>
                                            <p>Draft contains <strong>{result.citations?.length || 0}</strong> auto-selected legal citations.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <style jsx="true">{`
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

export default DocumentDrafter;
