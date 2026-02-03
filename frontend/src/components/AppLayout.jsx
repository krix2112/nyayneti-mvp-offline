import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AppLayout({ children, showUploadButton = true }) {
    const navigate = useNavigate();
    const fileInputRef = React.useRef(null);
    const [uploading, setUploading] = React.useState(false);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetch('http://localhost:8000/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (response.ok) {
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Upload failed:', error);
                alert('Upload failed. Please ensure the backend is running.');
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white relative">
            {/* Animated Background Grid */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>

            {/* Gradient Orbs */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Navigation */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-yellow-500/20 px-6 md:px-20 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <img src="/logo.png" alt="NyayNeti Logo" className="h-14 w-auto object-contain" />
                    <div className="text-xl font-bold" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                        <span className="text-yellow-500">न्याय</span>
                        <span className="text-white">Neti</span>
                    </div>
                </Link>
                <nav className="hidden md:flex items-center gap-8">
                    <Link className="text-sm font-medium hover:text-yellow-500 transition-colors" to="/dashboard">Dashboard</Link>
                    <Link className="text-sm font-medium hover:text-yellow-500 transition-colors" to="/citation-finder">Citation Finder</Link>
                    <Link className="text-sm font-medium hover:text-yellow-500 transition-colors" to="/compare">Compare</Link>
                </nav>
                {showUploadButton && (
                    <button
                        onClick={handleUploadClick}
                        disabled={uploading}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-950 text-sm font-bold px-6 py-2.5 rounded-lg hover:shadow-lg hover:shadow-yellow-500/50 transition-all relative overflow-hidden group"
                    >
                        <span className="relative z-10">{uploading ? 'Processing...' : 'Upload PDF'}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                )}
            </header>

            {/* Main Content */}
            <main className="relative z-10">
                {children}
            </main>

            {/* Footer */}
            <footer className="py-10 bg-slate-950 border-t border-yellow-500/20 relative z-10">
                <div className="container mx-auto px-6 md:px-20">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <div className="text-xl font-bold mb-2" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                                <span className="text-yellow-500">न्याय-नीति</span> <span className="text-white">NyayNeti</span>
                            </div>
                            <p className="text-gray-500 text-sm">Professional legal intelligence for Indian judicial officers.</p>
                        </div>
                        <div className="flex gap-8 text-sm text-gray-400">
                            <a href="#" className="hover:text-yellow-500 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-yellow-500 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-yellow-500 transition-colors">Sovereignty Guide</a>
                        </div>
                        <div className="text-sm text-gray-500">
                            <div className="mb-1 text-xs">DEVELOPED BY</div>
                            <div className="font-bold text-white">We Had No Third</div>
                        </div>
                    </div>
                    <div className="mt-8 text-center text-xs text-gray-600">
                        © 2026 NYAYNETI MVP. ALL RIGHTS RESERVED. NOT FOR PUBLIC COMMERCIAL USE.
                    </div>
                </div>
            </footer>
        </div>
    );
}
