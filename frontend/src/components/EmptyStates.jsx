import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Empty state when no documents have been uploaded yet
 */
export function NoDocumentsState({ onUploadClick }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-center max-w-md">
                {/* Illustration */}
                <div className="mb-6 inline-block p-8 bg-slate-800/50 rounded-2xl border border-slate-700">
                    <span className="material-symbols-outlined text-7xl text-accent-gold/40">
                        account_balance
                    </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">Build Your Legal Archive</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                    Upload judgment PDFs to start analyzing case law with AI-powered insights.
                    All processing happens locally on your device.
                </p>

                <button
                    onClick={onUploadClick}
                    className="bg-accent-gold text-primary font-bold px-6 py-3 rounded-lg hover:scale-105 transition-transform inline-flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">upload_file</span>
                    <span>Upload First Judgment</span>
                </button>

                <div className="mt-10 grid grid-cols-3 gap-6 text-xs text-slate-500">
                    <div className="text-center">
                        <div className="text-accent-gold text-lg mb-1">🔒</div>
                        <div className="font-bold text-slate-300">Private</div>
                        <div>Never leaves device</div>
                    </div>
                    <div className="text-center">
                        <div className="text-accent-gold text-lg mb-1">⚡</div>
                        <div className="font-bold text-slate-300">Fast</div>
                        <div>&lt;10s processing</div>
                    </div>
                    <div className="text-center">
                        <div className="text-accent-gold text-lg mb-1">✅</div>
                        <div className="font-bold text-slate-300">Accurate</div>
                        <div>Exact citations</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Empty state when search returns no results
 */
export function NoResultsState({ query }) {
    return (
        <div className="text-center py-16">
            <div className="inline-block p-6 bg-slate-800/30 rounded-2xl mb-6">
                <span className="material-symbols-outlined text-6xl text-slate-600">search_off</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
            <p className="text-slate-400 mb-4 max-w-sm mx-auto">
                No relevant precedents found for "<span className="text-white font-medium">{query}</span>"
            </p>
            <p className="text-sm text-slate-500">
                Try rephrasing your question or{' '}
                <Link to="/dashboard" className="text-accent-gold hover:underline">
                    upload more documents
                </Link>
            </p>
        </div>
    );
}

/**
 * Empty state for the research workspace
 */
export function EmptyWorkspaceState() {
    return (
        <div className="text-center py-16 opacity-50">
            <span className="material-symbols-outlined text-6xl mb-4">analytics</span>
            <p className="text-sm font-bold uppercase tracking-widest">Research Workspace Empty</p>
            <p className="text-xs mt-1 text-slate-500">Start analyzing documents to see them here.</p>
        </div>
    );
}

/**
 * Empty state when chat has no messages
 */
export function EmptyChatState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-40 py-20">
            <span className="material-symbols-outlined text-7xl mb-4">forum</span>
            <p className="text-sm font-medium">Enter a query to begin AI-assisted research</p>
            <p className="text-xs mt-2 max-w-xs text-center">
                Ask questions about your uploaded judgments and get context-aware legal analysis
            </p>
        </div>
    );
}
