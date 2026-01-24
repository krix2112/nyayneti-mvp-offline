import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

/**
 * Floating status bar showing backend and model health
 */
export default function StatusBar() {
    const [status, setStatus] = useState({
        backend: 'checking',
        model: 'Unknown',
        privacy: '100% Local',
        docCount: 0,
    });
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 15000); // Check every 15s
        return () => clearInterval(interval);
    }, []);

    async function checkStatus() {
        try {
            const data = await apiClient.getStatus();
            setStatus({
                backend: 'online',
                model: data.model?.local_llm_loaded ? 'Llama 3.2 3B (Local)' :
                    data.model?.ollama_available ? 'Ollama Active' : 'Demo Mode',
                privacy: '100% Local',
                docCount: data.model?.indexed_docs_count || 0,
            });
        } catch (error) {
            setStatus(prev => ({ ...prev, backend: 'offline' }));
        }
    }

    const statusColor = {
        online: 'bg-green-500',
        offline: 'bg-red-500',
        checking: 'bg-yellow-500',
    };

    return (
        <div
            className="fixed bottom-4 right-4 z-50"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className={`bg-primary/95 backdrop-blur-md border border-slate-700 rounded-lg shadow-2xl transition-all duration-300 ${isExpanded ? 'w-64' : 'w-auto'}`}>
                {/* Compact view */}
                <div className="flex items-center gap-2 px-3 py-2 cursor-pointer">
                    <span className={`w-2 h-2 rounded-full ${statusColor[status.backend]} ${status.backend === 'online' ? 'animate-pulse' : ''}`} />
                    <span className="text-xs text-slate-300 font-medium">
                        {status.backend === 'online' ? 'Engine Active' :
                            status.backend === 'offline' ? 'Offline' :
                                'Connecting...'}
                    </span>
                </div>

                {/* Expanded view */}
                {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">psychology</span>
                                Model
                            </span>
                            <span className="text-blue-400 font-medium">{status.model}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">description</span>
                                Documents
                            </span>
                            <span className="text-white font-bold">{status.docCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">lock</span>
                                Privacy
                            </span>
                            <span className="text-green-400 font-medium">{status.privacy}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
