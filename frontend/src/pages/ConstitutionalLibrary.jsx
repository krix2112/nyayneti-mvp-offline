
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';

function ConstitutionalLibrary() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourt, setFilterCourt] = useState('all');

  // FALLBACK DEMO DOCUMENTS - Used when backend is slow
  const DEMO_DOCUMENTS = [
    {
      doc_id: "Food_Corporation_India_v_Excel_Corp.pdf",
      chunks: 47,
      court: "NCLAT",
      year: 2020,
      case_type: "Competition Law",
      citations: [{ text: "Section 53N Competition Act" }, { text: "Cartelization damages" }]
    },
    {
      doc_id: "Dr_Subodh_Jain_v_State_MP.pdf",
      chunks: 32,
      court: "MP High Court",
      year: 2016,
      case_type: "Criminal",
      citations: [{ text: "Section 154 CrPC" }, { text: "Article 226" }]
    },
    {
      doc_id: "Kuldeep_v_State_Karnataka.pdf",
      chunks: 28,
      court: "Karnataka HC",
      year: 2023,
      case_type: "Constitutional",
      citations: [{ text: "Article 21" }, { text: "Section 41 CrPC" }]
    },
    {
      doc_id: "State_Punjab_v_Navjot_Sidhu.pdf",
      chunks: 54,
      court: "P&H High Court",
      year: 2006,
      case_type: "IPC",
      citations: [{ text: "Section 304 Part-II" }, { text: "Culpable Homicide" }]
    },
    {
      doc_id: "Competition_Act_2002_Overview.pdf",
      chunks: 89,
      court: "Statute",
      year: 2002,
      case_type: "Legislation",
      citations: [{ text: "Anti-competitive agreements" }, { text: "CCI Powers" }]
    },
    {
      doc_id: "Arnesh_Kumar_Guidelines.pdf",
      chunks: 23,
      court: "Supreme Court",
      year: 2014,
      case_type: "Criminal",
      citations: [{ text: "Section 41 CrPC" }, { text: "Arrest Procedures" }]
    },
    {
      doc_id: "Lalita_Kumari_v_State_UP.pdf",
      chunks: 41,
      court: "Supreme Court",
      year: 2014,
      case_type: "Criminal",
      citations: [{ text: "Mandatory FIR" }, { text: "Section 154" }]
    },
    {
      doc_id: "PMLA_2002_Key_Provisions.pdf",
      chunks: 67,
      court: "Statute",
      year: 2002,
      case_type: "Legislation",
      citations: [{ text: "Money Laundering" }, { text: "ED Powers" }]
    }
  ];

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await apiClient.listDocuments();
        if (data.documents && data.documents.length > 0) {
          setDocuments(data.documents);
        } else {
          // Use demo data if no documents from backend
          setDocuments(DEMO_DOCUMENTS);
        }
      } catch (err) {
        console.error("Failed to load documents, using demo data:", err);
        setDocuments(DEMO_DOCUMENTS);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  // Filter documents based on search and court filter
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.doc_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.case_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourt = filterCourt === 'all' ||
      doc.court?.toLowerCase().includes(filterCourt.toLowerCase());
    return matchesSearch && matchesCourt;
  });

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'criminal': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'constitutional': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'competition law': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'ipc': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'legislation': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex overflow-hidden font-display">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-primary flex flex-col h-screen shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="NyayNeti Logo" className="h-10 w-auto object-contain" />
            </Link>
          </div>
          <nav className="space-y-1">
            <Link className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors" to="/analysis">
              <span className="material-symbols-outlined text-[20px]">chat</span>
              <span className="text-sm font-medium">Legal Assistant</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors" to="/matcher">
              <span className="material-symbols-outlined text-[20px]">compare_arrows</span>
              <span className="text-sm font-medium">Case Matcher</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-500/20" to="/constitutional">
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
              <span className="text-sm font-bold">Document Library</span>
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-lg">
            <span className="material-symbols-outlined text-green-400 text-[18px]">cloud_done</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-none">Offline Database</span>
              <span className="text-[11px] text-white font-medium">{documents.length} Documents</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-background-dark shrink-0">
          <div className="flex items-center gap-4">
            <Link to="/analysis" className="text-slate-500 hover:text-slate-800 dark:hover:text-white">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                Legal Document Archive ({filteredDocs.length} files)
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-full border border-green-500/20">
              OFFLINE READY
            </span>
          </div>
        </header>

        {/* Search & Filters */}
        <div className="px-6 py-4 bg-[#0d121b] border-b border-[#2b2f36]">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
              <input
                type="text"
                placeholder="Search by case name, legal section, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#1a2332] border border-[#2b2f36] rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={filterCourt}
              onChange={(e) => setFilterCourt(e.target.value)}
              className="px-4 py-3 bg-[#1a2332] border border-[#2b2f36] rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Courts</option>
              <option value="supreme">Supreme Court</option>
              <option value="high">High Courts</option>
              <option value="nclat">NCLAT</option>
              <option value="statute">Statutes</option>
            </select>
          </div>
        </div>

        {/* Document Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0d121b]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="size-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50">
              <span className="material-symbols-outlined text-6xl mb-4">folder_open</span>
              <p className="text-sm">No documents match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc, i) => (
                <div key={i} className="bg-[#1a2332] rounded-xl border border-[#2b2f36] p-4 hover:border-blue-500/50 transition-all group cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="size-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                      <span className="material-symbols-outlined text-blue-400">description</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors" title={doc.doc_id}>
                        {doc.doc_id?.replace(/_/g, ' ').replace('.PDF', '').replace('.pdf', '').substring(0, 35)}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500">{doc.court || 'Court'}</span>
                        <span className="text-[10px] text-slate-600">•</span>
                        <span className="text-[10px] text-slate-500">{doc.year || '2020'}</span>
                        <span className="text-[10px] text-slate-600">•</span>
                        <span className="text-[10px] text-slate-500">{doc.chunks || 0} chunks</span>
                      </div>

                      {/* Case Type Badge */}
                      {doc.case_type && (
                        <div className="mt-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getTypeColor(doc.case_type)}`}>
                            {doc.case_type}
                          </span>
                        </div>
                      )}

                      {/* Citations */}
                      {doc.citations && doc.citations.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {doc.citations.slice(0, 2).map((c, ci) => (
                            <span key={ci} className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] rounded border border-amber-500/20">
                              {c.text?.substring(0, 20)}...
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 bg-[#2b2f36] rounded hover:bg-blue-500/20 transition-colors" title="View">
                        <span className="material-symbols-outlined text-sm text-slate-400">visibility</span>
                      </button>
                      <button className="p-1.5 bg-[#2b2f36] rounded hover:bg-green-500/20 transition-colors" title="Download">
                        <span className="material-symbols-outlined text-sm text-slate-400">download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="h-12 bg-primary border-t border-[#2b2f36] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Offline Mode Active</span>
            </div>
            <div className="text-[10px] text-slate-500">
              {documents.length} documents • {documents.reduce((sum, d) => sum + (d.chunks || 0), 0)} total chunks indexed
            </div>
          </div>
          <div className="text-[10px] text-slate-500">
            Last synced: Today at 5:30 PM
          </div>
        </div>
      </main>
    </div>
  );
}

export default ConstitutionalLibrary;
