// frontend/src/pages/ScreeningResults.js
// REPLACE your existing ScreeningResults.js

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { getAllJobs, screenBulk, getResultsByJob } from '../services/api';

function ScoreRing({ score, size = 80 }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#48bb78' : score >= 50 ? '#ed8936' : '#fc8181';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
        style={{ transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px` }}
        fill={color} fontSize="14" fontWeight="800" fontFamily="'Syne', sans-serif">
        {score?.toFixed(0)}
      </text>
    </svg>
  );
}

function MiniBar({ label, value, darkMode }) {
  const color = value >= 75 ? '#48bb78' : value >= 50 ? '#ed8936' : '#fc8181';
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.72rem', color: darkMode ? '#718096' : '#9ca3af', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color }}>{value?.toFixed(1)}%</span>
      </div>
      <div style={{ height: 5, borderRadius: '3px', background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
        <div style={{ height: '100%', borderRadius: '3px', background: color,
          width: `${value || 0}%`, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}

export default function ScreeningResults({ darkMode }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [results, setResults] = useState([]);
  const [screening, setScreening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const card = {
    background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(26,35,126,0.1)'}`,
    borderRadius: '20px', backdropFilter: 'blur(20px)',
    boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(26,35,126,0.08)',
  };

  useEffect(() => { getAllJobs().then(r => setJobs(r.data)).catch(() => {}); }, []);

  const handleJobChange = async (jobId) => {
    setSelectedJob(jobId); setResults([]);
    if (!jobId) return;
    setLoading(true);
    try { const res = await getResultsByJob(jobId); setResults(res.data); }
    catch {} finally { setLoading(false); }
  };

  const handleScreenAll = async () => {
    if (!selectedJob) { toast.error('Job select karo pehle!'); return; }
    setScreening(true);
    toast.info('🤖 AI engine running... please wait 30-60s');
    try {
      await screenBulk(selectedJob);
      toast.success('🎉 Screening complete!');
      handleJobChange(selectedJob);
    } catch (err) {
      toast.error('Error: ' + (err.response?.data?.error || 'Unknown'));
    }
    setScreening(false);
  };

  const chartData = results.slice(0, 8).map(r => ({
    name: r.candidate_name?.split(' ')[0] || 'C',
    score: parseFloat(r.overall_score?.toFixed(1) || 0),
  }));

  const recColor = { SHORTLIST: '#48bb78', REVIEW: '#ed8936', REJECT: '#fc8181' };
  const recEmoji = { SHORTLIST: '✅', REVIEW: '🔍', REJECT: '❌' };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem', animation: 'fadeSlideUp 0.5s ease both' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800,
          color: darkMode ? '#fff' : '#0f172a', margin: 0, marginBottom: '0.4rem' }}>
          AI Screening Results
        </h1>
        <p style={{ color: darkMode ? '#718096' : '#9ca3af', margin: 0 }}>
          BERT · TF-IDF · Skill Matching · Experience Scoring
        </p>
      </div>

      {/* Controls */}
      <div style={{ ...card, padding: '1.5rem', marginBottom: '1.5rem', animation: 'fadeSlideUp 0.5s ease 0.1s both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: darkMode ? '#718096' : '#9ca3af',
              textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              Select Job Position
            </label>
            <select value={selectedJob} onChange={e => handleJobChange(e.target.value)} style={{
              width: '100%', padding: '11px 14px', borderRadius: '12px', fontSize: '0.9rem',
              background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(26,35,126,0.04)',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(26,35,126,0.15)'}`,
              color: darkMode ? '#e2e8f0' : '#1a202c', outline: 'none',
              fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
            }}>
              <option value="">-- Choose a job --</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title} — {j.company}</option>)}
            </select>
          </div>
          <div style={{ marginTop: '18px' }}>
            <button onClick={handleScreenAll} disabled={!selectedJob || screening} style={{
              padding: '11px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem',
              background: screening ? '#4a5568' : 'linear-gradient(135deg, #1a237e, #3949ab)',
              color: '#fff', border: 'none', cursor: !selectedJob || screening ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: screening ? 'none' : '0 4px 20px rgba(26,35,126,0.4)',
              display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
              animation: !screening && selectedJob ? 'pulse 2s infinite' : 'none',
            }}>
              {screening
                ? <><span style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent',
                    borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Screening...</>
                : '🤖 Run AI Screening'}
            </button>
          </div>
          {results.length > 0 && (
            <div style={{ marginTop: '18px', display: 'flex', gap: '0.8rem' }}>
              {['SHORTLIST', 'REVIEW', 'REJECT'].map(rec => (
                <div key={rec} style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.4rem', color: recColor[rec] }}>
                    {results.filter(r => r.recommendation === rec).length}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: darkMode ? '#718096' : '#9ca3af',
                    fontWeight: 600, textTransform: 'uppercase' }}>{rec}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      {results.length > 0 && (
        <div style={{ ...card, padding: '1.5rem', marginBottom: '1.5rem', animation: 'fadeSlideUp 0.5s ease 0.2s both' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem',
            color: darkMode ? '#e2e8f0' : '#1a202c' }}>Candidate Score Comparison</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={32}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3949ab" />
                  <stop offset="100%" stopColor="#1a237e" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} />
              <XAxis dataKey="name" tick={{ fill: darkMode ? '#718096' : '#9ca3af', fontSize: 12 }}
                axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: darkMode ? '#718096' : '#9ca3af', fontSize: 11 }}
                axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: darkMode ? '#1a202c' : '#fff', border: 'none',
                  borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                  fontFamily: "'DM Sans', sans-serif" }}
                formatter={v => [`${v}%`, 'Score']} />
              <Bar dataKey="score" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Results cards */}
      {loading && (
        <div style={{ ...card, padding: '3rem', textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #3949ab', borderTopColor: 'transparent',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <div style={{ color: darkMode ? '#718096' : '#9ca3af' }}>Loading results...</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {results.map((r, idx) => {
          const isExpanded = expanded === r.id;
          const matchedSkills = r.matched_skills ? JSON.parse(r.matched_skills) : [];
          const missingSkills = r.missing_skills ? JSON.parse(r.missing_skills) : [];
          const radarData = [
            { subject: 'Skills', value: r.skill_match_score || 0 },
            { subject: 'Semantic', value: r.semantic_similarity_score || 0 },
            { subject: 'Keywords', value: r.keyword_score || 0 },
            { subject: 'Experience', value: r.experience_score || 0 },
          ];
          return (
            <div key={r.id} style={{
              ...card,
              borderLeft: `4px solid ${recColor[r.recommendation] || '#4a5568'}`,
              animation: `fadeSlideUp 0.4s ease ${idx * 0.05}s both`,
              transition: 'box-shadow 0.2s ease',
              overflow: 'hidden',
            }}>
              {/* Main row */}
              <div style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem',
                cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : r.id)}>
                {/* Rank */}
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 800,
                  color: darkMode ? '#2d3748' : '#e5e7eb', width: '32px', flexShrink: 0, textAlign: 'center' }}>
                  {idx + 1}
                </div>
                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                  background: `linear-gradient(135deg, hsl(${idx * 47 + 200}, 65%, 45%), hsl(${idx * 47 + 240}, 65%, 55%))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '1rem',
                }}>{r.candidate_name?.charAt(0) || '?'}</div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: darkMode ? '#e2e8f0' : '#1a202c',
                    fontSize: '0.95rem' }}>{r.candidate_name}</div>
                  <div style={{ fontSize: '0.75rem', color: darkMode ? '#718096' : '#9ca3af' }}>
                    {r.candidate_email}
                  </div>
                </div>
                {/* Score ring */}
                <ScoreRing score={r.overall_score || 0} size={70} />
                {/* Recommendation badge */}
                <div style={{
                  padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem',
                  background: recColor[r.recommendation] + '22',
                  color: recColor[r.recommendation],
                  border: `1px solid ${recColor[r.recommendation]}44`,
                  whiteSpace: 'nowrap',
                }}>{recEmoji[r.recommendation]} {r.recommendation}</div>
                {/* Expand toggle */}
                <div style={{ color: darkMode ? '#4a5568' : '#d1d5db', fontSize: '1.2rem',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }}>
                  ↓
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{
                  borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(26,35,126,0.06)'}`,
                  padding: '1.5rem',
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem',
                }}>
                  {/* Score breakdown */}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: darkMode ? '#a0aec0' : '#6b7280',
                      textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                      Score Breakdown
                    </div>
                    <MiniBar label="Skill Match (40%)" value={r.skill_match_score} darkMode={darkMode} />
                    <MiniBar label="Semantic BERT (25%)" value={r.semantic_similarity_score} darkMode={darkMode} />
                    <MiniBar label="TF-IDF Keywords (20%)" value={r.keyword_score} darkMode={darkMode} />
                    <MiniBar label="Experience (15%)" value={r.experience_score} darkMode={darkMode} />
                  </div>
                  {/* Skills */}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: darkMode ? '#a0aec0' : '#6b7280',
                      textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Skills</div>
                    {matchedSkills.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#48bb78', fontWeight: 600, marginBottom: '6px' }}>
                          ✅ Matched ({matchedSkills.length})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {matchedSkills.map(s => (
                            <span key={s} style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem',
                              fontWeight: 600, background: 'rgba(72,187,120,0.15)', color: '#48bb78',
                              border: '1px solid rgba(72,187,120,0.25)' }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {missingSkills.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#fc8181', fontWeight: 600, marginBottom: '6px' }}>
                          ❌ Missing ({missingSkills.length})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {missingSkills.map(s => (
                            <span key={s} style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem',
                              fontWeight: 600, background: 'rgba(252,129,129,0.15)', color: '#fc8181',
                              border: '1px solid rgba(252,129,129,0.25)' }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Radar + Summary */}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: darkMode ? '#a0aec0' : '#6b7280',
                      textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Radar</div>
                    <ResponsiveContainer width="100%" height={130}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke={darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: darkMode ? '#718096' : '#9ca3af', fontSize: 10 }} />
                        <Radar dataKey="value" stroke="#3949ab" fill="#3949ab" fillOpacity={0.25} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <div style={{ fontSize: '0.75rem', color: darkMode ? '#718096' : '#9ca3af',
                      lineHeight: 1.6, fontStyle: 'italic', marginTop: '8px' }}>
                      {r.ai_summary}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!loading && results.length === 0 && selectedJob && (
        <div style={{ ...card, padding: '3rem', textAlign: 'center', color: darkMode ? '#4a5568' : '#d1d5db' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No results yet</div>
          <div style={{ fontSize: '0.85rem' }}>Click "Run AI Screening" to analyze all candidates!</div>
        </div>
      )}
    </div>
  );
}