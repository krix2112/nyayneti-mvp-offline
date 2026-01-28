
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import MyResearch from './pages/MyResearch';
import Compare from './pages/Compare';
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
