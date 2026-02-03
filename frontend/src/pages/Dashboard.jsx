import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PenTool, BarChart2, Split } from 'lucide-react';
import { apiClient } from '../api/client';

export default function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploading(true);
      setUploadProgress('Starting upload...');
      setProgressPercent(0);
      setError('');
      setUploadSuccess(false);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:8000/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

            try {
              const data = JSON.parse(trimmedLine.slice(6));
              console.log('Upload Progress:', data);

              if (data.status === 'processing') {
                setUploadProgress(data.message || 'Processing...');
                if (data.progress) setProgressPercent(data.progress);
              } else if (data.status === 'completed' || (data.progress === 100 && data.success)) {
                setUploadedFile(data.data || { name: file.name });
                setUploadSuccess(true);
                setUploading(false);
              } else if (data.status === 'error' || data.error) {
                throw new Error(data.message || data.status || 'Upload error');
              }
            } catch (e) {
              console.error('Progress parse error:', e, 'Line:', trimmedLine);
            }
          }
        }
      } catch (err) {
        console.error('Upload error:', err);
        setError(err.message || 'Upload failed');
        setUploading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-white font-display">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      <header className="sticky top-0 z-50 glass-header px-6 md:px-20 py-4 flex items-center justify-between border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="NyayNeti Logo" className="h-16 w-auto object-contain" />
        </Link>
        <nav className="flex items-center gap-6">
          <Link className="text-sm font-medium text-gold hover:text-white transition-colors" to="/my-research">
            My Research
          </Link>
          <Link className="text-sm font-medium text-gray-300 hover:text-white transition-colors" to="/compare">
            Compare
          </Link>
          <Link className="text-sm font-medium text-gray-300 hover:text-white transition-colors" to="/citation-finder">
            Citation Finder
          </Link>
          <Link className="text-sm font-medium text-gray-300 hover:text-white transition-colors" to="/perfect-citation-finder">
            Perfect Finder
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-gold">Lawyer's Command Center</h1>
            <p className="text-xl text-gray-400">Secure, offline document intelligence.</p>
          </div>

          {/* Upload Card */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-10 border border-white/10 shadow-2xl mb-12">
            {!uploadSuccess ? (
              <div
                onClick={handleUploadClick}
                className="border-2 border-dashed border-gold/30 rounded-2xl p-16 text-center cursor-pointer hover:border-gold hover:bg-gold/5 transition-all group"
              >
                <div className="mb-6">
                  <span className="material-symbols-outlined text-8xl text-gold group-hover:scale-110 transition-transform">
                    {uploading ? 'sync' : 'upload_file'}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {uploading ? uploadProgress : 'Click to Upload PDF'}
                </h3>
                <p className="text-gray-400">
                  {uploading ? `${progressPercent}% complete` : '100% private. Files never leave this machine.'}
                </p>
                {uploading && (
                  <div className="mt-8 max-w-md mx-auto">
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-7xl text-green-400 mb-4">check_circle</span>
                <h3 className="text-3xl font-bold mb-2">Processed Successfully</h3>
                <p className="text-gray-400 mb-8">{uploadedFile?.name}</p>
                <div className="flex gap-4 justify-center">
                  <button onClick={() => setUploadSuccess(false)} className="px-6 py-2 bg-white/10 rounded-xl font-bold">Upload New</button>
                  <button onClick={() => navigate('/my-research')} className="px-6 py-2 bg-gold text-primary rounded-xl font-bold">Go to Research</button>
                </div>
              </div>
            )}
            {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/viewer" className="p-8 bg-slate-800/40 rounded-3xl border border-white/5 hover:border-gold/50 transition-all group">
              <div className="size-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <Split size={32} />
              </div>
              <h4 className="font-bold text-xl mb-1">Smart Viewer</h4>
              <p className="text-sm text-gray-400">AI chat with document context</p>
            </Link>

            <Link to="/compare" className="p-8 bg-slate-800/40 rounded-3xl border border-white/5 hover:border-gold/50 transition-all group">
              <div className="size-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl">compare_arrows</span>
              </div>
              <h4 className="font-bold text-xl mb-1">Deep Compare</h4>
              <p className="text-sm text-gray-400">Find subtle differences side-by-side</p>
            </Link>

            <Link to="/citation-finder" className="p-8 bg-slate-800/40 rounded-3xl border border-white/5 hover:border-gold/50 transition-all group">
              <div className="size-14 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl">search</span>
              </div>
              <h4 className="font-bold text-xl mb-1">Citation Finder</h4>
              <p className="text-sm text-gray-400">Scan for legal precedents</p>
            </Link>

            <Link to="/perfect-citation-finder" className="p-8 bg-slate-800/40 rounded-3xl border border-white/5 hover:border-gold/50 transition-all group">
              <div className="size-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl">verified</span>
              </div>
              <h4 className="font-bold text-xl mb-1">Perfect Finder</h4>
              <p className="text-sm text-gray-400">High-precision verification</p>
            </Link>

            <Link to="/draft" className="p-8 bg-slate-800/40 rounded-3xl border border-white/5 hover:border-gold/50 transition-all group">
              <div className="size-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <PenTool size={32} />
              </div>
              <h4 className="font-bold text-xl mb-1">Auto-Drafter</h4>
              <p className="text-sm text-gray-400">Generate legal templates</p>
            </Link>

            <Link to="/strength" className="p-8 bg-slate-800/40 rounded-3xl border border-white/5 hover:border-gold/50 transition-all group">
              <div className="size-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
                <BarChart2 size={32} />
              </div>
              <h4 className="font-bold text-xl mb-1">Case Strength</h4>
              <p className="text-sm text-gray-400">Analyze winning probability</p>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
