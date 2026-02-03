
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import MyResearch from './pages/MyResearch';
import Compare from './pages/Compare';
import DocumentDrafter from './pages/DocumentDrafter';
import StrengthAnalyzer from './pages/StrengthAnalyzer';
import SmartViewer from './pages/SmartViewer';
import CitationFinder from './pages/CitationFinder';
import StandaloneCitationFinder from './pages/StandaloneCitationFinder';
import PerfectCitationFinder from './pages/PerfectCitationFinder';
import StatusBar from './components/StatusBar';
import { useKeyboardShortcuts, ShortcutsHint } from './hooks/useKeyboardShortcuts.jsx';

function AppContent() {
  // Enable global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-research" element={<MyResearch />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/draft" element={<DocumentDrafter />} />
        <Route path="/strength" element={<StrengthAnalyzer />} />
        <Route path="/viewer" element={<SmartViewer />} />
        <Route path="/citation-finder" element={<CitationFinder />} />
        <Route path="/standalone-citation-finder" element={<StandaloneCitationFinder />} />
        <Route path="/perfect-citation-finder" element={<PerfectCitationFinder />} />
      </Routes>

      <StatusBar />
      <ShortcutsHint />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
