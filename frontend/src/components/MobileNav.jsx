import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Mobile navigation component with hamburger menu
 */
export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/precedents', label: 'Precedent Explorer', icon: 'search_insights' },
        { path: '/constitutional', label: 'Constitutional Library', icon: 'menu_book' },
        { path: '/research', label: 'My Research', icon: 'bookmarks' },
        { path: '/boundaries', label: 'Research Boundaries', icon: 'description' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile header - only visible on small screens */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-primary border-b border-slate-800 px-4 py-3 flex items-center justify-between z-50">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/logo.png" alt="NyayNeti" className="h-8 w-auto object-contain" />
                </Link>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-white"
                    aria-label="Toggle menu"
                >
                    <span className="material-symbols-outlined text-2xl">
                        {isOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile menu drawer */}
            <div
                className={`lg:hidden fixed top-0 right-0 bottom-0 w-72 bg-primary border-l border-slate-800 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-lg font-bold text-white">Navigation</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-slate-800 rounded"
                        >
                            <span className="material-symbols-outlined text-slate-400">close</span>
                        </button>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                        ? 'bg-accent-gold/10 text-accent-gold border-l-2 border-accent-gold'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="material-symbols-outlined text-green-400 text-sm">lock</span>
                                <span>100% Offline • Data Never Leaves Device</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer for fixed header on mobile */}
            <div className="lg:hidden h-14" />
        </>
    );
}
