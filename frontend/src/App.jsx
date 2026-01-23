import React, { useState } from 'react';
import Header from './components/Header.jsx';
import UploadZone from './components/UploadZone.jsx';
import SearchBar from './components/SearchBar.jsx';
import ResultCard from './components/ResultCard.jsx';
import PDFViewer from './components/PDFViewer.jsx';
import Loading from './components/Loading.jsx';
import { askQuestion } from './services/api.js';

function App() {
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [citations, setCitations] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [contextSnippets, setContextSnippets] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUploaded = (info) => {
    setSelectedPdf(info.filename);
    setCitations(info.citations || []);
  };

  const handleSearch = async (question) => {
    setLoading(true);
    setAnswer(null);
    try {
      const res = await askQuestion(question);
      setAnswer(res.answer);
      setContextSnippets(res.context_snippets || []);
    } catch (e) {
      setAnswer('Error talking to backend. Ensure Flask server is running on port 8000.');
      setContextSnippets([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 pb-8 space-y-6">
        <UploadZone onUploaded={handleUploaded} />
        <SearchBar onSearch={handleSearch} />

        {loading && <Loading />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <PDFViewer filename={selectedPdf} />
          <ResultCard answer={answer} citations={citations} contextSnippets={contextSnippets} />
        </div>
      </main>
      <footer className="border-t border-slate-800 py-3 text-xs text-slate-400 text-center">
        Built for HackShastra – SnowHack IPEC · NyayNeti MVP · Offline Legal Research for Indian Law
      </footer>
    </div>
  );
}

export default App;

