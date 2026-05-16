// frontend/src/pages/Dashboard.js
// REPLACE your existing Dashboard.js with this

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAllCandidates, getAllJobs, getResultsByJob } from '../services/api';

// Animated counter hook
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

function StatCard({ icon, label, value, color, darkMode, delay = 0, suffix = '' }) {
  const animated = useCounter(typeof value === 'number' ? value : 0);
  return (
    <div style={{
      background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(26,35,126,0.1)'}`,
      borderRadius: '20px', padding: '1.8rem',
      backdropFilter: 'blur(20px)',
      boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(26,35,126,0.08)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default', position: 'relative', overflow: 'hidden',
      animation: `fadeSlideUp 0.6s ease ${delay}s both`,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = darkMode ? '0 16px 48px rgba(0,0,0,0.4)' : '0 16px 48px rgba(26,35,126,0.15)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(26,35,126,0.08)'; }}
    >
      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '80px', height: '80px', borderRadius: '50%',
        background: color, opacity: 0.15, filter: 'blur(20px)'
      }} />
      <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{icon}</div>
      <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: "'Syne', sans-serif",
        color: color, lineHeight: 1, marginBottom: '0.4rem' }}>
        {typeof value === 'number' ? animated : value}{suffix}
      </div>
      <div style={{ fontSize: '0.85rem', color: darkMode ? '#718096' : '#9ca3af', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

function QuickAction({ icon, title, desc, to, color, darkMode, delay }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(26,35,126,0.1)'}`,
        borderRadius: '16px', padding: '1.5rem', cursor: 'pointer',
        transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '1rem',
        animation: `fadeSlideUp 0.6s ease ${delay}s both`,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(6px)'; e.currentTarget.style.borderColor = color; e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(26,35,126,0.04)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(26,35,126,0.1)'; e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)'; }}
      >
        <div style={{ width: 48, height: 48, borderRadius: '12px',
          background: color + '22', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px',
            color: darkMode ? '#e2e8f0' : '#1a202c' }}>{title}</div>
          <div style={{ fontSize: '0.8rem', color: darkMode ? '#718096' : '#9ca3af' }}>{desc}</div>
        </div>
        <div style={{ marginLeft: 'auto', color: darkMode ? '#4a5568' : '#cbd5e0', fontSize: '1.2rem' }}>→</div>
      </div>
    </Link>
  );
}

