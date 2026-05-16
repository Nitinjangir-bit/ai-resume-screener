// frontend/src/pages/UploadResume.js
// REPLACE your existing UploadResume.js

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { uploadResume, getAllCandidates, deleteCandidate } from '../services/api';

function SkillTag({ skill, darkMode }) {
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600,
      background: darkMode ? 'rgba(99,179,237,0.15)' : 'rgba(26,35,126,0.08)',
      color: darkMode ? '#63b3ed' : '#3949ab',
      border: `1px solid ${darkMode ? 'rgba(99,179,237,0.25)' : 'rgba(26,35,126,0.15)'}`,
      display: 'inline-block'
    }}>{skill}</span>
  );
}

export default function UploadResume({ darkMode }) {
  const [uploading, setUploading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [progress, setProgress] = useState(0);

  const card = {
    background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(26,35,126,0.1)'}`,
    borderRadius: '20px', backdropFilter: 'blur(20px)',
    boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(26,35,126,0.08)',
  };

  const loadCandidates = async () => {
    try { const res = await getAllCandidates(); setCandidates(res.data); } catch {}
  };

  useEffect(() => { loadCandidates(); }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    setUploading(true); setLastResult(null); setProgress(0);
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('resume', file);
      try {
        toast.info(`🔍 Analyzing ${file.name}...`);
        // Fake progress
        let p = 0;
        const interval = setInterval(() => { p += 15; setProgress(Math.min(p, 85)); }, 400);
        const res = await uploadResume(formData);
        clearInterval(interval); setProgress(100);
        setLastResult(res.data.extracted_info);
        toast.success(`✅ ${file.name} processed!`);
      } catch (err) {
        toast.error(`❌ Failed: ${err.response?.data?.error || 'Unknown error'}`);
      }
    }
    setUploading(false);
    setTimeout(() => setProgress(0), 1500);
    loadCandidates();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    multiple: true
  });

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try { await deleteCandidate(id); toast.success('Deleted!'); loadCandidates(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem', animation: 'fadeSlideUp 0.5s ease both' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800,
          color: darkMode ? '#fff' : '#0f172a', margin: 0, marginBottom: '0.4rem' }}>
          Upload Resumes
        </h1>
        <p style={{ color: darkMode ? '#718096' : '#9ca3af', margin: 0 }}>
          AI will automatically extract skills, experience & education
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Dropzone */}
        <div style={{ animation: 'fadeSlideUp 0.5s ease 0.1s both' }}>
          <div {...getRootProps()} style={{
            ...card, padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer',
            transition: 'all 0.3s ease',
            borderColor: isDragActive ? '#3949ab' : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(26,35,126,0.1)'),
            borderStyle: isDragActive ? 'solid' : 'dashed',
            borderWidth: '2px',
            background: isDragActive
              ? (darkMode ? 'rgba(57,73,171,0.15)' : 'rgba(26,35,126,0.05)')
              : (darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)'),
            transform: isDragActive ? 'scale(1.02)' : 'scale(1)',
          }}>
            <input {...getInputProps()} />
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem',
              filter: isDragActive ? 'drop-shadow(0 0 20px rgba(57,73,171,0.6))' : 'none',
              transition: 'filter 0.3s ease' }}>
              {isDragActive ? '✨' : '📁'}
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem',
              color: darkMode ? '#e2e8f0' : '#1a202c' }}>
              {isDragActive ? 'Drop it here!' : 'Drag & Drop Resumes'}
            </div>
            <div style={{ color: darkMode ? '#718096' : '#9ca3af', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              or click to browse files
            </div>
            <div style={{ display: 'inline-flex', gap: '8px' }}>
              {['PDF', 'DOCX'].map(fmt => (
                <span key={fmt} style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                  background: darkMode ? 'rgba(99,179,237,0.15)' : 'rgba(26,35,126,0.08)',
                  color: darkMode ? '#63b3ed' : '#3949ab',
                  border: `1px solid ${darkMode ? 'rgba(99,179,237,0.25)' : 'rgba(26,35,126,0.15)'}`
                }}>{fmt}</span>
              ))}
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                background: darkMode ? 'rgba(160,174,192,0.1)' : 'rgba(0,0,0,0.05)',
                color: darkMode ? '#a0aec0' : '#6b7280' }}>Max 5MB</span>
            </div>
          </div>

          {/* Progress bar */}
          {uploading && (
            <div style={{ marginTop: '1rem', ...card, padding: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: 20, height: 20, border: '2px solid #3949ab',
                  borderTopColor: 'transparent', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600,
                  color: darkMode ? '#e2e8f0' : '#1a202c' }}>
                  NLP processing resume...
                </span>
              </div>
              <div style={{ height: 8, background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '4px',
                  background: 'linear-gradient(90deg, #1a237e, #3949ab, #63b3ed)',
                  width: `${progress}%`, transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px',
                fontSize: '0.72rem', color: darkMode ? '#718096' : '#9ca3af' }}>
                <span>Extracting skills & experience</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Extracted result */}
        <div style={{ animation: 'fadeSlideUp 0.5s ease 0.2s both' }}>
          {lastResult ? (
            <div style={{ ...card, padding: '1.8rem', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px',
                  background: 'linear-gradient(135deg, #48bb78, #38a169)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem' }}>✓</div>
                <div>
                  <div style={{ fontWeight: 700, color: darkMode ? '#e2e8f0' : '#1a202c' }}>Extraction Complete!</div>
                  <div style={{ fontSize: '0.75rem', color: '#48bb78' }}>AI analysis successful</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
                {[
                  { label: 'Name', value: lastResult.name, icon: '👤' },
                  { label: 'Experience', value: `${lastResult.experience_years} years`, icon: '⏱️' },
                  { label: 'Education', value: lastResult.education, icon: '🎓' },
                  { label: 'Skills Found', value: `${lastResult.skills_found} skills`, icon: '🔧' },
                ].map(item => (
                  <div key={item.label} style={{
                    padding: '0.8rem', borderRadius: '12px',
                    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,35,126,0.04)',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(26,35,126,0.08)'}`,
                  }}>
                    <div style={{ fontSize: '0.7rem', color: darkMode ? '#718096' : '#9ca3af',
                      marginBottom: '4px' }}>{item.icon} {item.label}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem',
                      color: darkMode ? '#e2e8f0' : '#1a202c' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              {lastResult.skills && lastResult.skills.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: darkMode ? '#718096' : '#9ca3af',
                    marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detected Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {lastResult.skills.slice(0, 12).map(s => <SkillTag key={s} skill={s} darkMode={darkMode} />)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ ...card, padding: '2rem', height: '100%', display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', opacity: 0.3 }}>🧠</div>
              <div style={{ color: darkMode ? '#4a5568' : '#d1d5db', fontSize: '0.9rem' }}>
                Upload a resume to see<br />AI extraction results here
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', opacity: 0.5 }}>
                {['Extracting text from PDF...', 'Running NLP pipeline...', 'Detecting skills...'].map(s => (
                  <div key={s} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem',
                    background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    color: darkMode ? '#4a5568' : '#d1d5db', textAlign: 'left' }}>• {s}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Candidates List */}
      <div style={{ ...card, padding: '1.5rem', animation: 'fadeSlideUp 0.5s ease 0.3s both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: darkMode ? '#e2e8f0' : '#1a202c' }}>
              Candidate Pool
            </div>
            <div style={{ fontSize: '0.8rem', color: darkMode ? '#718096' : '#9ca3af' }}>
              {candidates.length} candidates loaded
            </div>
          </div>
        </div>
        {candidates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: darkMode ? '#4a5568' : '#d1d5db' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <div>No candidates yet — upload resumes above!</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {candidates.map((c, i) => {
              const skills = c.skills ? JSON.parse(c.skills) : [];
              return (
                <div key={c.id} style={{
                  padding: '1.2rem', borderRadius: '14px',
                  background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(26,35,126,0.02)',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(26,35,126,0.08)'}`,
                  transition: 'all 0.2s ease', position: 'relative',
                }}
                onMouseEnter={e => e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(26,35,126,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(26,35,126,0.02)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
                      background: `linear-gradient(135deg, hsl(${i * 47 + 200}, 65%, 45%), hsl(${i * 47 + 240}, 65%, 55%))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 800, fontSize: '1rem',
                    }}>{c.name?.charAt(0)?.toUpperCase() || '?'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: darkMode ? '#e2e8f0' : '#1a202c',
                        fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                      <div style={{ fontSize: '0.73rem', color: darkMode ? '#718096' : '#9ca3af' }}>{c.education} · {c.experience_years} yrs</div>
                    </div>
                    <button onClick={() => handleDelete(c.id, c.name)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
                      color: darkMode ? '#4a5568' : '#d1d5db', padding: '4px', borderRadius: '6px',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fc8181'}
                    onMouseLeave={e => e.currentTarget.style.color = darkMode ? '#4a5568' : '#d1d5db'}
                    >✕</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {skills.slice(0, 5).map(s => <SkillTag key={s} skill={s} darkMode={darkMode} />)}
                    {skills.length > 5 && (
                      <span style={{ padding: '3px 8px', borderRadius: '20px', fontSize: '0.7rem',
                        color: darkMode ? '#718096' : '#9ca3af' }}>+{skills.length - 5}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}