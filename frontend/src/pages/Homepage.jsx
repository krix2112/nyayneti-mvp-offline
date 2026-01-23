import React from 'react';
import { Link } from 'react-router-dom';

function Homepage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-white">
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
          <button className="bg-accent-gold text-primary text-sm font-bold px-5 py-2 rounded-lg hover:bg-white transition-all">
            Upload PDF
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient min-h-[85vh] flex items-center justify-center px-6 md:px-20 py-20">
        <div className="max-w-4xl text-center flex flex-col items-center">
          <img src="/logo.png" alt="NyayNeti Logo" className="h-32 md:h-48 w-auto object-contain mb-8 hover:scale-105 transition-transform duration-500" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold/30 bg-accent-gold/10 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent-gold opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-gold" />
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-accent-gold">
              Offline • On-Device • No Cloud
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
            Offline Legal Intelligence <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-white">
              for India
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
            Sovereignty-focused intelligence platform for the Indian Judiciary. Process complex
            judgments locally with zero data leakage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button className="bg-accent-gold text-primary h-14 px-8 rounded-lg font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">upload_file</span>
              Upload Judgment PDF
            </button>
            <Link to="/dashboard" className="border border-white/20 bg-white/5 backdrop-blur-md h-14 px-8 rounded-lg font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">account_balance</span>
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Snapshot */}
      <section className="py-24 px-6 md:px-20 bg-primary">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4 border-l-4 border-accent-gold pl-6">
              The Problem with Conventional Systems
            </h2>
            <p className="text-gray-400 max-w-xl pl-7">
              Current digital tools often compromise judicial confidentiality or fail in environments
              with intermittent connectivity.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-8 rounded-xl bg-card-dark border border-white/5 hover:border-accent-gold/40 transition-all">
              <div className="size-12 rounded-lg bg-accent-gold/10 flex items-center justify-center text-accent-gold mb-6 group-hover:bg-accent-gold group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-3xl">description</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Unstructured PDFs</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Most judicial records are trapped in non-searchable, multi-layered PDFs that
                traditional AI fails to parse accurately.
              </p>
            </div>
            <div className="group p-8 rounded-xl bg-card-dark border border-white/5 hover:border-accent-gold/40 transition-all">
              <div className="size-12 rounded-lg bg-accent-gold/10 flex items-center justify-center text-accent-gold mb-6 group-hover:bg-accent-gold group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-3xl">cloud_off</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Cloud Dependency</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Sensitive case data should never leave sovereign machines. NyayNeti eliminates the
                risk of cloud-based data harvesting.
              </p>
            </div>
            <div className="group p-8 rounded-xl bg-card-dark border border-white/5 hover:border-accent-gold/40 transition-all">
              <div className="size-12 rounded-lg bg-accent-gold/10 flex items-center justify-center text-accent-gold mb-6 group-hover:bg-accent-gold group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-3xl">signal_disconnected</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Access Gaps</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Inconsistent connectivity shouldn&apos;t hinder justice. Our intelligence engine
                works in 100% air-gapped environments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Flow */}
      <section className="py-24 px-6 md:px-20 bg-background-dark/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The NyayNeti Workflow</h2>
            <div className="h-1 w-20 bg-accent-gold mx-auto" />
          </div>
          <div className="relative flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-accent-gold/30 to-transparent -z-10" />

            <div className="flex-1 flex flex-col items-center text-center">
              <div className="size-20 rounded-full bg-primary border-2 border-accent-gold flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl text-accent-gold">input</span>
              </div>
              <h4 className="font-bold mb-2">1. Local Ingestion</h4>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                Data Stays On-Device
              </p>
              <p className="text-sm text-gray-400">
                PDFs are processed locally using proprietary OCR optimized for Indian legal fonts.
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center text-center">
              <div className="size-20 rounded-full bg-primary border-2 border-accent-gold flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl text-accent-gold">memory</span>
              </div>
              <h4 className="font-bold mb-2">2. Private Processing</h4>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Neural Engine</p>
              <p className="text-sm text-gray-400">
                On-device LLMs extract entities, citations, and logic without external API calls.
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center text-center">
              <div className="size-20 rounded-full bg-primary border-2 border-accent-gold flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl text-accent-gold">
                  account_tree
                </span>
              </div>
              <h4 className="font-bold mb-2">3. Semantic Mapping</h4>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Relational Graph</p>
              <p className="text-sm text-gray-400">
                Links cases with high-court precedents and central acts automatically.
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center text-center">
              <div className="size-20 rounded-full bg-primary border-2 border-accent-gold flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl text-accent-gold">insights</span>
              </div>
              <h4 className="font-bold mb-2">4. On-Device Insight</h4>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                Decision Support
              </p>
              <p className="text-sm text-gray-400">
                Get summaries, discrepancy alerts, and relevant case law instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-6 md:px-20 border-y border-white/5">
        <div className="max-w-4xl mx-auto bg-card-dark p-12 rounded-2xl border border-accent-gold/20 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">Sovereign by Design</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-accent-gold">verified_user</span>
                <span className="text-sm text-gray-300">
                  End-to-end encryption with local-only decryption keys.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-accent-gold">gavel</span>
                <span className="text-sm text-gray-300">
                  Compliant with the Digital Personal Data Protection Act 2023.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-accent-gold">security</span>
                <span className="text-sm text-gray-300">
                  Hardened for air-gapped systems in sensitive courtrooms.
                </span>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <div className="p-4 rounded-lg bg-primary text-center">
              <div className="text-3xl font-black text-accent-gold mb-1">100%</div>
              <div className="text-[10px] uppercase text-gray-500 font-bold">
                Offline Processing
              </div>
            </div>
            <div className="p-4 rounded-lg bg-primary text-center">
              <div className="text-3xl font-black text-accent-gold mb-1">0 KB</div>
              <div className="text-[10px] uppercase text-gray-500 font-bold">
                Cloud Data Storage
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 md:px-20 border-t border-white/5 bg-primary">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                <span className="hindi-font text-accent-gold">न्याय</span>
                Neti
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Professional legal intelligence for Indian judicial officers.
            </p>
          </div>
          <div className="flex gap-8 text-sm text-gray-400">
            <a className="hover:text-white transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-white transition-colors" href="#">
              Terms of Service
            </a>
            <a className="hover:text-white transition-colors" href="#">
              Sovereignty Guide
            </a>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
              Developed by
            </p>
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

export default Homepage;
