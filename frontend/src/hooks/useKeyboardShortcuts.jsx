import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Global keyboard shortcuts for power users
 * 
 * Shortcuts:
 * - Ctrl/Cmd + K: Go to Precedent Explorer (Search)
 * - Ctrl/Cmd + U: Go to Dashboard (Upload)
 * - Ctrl/Cmd + H: Go to Home
 * - ?: Show shortcuts help (console log for now)
 */
export function useKeyboardShortcuts() {
    const navigate = useNavigate();

    useEffect(() => {
        function handleKeyPress(e) {
            // Ignore if typing in input or textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const isMod = e.metaKey || e.ctrlKey;

            // Cmd/Ctrl + K: Search / Precedent Explorer
            if (isMod && e.key === 'k') {
                e.preventDefault();
                navigate('/precedents');
            }

            // Cmd/Ctrl + U: Upload / Dashboard
            if (isMod && e.key === 'u') {
                e.preventDefault();
                navigate('/dashboard');
            }

            // Cmd/Ctrl + H: Home
            if (isMod && e.key === 'h') {
                e.preventDefault();
                navigate('/');
            }

            // ? key: Show shortcuts help
            if (e.key === '?' && !isMod) {
                e.preventDefault();
                console.log(`
NyayNeti Keyboard Shortcuts:
---------------------------
⌘/Ctrl + K  →  Search (Precedent Explorer)
⌘/Ctrl + U  →  Upload (Dashboard)
⌘/Ctrl + H  →  Home
?           →  Show this help
        `);
            }
        }

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [navigate]);
}

/**
 * Keyboard shortcuts indicator component
 */
export function ShortcutsHint() {
    // Hidden during presentation - uncomment to show shortcuts panel
    return null;
    /*
    return (
        <div className="fixed bottom-4 left-4 text-[10px] text-slate-600 space-y-1 bg-slate-800/30 backdrop-blur-sm p-3 rounded-lg border border-slate-800 hidden lg:block">
            <div className="text-slate-500 font-bold uppercase tracking-widest mb-2">Shortcuts</div>
            <div><kbd className="px-1 py-0.5 bg-slate-700 rounded text-slate-400">⌘K</kbd> Search</div>
            <div><kbd className="px-1 py-0.5 bg-slate-700 rounded text-slate-400">⌘U</kbd> Upload</div>
            <div><kbd className="px-1 py-0.5 bg-slate-700 rounded text-slate-400">?</kbd> Help</div>
        </div>
    );
    */
}
