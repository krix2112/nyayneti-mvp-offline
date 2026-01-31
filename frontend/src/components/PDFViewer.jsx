import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
    Download,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Loader2,
    ZoomIn,
    ZoomOut,
    Maximize2
} from 'lucide-react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Professional Local Worker Config for VITE - Explicit version to match API
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;

const PDFViewer = ({ fileUrl, highlights = [] }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.2);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setIsLoading(false);
        setError(null);
    }

    function onDocumentLoadError(err) {
        console.error('PDF Load Error:', err);
        setError(`Failed to load PDF: ${err.message}`);
        setIsLoading(false);
    }

    const changePage = (offset) => {
        setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages));
    };

    const handleDownload = () => {
        if (!fileUrl) return;
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileUrl.split('/').pop() || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
            {/* Professional Toolbar */}
            <div className="h-12 bg-slate-800 border-b border-white/10 flex items-center justify-between px-4 z-10 transition-all duration-300">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => changePage(-1)}
                        disabled={pageNumber <= 1}
                        className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft size={18} className="text-gold" />
                    </button>
                    <span className="text-xs font-bold text-gray-400 min-w-16 text-center tracking-tighter">
                        PAGE {pageNumber} / {numPages || '?'}
                    </span>
                    <button
                        onClick={() => changePage(1)}
                        disabled={pageNumber >= numPages}
                        className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight size={18} className="text-gold" />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-900 rounded-lg p-0.5 border border-white/5">
                        <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-1.5 hover:text-gold transition-colors">
                            <ZoomOut size={14} />
                        </button>
                        <span className="px-2 py-1 text-[10px] font-mono font-bold border-x border-white/5 min-w-14 text-center text-gold">
                            {Math.round(scale * 100)}%
                        </span>
                        <button onClick={() => setScale(s => Math.min(3.0, s + 0.2))} className="p-1.5 hover:text-gold transition-colors">
                            <ZoomIn size={14} />
                        </button>
                    </div>

                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 hover:bg-gold/20 text-gold rounded-lg text-xs font-bold transition-all border border-gold/20"
                    >
                        <Download size={14} />
                        SAVE
                    </button>
                </div>
            </div>

            {/* Document Display Area */}
            <div className="flex-1 overflow-auto p-6 flex justify-center bg-slate-950/30 custom-scrollbar scroll-smooth">
                {isLoading && fileUrl && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20">
                        <Loader2 className="text-gold animate-spin mb-4" size={48} />
                        <p className="text-sm font-bold text-gold tracking-widest animate-pulse">PREPARING LEGAL DOCUMENT...</p>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900/50 z-20">
                        <div className="size-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6">
                            <AlertCircle className="text-red-500" size={40} />
                        </div>
                        <h3 className="text-xl font-black mb-2 tracking-tight">DOCUMENT LOAD FAILED</h3>
                        <p className="text-sm text-gray-500 max-w-md leading-relaxed">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold tracking-widest transition-all"
                        >
                            RETRY CONNECTION
                        </button>
                    </div>
                )}

                {!fileUrl && (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                        <Maximize2 size={64} className="mb-4 text-gray-500" />
                        <h3 className="text-xl font-bold">NO DOCUMENT SELECTED</h3>
                        <p className="text-sm mt-2">Select a document from the menu to activate preview</p>
                    </div>
                )}

                {fileUrl && (
                    <div className="shadow-[0_40px_100px_rgba(0,0,0,0.7)] bg-white rounded-sm overflow-hidden transform-gpu border border-white/5">
                        <Document
                            file={fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={null}
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                renderAnnotationLayer={true}
                                renderTextLayer={true}
                                className="max-w-full"
                            />
                        </Document>
                    </div>
                )}
            </div>

            {/* Status Footer */}
            <div className="px-4 py-2 bg-slate-900 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono tracking-widest uppercase">
                <span className="flex items-center gap-2">
                    <div className="size-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    NyayNeti Secure Viewer v2.0
                </span>
                {numPages && <span>INDEXED • PAGE {pageNumber} OF {numPages}</span>}
            </div>

            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 215, 0, 0.1);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 215, 0, 0.3);
                }
            `}</style>
        </div>
    );
};

export default PDFViewer;
