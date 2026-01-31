import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiClient } from '../api/client';

export default function Homepage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploading(true);
      try {
        await apiClient.uploadFile(file);
        navigate('/dashboard');
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed. Please ensure the backend is running.');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 overflow-x-hidden text-white font-display">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 glass-header px-6 md:px-20 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="NyayNeti Logo" className="h-12 w-auto object-contain" />
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-10">
          <Link className="text-sm font-medium hover:text-accent-gold transition-colors" to="/dashboard">
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="bg-accent-gold text-primary text-sm font-bold px-5 py-2 rounded-lg hover:bg-white transition-all disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 min-h-screen flex items-center justify-center hero-gradient">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block mb-8"
            >
              <img src="/logo.png" alt="NyayNeti Logo" className="h-64 md:h-[420px] mx-auto object-contain" />
            </motion.div>

            {/* Title */}
            <h1 className="text-6xl md:text-8xl font-bold mb-4 tracking-tight">
              <span className="text-gold font-devanagari">न्याय-नीति</span>
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              NyayNeti
            </h2>

            {/* Tagline */}
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Sovereignty-focused intelligence platform for the Indian Judiciary.
              <br />
              Process complex judgments locally with zero data leakage.
            </p>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-navy-800/50 rounded-full border border-gold/20 mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold tracking-widest uppercase">OFFLINE • ON-DEVICE • NO CLOUD</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUploadClick}
                disabled={uploading}
                className="px-8 py-4 bg-gradient-to-r from-gold to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-gold/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">{uploading ? 'sync' : 'upload_file'}</span>
                {uploading ? 'Processing...' : 'Upload Judgment PDF'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-navy-800 text-white font-bold rounded-xl border border-gold/20 hover:bg-navy-700 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">account_balance</span>
                See How It Works
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Cards */}
      <section className="py-24 bg-navy-800/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            The Problem with Conventional Systems
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "description",
                title: "Unstructured PDFs",
                desc: "Judicial records trapped in non-searchable, multi-layered PDFs that traditional AI fails to parse accurately.",
                delay: 0
              },
              {
                icon: "cloud_off",
                title: "Cloud Dependency",
                desc: "Sensitive case data should never leave sovereign machines. NyayNeti eliminates the risk of cloud-based data harvesting.",
                delay: 0.2
              },
              {
                icon: "signal_disconnected",
                title: "Access Gaps",
                desc: "Inconsistent connectivity shouldn't hinder justice. Our intelligence engine works in 100% air-gapped environments.",
                delay: 0.4
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay }}
                className="bg-navy-900 p-8 rounded-2xl border border-white/5 hover:border-gold/40 transition-all group"
              >
                <div className="size-16 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-6 group-hover:bg-gold group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-4xl">{item.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gold mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            The NyayNeti Workflow
          </h2>

          <div className="flex items-center justify-center gap-12 flex-wrap">
            {[
              { num: "1", title: "Local Ingestion", icon: "input" },
              { num: "2", title: "Private Processing", icon: "memory" },
              { num: "3", title: "Semantic Mapping", icon: "account_tree" },
              { num: "4", title: "On-Device Insight", icon: "insights" }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center relative group"
              >
                <div className="w-28 h-28 bg-gold/5 rounded-full flex items-center justify-center mb-6 mx-auto border-2 border-gold/30 group-hover:border-gold group-hover:bg-gold/10 transition-all">
                  <span className="material-symbols-outlined text-4xl text-gold">{step.icon}</span>
                </div>
                <div className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-widest">Step {step.num}</div>
                <div className="font-bold text-lg">{step.title}</div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-10 -right-10 text-gold/30 text-3xl">→</div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center mt-20 gap-6">
            <div className="bg-navy-800 p-8 rounded-2xl border border-gold/20 text-center flex-1 max-w-xs">
              <div className="text-5xl font-black text-gold mb-2">100%</div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">OFFLINE PROCESSING</div>
            </div>
            <div className="bg-navy-800 p-8 rounded-2xl border border-gold/20 text-center flex-1 max-w-xs">
              <div className="text-5xl font-black text-gold mb-2">0 KB</div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">CLOUD DATA STORAGE</div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Features */}
      <section className="py-24 bg-navy-800/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            🚀 Coming Soon
          </h2>
          <p className="text-center text-gray-400 mb-16">
            Future features in development
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: "public",
                title: "International Market Expansion",
                desc: "Support for US, UK, EU legal systems. Multi-jurisdiction precedent analysis.",
                status: "Q2 2026"
              },
              {
                icon: "mic",
                title: "Voice Query Interface",
                desc: "Natural language voice commands in Hindi & English. Perfect for courtroom use.",
                status: "Q3 2026"
              },
              {
                icon: "auto_graph",
                title: "Citation Network Graph",
                desc: "Visual mapping of case law relationships and precedent chains.",
                status: "Q2 2026"
              },
              {
                icon: "document_scanner",
                title: "OCR for Scanned Judgments",
                desc: "Process image-based PDFs from lower courts with high accuracy.",
                status: "Q3 2026"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-navy-900/50 p-8 rounded-2xl border border-white/5 hover:border-gold/30 transition-all group"
              >
                <div className="flex items-start gap-6">
                  <div className="size-14 rounded-xl bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-primary transition-colors shrink-0">
                    <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <span className="text-[10px] px-3 py-1 bg-gold/20 text-gold rounded-full font-black uppercase tracking-widest">
                        {feature.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-gold/5 to-navy-900"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-8 max-w-3xl mx-auto leading-tight">
              Ready to Experience Sovereign Legal Intelligence?
            </h2>
            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className="px-12 py-5 bg-gradient-to-r from-gold to-orange-600 text-white text-xl font-black rounded-2xl shadow-2xl hover:shadow-gold/50 transition-all hover:scale-105 flex items-center gap-3 mx-auto disabled:opacity-50"
            >
              <span className="material-symbols-outlined">rocket_launch</span>
              {uploading ? 'Processing...' : 'Get Started Now →'}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-20 border-t border-white/5 bg-navy-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">
                <span className="text-gold">न्याय-नीति</span>
                <span className="ml-1">NyayNeti</span>
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Professional legal intelligence for Indian judicial officers.
            </p>
          </div>
          <div className="flex gap-8 text-sm text-gray-400">
            <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-white transition-colors" href="#">Sovereignty Guide</a>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Developed by</p>
            <p className="text-sm font-medium text-white italic">We Had No Third</p>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-white/5 text-[10px] text-gray-600 uppercase tracking-tighter">
          © 2024 NyayNeti Intelligence Systems. All Rights Reserved. Not for public consumer use.
        </div>
      </footer>
    </div>
  );
}
