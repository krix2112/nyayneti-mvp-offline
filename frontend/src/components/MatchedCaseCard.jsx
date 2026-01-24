
import React from 'react';

const MatchedCaseCard = ({ caseData, onOpenPdf }) => {
    const { case_name, court, year, citation, summary, tags, relevance_score, doc_id } = caseData;

    // Color logic for relevance
    const relevanceColor = relevance_score > 90 ? 'text-green-400 bg-green-400/10' :
        relevance_score > 75 ? 'text-amber-400 bg-amber-400/10' :
            'text-slate-400 bg-slate-400/10';

    const barColor = relevance_score > 90 ? 'bg-green-500' :
        relevance_score > 75 ? 'bg-amber-500' :
            'bg-slate-500';

    return (
        <div className="bg-[#1a2332] rounded-xl border border-[#2b2f36] p-5 hover:border-blue-500/50 transition-all group">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                        {case_name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                        {court} • {year} • <span className="text-slate-500">{citation}</span>
                    </p>
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-bold ${relevanceColor} flex items-center gap-1`}>
                    <span>{relevance_score}% Match</span>
                </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-4 line-clamp-2">
                {summary}
            </p>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-wrap gap-2">
                    {tags && tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-[#0d121b] border border-[#2b2f36] text-[10px] text-slate-400 uppercase tracking-wide font-semibold">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] uppercase font-bold tracking-wider`}>
                        <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Offline
                    </div>
                    <button
                        onClick={() => onOpenPdf(doc_id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                    >
                        <span className="material-symbols-outlined text-sm">description</span>
                        View Judgment
                    </button>
                </div>
            </div>

            {/* Relevance Bar */}
            <div className="w-full h-1 bg-[#0d121b] mt-4 rounded-full overflow-hidden">
                <div
                    className={`h-full ${barColor} transition-all duration-1000 ease-out`}
                    style={{ width: `${relevance_score}%` }}
                />
            </div>
        </div>
    );
};

export default MatchedCaseCard;
