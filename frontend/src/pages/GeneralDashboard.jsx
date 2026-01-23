import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';

function GeneralDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    apiClient.getStatus().then(setStatus).catch(console.error);
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setUploading(true);
      try {
        await apiClient.uploadFile(file);
        // Refresh status
        const newStatus = await apiClient.getStatus();
        setStatus(newStatus);
        navigate('/analysis');
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploading(false);
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex font-display">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-primary flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-baseline">
              <span className="text-white text-2xl font-bold logo-hindi">न्याय</span>
              <span className="text-accent-gold text-2xl font-light ml-1">Neti</span>
            </div>
          </div>
          <nav className="space-y-1">
            <Link className="flex items-center gap-3 px-3 py-2.5 sidebar-active" to="/dashboard">
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link
              className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors"
              to="/precedents"
            >
              <span className="material-symbols-outlined text-[20px]">search_insights</span>
              <span className="text-sm font-medium">Precedent Explorer</span>
            </Link>
            <Link
              className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors"
              to="/constitutional"
            >
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
              <span className="text-sm font-medium">Constitutional Library</span>
            </Link>
            <Link
              className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors"
              to="/research"
            >
              <span className="material-symbols-outlined text-[20px]">bookmarks</span>
              <span className="text-sm font-medium">My Research</span>
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-lg mb-4">
            <span className={`material-symbols-outlined ${status?.ollama_available ? 'text-green-400' : 'text-amber-400'} text-[18px]`}>
              {status?.ollama_available ? 'verified_user' : 'pending'}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-none">Offline Database</span>
              <span className="text-[11px] text-white font-medium italic">
                {status?.ollama_available ? 'Fully Encrypted' : 'Initializing...'}
              </span>
            </div>
          </div>
          <div className="relative">
            <div
              className="flex items-center gap-3 px-3 py-4 cursor-pointer hover:bg-slate-800/30 rounded-lg transition-colors"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center border border-accent-gold/30">
                <span className="text-accent-gold text-xs font-bold">V</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Vansh</span>
                <span className="text-[10px] text-slate-500">Legal Researcher</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white dark:bg-card-dark sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-slate-800 dark:text-white">Central Hub</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
              <span className={`w-2 h-2 rounded-full ${status?.ollama_available ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              Local Engine: {status?.ollama_available ? 'Active' : 'Warming Up'}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white underline decoration-accent-gold/30">Digital Legal Lab</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest text-[10px] font-bold">
                Institutional Intelligence • Offline Powered
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/analysis" className="flex items-center gap-2 px-4 py-2 bg-accent-gold text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all text-sm">
                <span className="material-symbols-outlined text-lg">analytics</span>
                Analysis
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Upload card */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">
                    Upload Judgment for Analysis
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-accent-gold tracking-widest bg-accent-gold/10 px-2 py-1 rounded">
                    Secure Ingestion
                  </span>
                </div>
                <div className="p-8 flex-1">
                  <div
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/20 p-12 text-center flex flex-col items-center justify-center hover:border-accent-gold transition-colors cursor-pointer group"
                    onClick={triggerFileUpload}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf"
                      className="hidden"
                    />
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
                      <span className={`material-symbols-outlined ${uploading ? 'animate-bounce' : ''} text-accent-gold text-3xl`}>
                        {uploading ? 'cloud_sync' : 'upload_file'}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {uploading ? 'Processing Document...' : 'Drop judgment PDF here'}
                    </h4>
                    <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
                      Documents are indexed locally and never leave your machine.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column cards */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-primary border border-accent-gold/30 rounded-xl p-6 shadow-xl relative overflow-hidden group">
                <h3 className="text-accent-gold text-xs font-black uppercase tracking-[0.2em] mb-4">
                  Archive Status
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                    <div>
                      <p className="text-slate-400 text-[11px] font-bold">INDEXED DOCUMENTS</p>
                      <p className="text-3xl font-bold text-white">{status?.indexed_docs_count || 0}</p>
                    </div>
                    <span className="material-symbols-outlined text-accent-gold">description</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                    <div>
                      <p className="text-slate-400 text-[11px] font-bold">SYSTEM MODE</p>
                      <p className="text-xl font-bold text-white uppercase tracking-tight">
                        {status?.ollama_available ? 'Private AI' : 'Mock Mode'}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-accent-gold">security</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity table */}
            <div className="col-span-12">
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">System Activity</h3>
                </div>
                <div className="p-20 text-center text-slate-500 opacity-20">
                  <span className="material-symbols-outlined text-6xl mb-4">history</span>
                  <p className="text-sm font-bold uppercase tracking-widest">No Recent Lab Activity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GeneralDashboard;

