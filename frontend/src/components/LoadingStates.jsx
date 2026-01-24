import React from 'react';

/**
 * Full-screen loading overlay for document processing
 */
export function UploadingState({ progress = 0, fileName = 'Document' }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-primary rounded-xl p-8 max-w-md w-full mx-4 border border-accent-gold/20 shadow-2xl">
                <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-accent-gold/10 rounded-full mb-4">
                        <span className="material-symbols-outlined text-5xl text-accent-gold animate-pulse">
                            cloud_upload
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Processing Judgment</h3>
                    <p className="text-sm text-slate-400 truncate max-w-xs mx-auto">{fileName}</p>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">Extracting text & citations...</span>
                        <span className="text-accent-gold font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-accent-gold to-orange-400 h-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Status steps */}
                <div className="text-xs space-y-2 bg-slate-900/50 rounded-lg p-4 border border-slate-800">
                    <div className="flex items-center gap-2 text-green-400">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        <span>Document uploaded</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        <span>OCR processing complete</span>
                    </div>
                    <div className="flex items-center gap-2 text-accent-gold">
                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                        <span>Extracting legal provisions...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Inline loading indicator for AI queries
 */
export function QueryingState() {
    return (
        <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-blue-300 font-medium">Neural engine analyzing judgment...</span>
        </div>
    );
}

/**
 * Loading skeleton for cards
 */
export function CardSkeleton() {
    return (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4 mb-4" />
            <div className="h-3 bg-slate-700 rounded w-full mb-2" />
            <div className="h-3 bg-slate-700 rounded w-5/6" />
        </div>
    );
}

/**
 * Loading skeleton for document list items
 */
export function DocumentSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg animate-pulse">
            <div className="w-10 h-10 bg-slate-700 rounded-lg" />
            <div className="flex-1">
                <div className="h-4 bg-slate-700 rounded w-48 mb-2" />
                <div className="h-3 bg-slate-700 rounded w-32" />
            </div>
        </div>
    );
}