export default function Dashboard({ darkMode }) {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [cRes, jRes] = await Promise.all([getAllCandidates(), getAllJobs()]);
        setCandidates(cRes.data);
        setJobs(jRes.data);
        // Get results for all jobs
        const resultsPromises = jRes.data.map(j => getResultsByJob(j.id).catch(() => ({ data: [] })));
        const allR = await Promise.all(resultsPromises);
        setAllResults(allR.flatMap(r => r.data));
      } catch {}
      finally { setLoading(false); }
    }
    fetchAll();
  }, []);

  // Stats
  const shortlisted = allResults.filter(r => r.recommendation === 'SHORTLIST').length;
  const avgScore = allResults.length
    ? Math.round(allResults.reduce((a, b) => a + (b.overall_score || 0), 0) / allResults.length)
    : 0;

  // Pie chart data
  const pieData = [
    { name: 'Shortlist', value: allResults.filter(r => r.recommendation === 'SHORTLIST').length || 0, color: '#48bb78' },
    { name: 'Review', value: allResults.filter(r => r.recommendation === 'REVIEW').length || 0, color: '#ed8936' },
    { name: 'Reject', value: allResults.filter(r => r.recommendation === 'REJECT').length || 0, color: '#fc8181' },
  ];

  // Area chart — candidates over time (mock wave for visual)
  const areaData = candidates.slice(-7).map((c, i) => ({
    name: `Day ${i + 1}`, candidates: i + 1,
  }));
  if (areaData.length === 0) {
    for (let i = 1; i <= 7; i++) areaData.push({ name: `Day ${i}`, candidates: 0 });
  }

  const card = {
    background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(26,35,126,0.1)'}`,
    borderRadius: '20px', backdropFilter: 'blur(20px)',
    boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(26,35,126,0.08)',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      {/* Hero header */}
      <div style={{ marginBottom: '2.5rem', animation: 'fadeSlideUp 0.5s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#48bb78',
            animation: 'pulse 2s infinite', boxShadow: '0 0 8px #48bb78' }} />
          <span style={{ fontSize: '0.8rem', color: '#48bb78', fontWeight: 600,
            letterSpacing: '1px', textTransform: 'uppercase' }}>Live System Active</span>
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 800, margin: 0, lineHeight: 1.1,
          color: darkMode ? '#ffffff' : '#0f172a' }}>
          AI Recruitment<br />
          <span style={{ background: 'linear-gradient(135deg, #1a237e, #3949ab, #63b3ed)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Intelligence Hub
          </span>
        </h1>
        <p style={{ color: darkMode ? '#718096' : '#9ca3af', marginTop: '0.8rem',
          fontSize: '1rem', fontWeight: 400 }}>
          NLP-powered screening · BERT semantic matching · Real-time candidate ranking
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon="👥" label="Total Candidates" value={candidates.length} color="#63b3ed" darkMode={darkMode} delay={0.1} />
        <StatCard icon="💼" label="Job Openings" value={jobs.length} color="#9f7aea" darkMode={darkMode} delay={0.2} />
        <StatCard icon="✅" label="Shortlisted" value={shortlisted} color="#48bb78" darkMode={darkMode} delay={0.3} />
        <StatCard icon="📊" label="Avg AI Score" value={avgScore} color="#ed8936" darkMode={darkMode} delay={0.4} suffix="%" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {/* Area Chart */}
        <div style={{ ...card, padding: '1.5rem', animation: 'fadeSlideUp 0.6s ease 0.5s both' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.5rem',
            color: darkMode ? '#e2e8f0' : '#1a202c', display: 'flex', justifyContent: 'space-between' }}>
            <span>Candidate Pipeline</span>
            <span style={{ fontSize: '0.75rem', color: darkMode ? '#718096' : '#9ca3af', fontWeight: 400 }}>Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3949ab" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3949ab" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: darkMode ? '#4a5568' : '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: darkMode ? '#1a202c' : '#fff', border: 'none', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
              <Area type="monotone" dataKey="candidates" stroke="#3949ab" strokeWidth={2.5} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{ ...card, padding: '1.5rem', animation: 'fadeSlideUp 0.6s ease 0.6s both' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem',
            color: darkMode ? '#e2e8f0' : '#1a202c' }}>Screening Breakdown</div>
          {allResults.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60}
                    dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '3px', background: d.color, flexShrink: 0 }} />
                    <span style={{ color: darkMode ? '#a0aec0' : '#6b7280', flex: 1 }}>{d.name}</span>
                    <span style={{ fontWeight: 700, color: darkMode ? '#e2e8f0' : '#1a202c' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: darkMode ? '#4a5568' : '#cbd5e0', fontSize: '0.85rem', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '2rem' }}>📭</span>
              <span>Run screening to see data</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ ...card, padding: '1.5rem', animation: 'fadeSlideUp 0.6s ease 0.7s both' }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem',
          color: darkMode ? '#e2e8f0' : '#1a202c' }}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.8rem' }}>
          <QuickAction icon="📄" title="Upload Resumes" desc="Add PDF or DOCX candidate files" to="/upload" color="#63b3ed" darkMode={darkMode} delay={0.8} />
          <QuickAction icon="💼" title="Post a Job" desc="Create job description with skills" to="/jobs" color="#9f7aea" darkMode={darkMode} delay={0.9} />
          <QuickAction icon="🤖" title="Run AI Screening" desc="Rank candidates with NLP engine" to="/results" color="#48bb78" darkMode={darkMode} delay={1.0} />
        </div>
      </div>

      {/* Recent candidates */}
      {candidates.length > 0 && (
        <div style={{ ...card, padding: '1.5rem', marginTop: '1rem', animation: 'fadeSlideUp 0.6s ease 1.1s both' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem',
            color: darkMode ? '#e2e8f0' : '#1a202c' }}>Recent Candidates</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {candidates.slice(0, 5).map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '0.8rem 1rem', borderRadius: '12px',
                background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(26,35,126,0.03)',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,35,126,0.06)'}`,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '10px',
                  background: `linear-gradient(135deg, hsl(${i * 60 + 200}, 70%, 50%), hsl(${i * 60 + 240}, 70%, 60%))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0
                }}>{c.name?.charAt(0) || '?'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: darkMode ? '#e2e8f0' : '#1a202c' }}>{c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: darkMode ? '#718096' : '#9ca3af' }}>{c.education} · {c.experience_years} yrs exp</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: darkMode ? '#4a5568' : '#cbd5e0' }}>
                  {c.skills && `${JSON.parse(c.skills).length} skills`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}