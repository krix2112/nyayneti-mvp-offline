import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import PrecedentExplorer from './pages/PrecedentExplorer';
import ConstitutionalLibrary from './pages/ConstitutionalLibrary';
import GeneralDashboard from './pages/GeneralDashboard';
import MyResearch from './pages/MyResearch';
import ResearchBoundaries from './pages/ResearchBoundaries';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/dashboard" element={<GeneralDashboard />} />
        <Route path="/analysis" element={<Dashboard />} />
        <Route path="/precedents" element={<PrecedentExplorer />} />
        <Route path="/constitutional" element={<ConstitutionalLibrary />} />
        <Route path="/research" element={<MyResearch />} />
        <Route path="/boundaries" element={<ResearchBoundaries />} />
      </Routes>
    </Router>
  );
}

export default App;
