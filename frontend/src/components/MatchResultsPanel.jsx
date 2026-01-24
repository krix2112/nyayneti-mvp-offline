
import React from 'react';
import MatchedCaseCard from './MatchedCaseCard';

const MatchResultsPanel = ({ matches, onOpenPdf, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-3 animate-spin text-blue-500">sync</span>
                <p className="text-sm font-medium">Analyzing Precedents...</p>
            </div>
        );
    }

    if (!matches || matches.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center h-full text-slate-500 opacity-60">
                <span className="material-symbols-outlined text-5xl mb-4">gavel</span>
                <p className="text-sm">Upload a case document to find similar judgments</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-1 shrink-0">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">search_check</span>
                    Found {matches.length} Similar Cases
                </h2>
                <div className="flex gap-2">
                    <span className="text-xs text-slate-500">Sorted by Relevance</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar pb-4">
                {matches.map((match) => (
                    <MatchedCaseCard
                        key={match.doc_id}
                        caseData={match}
                        onOpenPdf={onOpenPdf}
                    />
                ))}
            </div>
        </div>
    );
};

export default MatchResultsPanel;
