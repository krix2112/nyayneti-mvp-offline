import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, CloudOff, Users, Upload, Cpu, Network, TrendingUp, Rocket, Globe, Mic, ScanLine, GitBranch, Sparkles, Zap, Shield, Brain } from 'lucide-react';
import { apiClient } from '../api/client';

export default function Homepage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    <div className="min-h-screen bg-slate-950 overflow-x-hidden text-white relative">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>

      {/* Gradient Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Mouse Follow Glow */}
      <div
        className="fixed w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-300"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      ></div>

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
        </nav>
        <button
          onClick={handleUploadClick}
          disabled={uploading}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-950 text-sm font-bold px-6 py-2.5 rounded-lg hover:shadow-lg hover:shadow-yellow-500/50 transition-all relative overflow-hidden group"
        >
          <span className="relative z-10">{uploading ? 'Processing...' : 'Upload PDF'}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 flex flex-col items-center justify-center text-center min-h-[85vh]">
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-500/30 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                x: [null, Math.random() * window.innerWidth],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto px-4 relative z-10"
        >
          {/* Logo/Brand */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="relative inline-block">
              <img src="/logo.png" alt="NyayNeti Logo" className="h-[300px] md:h-[400px] mb-8 object-contain mx-auto relative z-10" />
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 bg-yellow-500/20 blur-3xl"></div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-4 text-yellow-600/90 relative" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
              न्याय-नीति
              <Sparkles className="absolute -top-4 -right-12 text-yellow-500 animate-pulse" size={32} />
            </h1>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Sovereignty-focused intelligence platform for the Indian Judiciary.
          </motion.p>
          <motion.p
            className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Process complex judgments locally with zero data leakage.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-3 text-sm text-green-400 mb-10 bg-green-500/10 border border-green-500/30 rounded-full px-6 py-3 inline-flex"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-mono font-semibold">OFFLINE • ON-DEVICE • NO CLOUD</span>
            <Shield size={18} />
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-950 font-bold px-10 py-4 rounded-xl hover:shadow-2xl hover:shadow-yellow-500/50 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <Upload size={20} className="relative z-10" />
              <span className="relative z-10">{uploading ? 'Processing...' : 'Upload Judgment PDF'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <Link
              to="/dashboard"
              className="border-2 border-yellow-500/50 text-yellow-500 font-bold px-10 py-4 rounded-xl hover:bg-yellow-500/10 hover:border-yellow-500 transition-all flex items-center justify-center gap-3 backdrop-blur-sm"
            >
              <TrendingUp size={20} />
              See How It Works
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-slate-900/50 backdrop-blur-sm border-y border-yellow-500/20">
        <div className="container mx-auto px-6 md:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl font-black text-yellow-500 mb-2">100%</div>
              <div className="text-sm text-gray-400">Offline Processing</div>
            </motion.div>
            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl font-black text-yellow-500 mb-2">0</div>
              <div className="text-sm text-gray-400">Cloud Dependencies</div>
            </motion.div>
            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl font-black text-yellow-500 mb-2">∞</div>
              <div className="text-sm text-gray-400">Data Sovereignty</div>
            </motion.div>
            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl font-black text-yellow-500 mb-2">AI</div>
              <div className="text-sm text-gray-400">Powered Intelligence</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-16 bg-slate-950 relative">
        <div className="container mx-auto px-6 md:px-20">
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-center mb-12 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            The Problem with Conventional Systems
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: "Unstructured PDFs", desc: "Judicial records trapped in non-searchable, multi-layered PDFs that traditional AI fails to parse accurately.", color: "yellow" },
              { icon: CloudOff, title: "Cloud Dependency", desc: "Sensitive case data should never leave sovereign machines. NyayNeti eliminates the risk of cloud-based data harvesting.", color: "orange" },
              { icon: Users, title: "Access Gaps", desc: "Inconsistent connectivity shouldn't hinder justice. Our intelligence engine works in 100% air-gapped environments.", color: "yellow" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(234, 179, 8, 0.2)" }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-lg p-8 rounded-2xl border border-yellow-500/20 hover:border-yellow-500/50 transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-all"></div>
                <item.icon className={`text-${item.color}-500 mb-6 relative z-10`} size={48} />
                <h3 className="text-2xl font-bold mb-4 text-yellow-500 relative z-10">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed relative z-10">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The NyayNeti Workflow */}
      <section className="py-16 bg-slate-900/50 relative overflow-hidden">
        {/* Connecting Lines Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#eab308" stopOpacity="0" />
                <stop offset="50%" stopColor="#eab308" stopOpacity="1" />
                <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="url(#lineGradient)" strokeWidth="2" />
          </svg>
        </div>

        <div className="container mx-auto px-6 md:px-20 relative z-10">
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-center mb-16 text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            The NyayNeti Workflow
          </motion.h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Upload, step: 1, title: "Local Ingestion", desc: "Upload PDFs directly to your machine", color: "from-yellow-500 to-orange-500" },
              { icon: Cpu, step: 2, title: "Private Processing", desc: "AI models run entirely offline", color: "from-orange-500 to-yellow-500" },
              { icon: Network, step: 3, title: "Semantic Mapping", desc: "Build citation networks locally", color: "from-yellow-500 to-orange-500" },
              { icon: TrendingUp, step: 4, title: "On-Device Insight", desc: "Instant analysis without internet", color: "from-orange-500 to-yellow-500" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                whileHover={{ scale: 1.05 }}
                className="text-center relative"
              >
                <div className={`w-24 h-24 mx-auto mb-6 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 relative overflow-hidden group`}>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <item.icon className="text-slate-950 relative z-10" size={40} />
                </div>
                <div className="text-xs text-yellow-500 font-mono mb-2 font-bold">STEP {item.step}</div>
                <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>

                {/* Connecting Arrow */}
                {idx < 3 && (
                  <div className="hidden md:block absolute top-12 -right-3 text-yellow-500/30">
                    <Zap size={24} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-16 bg-slate-950 relative">
        <div className="container mx-auto px-6 md:px-20">
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-block"
            >
              <Rocket className="text-yellow-500 mx-auto mb-4" size={56} />
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Coming Soon</h2>
            <p className="text-gray-400">Future features in development</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            {[
              { icon: Globe, title: "International Market Expansion", badge: "Q3 2026", badgeColor: "yellow", desc: "Support for US, UK, EU legal systems. Multi-jurisdiction precedent analysis." },
              { icon: Mic, title: "Voice Query Interface", badge: "IN BETA", badgeColor: "green", desc: "Natural language voice commands in Hindi & English. Perfect for courtroom use." },
              { icon: GitBranch, title: "Citation Network Graph", badge: "Q2 2026", badgeColor: "yellow", desc: "Visual mapping of case law relationships and precedent chains." },
              { icon: ScanLine, title: "OCR for Scanned Judgments", badge: "Q2 2026", badgeColor: "yellow", desc: "Process image-based PDFs from lower courts with high accuracy." }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-lg p-8 rounded-2xl border border-yellow-500/20 hover:border-yellow-500/50 transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-all"></div>
                <item.icon className="text-yellow-500 mb-4 relative z-10" size={40} />
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <span className={`text-xs bg-${item.badgeColor}-500/20 text-${item.badgeColor}-500 px-3 py-1 rounded-full font-bold border border-${item.badgeColor}-500/30`}>
                    {item.badge}
                  </span>
                </div>
                <p className="text-gray-400 text-sm relative z-10">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 text-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6 relative z-10"
        >
          <Brain className="text-yellow-500 mx-auto mb-6 animate-pulse" size={64} />
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white leading-tight">
            Ready to Experience Sovereign Legal Intelligence?
          </h2>
          <p className="text-xl text-gray-400 mb-10">Join the future of offline AI-powered legal analysis</p>
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-950 font-bold px-14 py-5 rounded-xl text-lg hover:shadow-2xl hover:shadow-yellow-500/50 transition-all inline-flex items-center gap-3 relative overflow-hidden group"
          >
            <Rocket size={24} className="relative z-10" />
            <span className="relative z-10">Get Started Now →</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-950 border-t border-yellow-500/20">
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
