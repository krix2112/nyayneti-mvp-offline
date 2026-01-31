import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PenTool, BarChart2, Split } from 'lucide-react';

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

        // Use fetch with SSE for progress updates
        const response = await fetch('http://localhost:8000/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.error) {
                  setError(data.status || 'Upload failed');
                  setUploading(false);
                  return;
                }

                setUploadProgress(data.status || 'Processing...');
                setProgressPercent(data.progress || 0);

                if (data.success) {
                  setUploadSuccess(true);
                  setUploadedFile({
                    name: data.filename || file.name,
                    chunks: data.chunks || 0
                  });
                  setUploading(false);
                }
              } catch (err) {
                console.error('Failed to parse progress:', err);
              }
            }
          }
        }

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Upload failed:', error);
        let errorMessage = 'Upload failed. ';

        if (error.message.includes('500')) {
          errorMessage += 'Server error - check backend logs for details.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage += 'Cannot connect to backend. Please ensure the backend server is running on port 8000.';
        } else {
          errorMessage += error.message;
        }

        setError(errorMessage);
        setUploadSuccess(false);
        setUploading(false);
      }
    } else {
      setError('Please select a valid PDF file.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-display">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 glass-header px-6 md:px-20 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="NyayNeti Logo" className="h-12 w-auto object-contain" />
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          <Link className="text-sm font-medium text-gold hover:text-white transition-colors" to="/my-research">
            My Research
          </Link>
          <Link className="text-sm font-medium text-gray-300 hover:text-white transition-colors" to="/compare">
            Compare
          </Link>
        </nav>
      </header>

      {/* Main Upload Section */}
      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gold to-orange-400 bg-clip-text text-transparent">
              Upload Legal Documents
            </h1>
            <p className="text-xl text-gray-300">
              Process PDFs locally with AI-powered analysis
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10 shadow-2xl">
            {!uploadSuccess ? (
              <>
                {/* Upload Area */}
                <div
                  onClick={handleUploadClick}
                  className="border-2 border-dashed border-gold/30 rounded-2xl p-16 text-center cursor-pointer hover:border-gold hover:bg-gold/5 transition-all group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="inline-block mb-6"
                  >
                    <span className="material-symbols-outlined text-8xl text-gold group-hover:text-orange-400 transition-colors">
                      {uploading ? 'sync' : 'upload_file'}
                    </span>
                  </motion.div>

                  <h3 className="text-2xl font-bold mb-2">
                    {uploading ? uploadProgress : 'Click to Upload PDF'}
                  </h3>
                  <p className="text-gray-400">
                    {uploading ? `${progressPercent}% complete` : 'Or drag and drop your PDF file here'}
                  </p>

                  {uploading && (
                    <div className="mt-8 max-w-md mx-auto">
                      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gold to-orange-400"
                          initial={{ width: '0%' }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{uploadProgress}</p>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center"
                  >
                    <span className="material-symbols-outlined text-xl align-middle mr-2">error</span>
                    {error}
                  </motion.div>
                )}

                {/* Info */}
                <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400">check_circle</span>
                    100% Offline
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400">lock</span>
                    Secure Local Processing
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400">speed</span>
                    AI-Powered
                  </div>
                </div>
              </>
            ) : (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="inline-block mb-6">
                  <span className="material-symbols-outlined text-8xl text-green-400">
                    check_circle
                  </span>
                </div>

                <h3 className="text-3xl font-bold mb-2 text-green-400">
                  Upload Successful!
                </h3>
                <p className="text-xl text-gray-300 mb-2">
                  {uploadedFile?.name}
                </p>
                <p className="text-sm text-gray-400 mb-8">
                  Indexed {uploadedFile?.chunks} chunks for analysis
                </p>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setUploadSuccess(false);
                      setUploadedFile(null);
                      setProgressPercent(0);
                    }}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
                  >
                    Upload Another
                  </button>
                  <button
                    onClick={() => navigate('/my-research')}
                    className="px-8 py-3 bg-gradient-to-r from-gold to-orange-600 hover:from-orange-600 hover:to-gold rounded-xl font-bold transition-all"
                  >
                    View My Research →
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Power Features Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/draft"
              className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-gold/50 transition-all group lg:col-span-1"
            >
              <PenTool className="text-4xl text-orange-400 mb-3 block group-hover:scale-110 transition-transform w-10 h-10" />
              <h4 className="font-bold text-base mb-1">Auto-Drafter</h4>
              <p className="text-xs text-gray-400">Generate legal drafts</p>
            </Link>

            <Link
              to="/strength"
              className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-gold/50 transition-all group lg:col-span-1"
            >
              <BarChart2 className="text-4xl text-green-400 mb-3 block group-hover:scale-110 transition-transform w-10 h-10" />
              <h4 className="font-bold text-base mb-1">Strength Analysis</h4>
              <p className="text-xs text-gray-400">Evaluate legal robustness</p>
            </Link>

            <Link
              to="/viewer"
              className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-gold/50 transition-all group lg:col-span-1"
            >
              <Split className="text-4xl text-blue-400 mb-3 block group-hover:scale-110 transition-transform w-10 h-10" />
              <h4 className="font-bold text-base mb-1">Smart Viewer</h4>
              <p className="text-xs text-gray-400">View PDF & AI Chat</p>
            </Link>
          </div>

          {/* Core Tools */}
          <div className="mt-8 grid grid-cols-2 gap-6">
            <Link
              to="/my-research"
              className="p-8 bg-slate-800/40 backdrop-blur-lg rounded-3xl border border-white/5 hover:border-gold/30 transition-all group flex items-center gap-6"
            >
              <div className="size-16 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-4xl text-gold">folder_open</span>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-xl mb-1">My Research</h4>
                <p className="text-sm text-gray-400">Global document repository</p>
              </div>
            </Link>

            <Link
              to="/compare"
              className="p-8 bg-slate-800/40 backdrop-blur-lg rounded-3xl border border-white/5 hover:border-gold/30 transition-all group flex items-center gap-6"
            >
              <div className="size-16 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-4xl text-orange-400">compare_arrows</span>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-xl mb-1">Cross Comparison</h4>
                <p className="text-sm text-gray-400">Analyze multiple documents</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
