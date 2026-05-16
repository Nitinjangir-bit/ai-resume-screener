// frontend/src/App.js
// REPLACE your existing App.js with this entire file

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import ManageJobs from './pages/ManageJobs';
import ScreeningResults from './pages/ScreeningResults';

const NAV_LINKS = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/upload', label: 'Upload Resume', icon: '📄' },
  { path: '/jobs', label: 'Manage Jobs', icon: '💼' },
  { path: '/results', label: 'AI Results', icon: '🎯' },
];

function NavBar({ darkMode, setDarkMode }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled
        ? (darkMode ? 'rgba(10,15,30,0.97)' : 'rgba(255,255,255,0.97)')
        : (darkMode ? 'rgba(10,15,30,0.85)' : 'rgba(255,255,255,0.85)'),
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${darkMode ? 'rgba(99,179,237,0.15)' : 'rgba(26,35,126,0.1)'}`,
      boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.15)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '68px',
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: 38, height: 38, borderRadius: '10px',
          background: 'linear-gradient(135deg, #1a237e, #3949ab)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', boxShadow: '0 4px 15px rgba(26,35,126,0.4)'
        }}>🤖</div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1rem',
            color: darkMode ? '#fff' : '#1a237e', letterSpacing: '-0.3px', lineHeight: 1 }}>
            RecruitAI
          </div>
          <div style={{ fontSize: '0.65rem', color: darkMode ? '#63b3ed' : '#3949ab',
            fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Resume Screener
          </div>
        </div>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {NAV_LINKS.map(link => {
          const active = location.pathname === link.path;
          return (
            <Link key={link.path} to={link.path} style={{
              textDecoration: 'none', padding: '8px 14px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem',
              fontWeight: active ? 700 : 500, transition: 'all 0.2s ease',
              background: active
                ? (darkMode ? 'rgba(99,179,237,0.15)' : 'rgba(26,35,126,0.08)')
                : 'transparent',
              color: active
                ? (darkMode ? '#63b3ed' : '#1a237e')
                : (darkMode ? '#a0aec0' : '#666'),
              border: active
                ? `1px solid ${darkMode ? 'rgba(99,179,237,0.3)' : 'rgba(26,35,126,0.2)'}`
                : '1px solid transparent',
            }}>
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Dark mode toggle */}
      <button onClick={() => setDarkMode(!darkMode)} style={{
        background: darkMode ? 'rgba(99,179,237,0.15)' : 'rgba(26,35,126,0.08)',
        border: `1px solid ${darkMode ? 'rgba(99,179,237,0.3)' : 'rgba(26,35,126,0.2)'}`,
        borderRadius: '10px', padding: '8px 14px', cursor: 'pointer',
        fontSize: '1.1rem', transition: 'all 0.2s ease',
        display: 'flex', alignItems: 'center', gap: '6px',
        color: darkMode ? '#63b3ed' : '#1a237e', fontWeight: 600, fontSize: '0.82rem'
      }}>
        {darkMode ? '☀️ Light' : '🌙 Dark'}
      </button>
    </nav>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.style.background = darkMode ? '#0a0f1e' : '#f0f4ff';
    document.body.style.transition = 'background 0.3s ease';
  }, [darkMode]);

  // Inject Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  return (
    <Router>
      <div style={{
        minHeight: '100vh', fontFamily: "'DM Sans', sans-serif",
        color: darkMode ? '#e2e8f0' : '#1a202c',
        background: darkMode
          ? 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 50%, #0a1628 100%)'
          : 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f5f0ff 100%)',
        transition: 'all 0.3s ease',
      }}>
        <NavBar darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Main content */}
        <div style={{ paddingTop: '88px', minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<Dashboard darkMode={darkMode} />} />
            <Route path="/upload" element={<UploadResume darkMode={darkMode} />} />
            <Route path="/jobs" element={<ManageJobs darkMode={darkMode} />} />
            <Route path="/results" element={<ScreeningResults darkMode={darkMode} />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer style={{
          textAlign: 'center', padding: '2rem',
          color: darkMode ? '#4a5568' : '#9ca3af', fontSize: '0.8rem',
          borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
        }}>
          🤖 RecruitAI — AI-Powered Resume Screener | Final Year Project | Built with React + Flask + NLP
        </footer>

        <ToastContainer
          position="bottom-right" autoClose={3000}
          theme={darkMode ? 'dark' : 'light'}
          toastStyle={{ borderRadius: '12px', fontFamily: "'DM Sans', sans-serif" }}
        />
      </div>
    </Router>
  );
}