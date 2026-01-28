import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

function MyResearch() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const resp = await apiClient.listDocuments();
      setDocuments(resp.documents || []);
    } catch (e) {
      console.error('Failed to load documents:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc =>
    doc.doc_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-display">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 glass-header px-6 md:px-20 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="NyayNeti Logo" className="h-12 w-auto object-contain" />
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          <Link className="text-sm font-medium text-gray-300 hover:text-white transition-colors" to="/dashboard">
            Upload
          </Link>
          <Link className="text-sm font-medium text-gold hover:text-white transition-colors" to="/my-research">
            My Research
          </Link>
          <Link className="text-sm font-medium text-gray-300 hover:text-white transition-colors" to="/compare">
            Compare
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gold to-orange-400 bg-clip-text text-transparent">
            My Research
          </h1>
          <p className="text-xl text-gray-300">
            All your uploaded legal documents in one place
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-400">description</span>
              </div>
              <div>
                <p className="text-3xl font-bold">{documents.length}</p>
                <p className="text-sm text-gray-400">Total Documents</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-green-400">check_circle</span>
              </div>
              <div>
                <p className="text-3xl font-bold">{documents.reduce((sum, doc) => sum + (doc.chunks || 0), 0)}</p>
                <p className="text-sm text-gray-400">Total Chunks Indexed</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-400">offline_bolt</span>
              </div>
              <div>
                <p className="text-3xl font-bold">100%</p>
                <p className="text-sm text-gray-400">Offline Processing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-gold/50 transition-all"
            />
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="size-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-8xl text-gray-600 mb-4 block">
              folder_open
            </span>
            <h3 className="text-2xl font-bold mb-2">No Documents Found</h3>
            <p className="text-gray-400 mb-8">
              {searchQuery ? 'Try a different search term' : 'Upload your first PDF to get started'}
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-gold to-orange-600 rounded-xl font-bold hover:from-orange-600 hover:to-gold transition-all"
            >
              <span className="material-symbols-outlined">upload_file</span>
              Upload PDF
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-gold/50 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="size-12 bg-gold/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-gold text-2xl">description</span>
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold">
                    INDEXED
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                  {doc.doc_id.replace('.pdf', '').replace(/_/g, ' ')}
                </h3>

                <p className="text-sm text-gray-400 mb-4">
                  {doc.chunks || 0} chunks indexed
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/compare?selected=${encodeURIComponent(doc.doc_id)}`)}
                    className="flex-1 px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">compare_arrows</span>
                    Compare
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyResearch;
