import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import ResultDisplay from './components/ResultDisplay';
import AtsSimulator from './components/AtsSimulator';
import CandidateSearch from './components/CandidateSearch';
import DeveloperPortal from './components/DeveloperPortal';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';

function HomePage({ darkMode, setDarkMode }) {
  const [resultData, setResultData] = useState(null);

  return (
    <>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Hero onUploadSuccess={setResultData} />
      <ResultDisplay data={resultData} />
      <Features />
      <HowItWorks />
      <AtsSimulator />
      <CandidateSearch />
      <Footer />
    </>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className={`min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300`}>
        <Routes>
          <Route
            path="/"
            element={<HomePage darkMode={darkMode} setDarkMode={setDarkMode} />}
          />
          <Route
            path="/admin"
            element={
              <>
                <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                <div className="pt-20">
                  <AdminDashboard />
                </div>
                <Footer />
              </>
            }
          />
          <Route
            path="/developers"
            element={
              <>
                <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                <div className="pt-20">
                  <DeveloperPortal />
                </div>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
