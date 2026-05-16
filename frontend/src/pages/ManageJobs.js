// frontend/src/pages/ManageJobs.js
// REPLACE your existing ManageJobs.js

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createJob, getAllJobs, deleteJob } from '../services/api';

const emptyForm = { title: '', company: '', description: '', required_skills: '', preferred_skills: '', min_experience: '' };

export default function ManageJobs({ darkMode }) {
  const [form, setForm] = useState(emptyForm);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const card = {
    background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(26,35,126,0.1)'}`,
    borderRadius: '20px', backdropFilter: 'blur(20px)',
    boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(26,35,126,0.08)',
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '12px', fontSize: '0.9rem',
    background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(26,35,126,0.04)',
    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(26,35,126,0.15)'}`,
    color: darkMode ? '#e2e8f0' : '#1a202c', outline: 'none',
    fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  };

  const loadJobs = async () => {
    try { const res = await getAllJobs(); setJobs(res.data); } catch {}
  };

  useEffect(() => { loadJobs(); }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.description) { toast.error('Title aur description required!'); return; }
    setLoading(true);
    try {
      await createJob({
        title: form.title, company: form.company, description: form.description,
        required_skills: form.required_skills.split(',').map(s => s.trim()).filter(Boolean),
        preferred_skills: form.preferred_skills.split(',').map(s => s.trim()).filter(Boolean),
        min_experience: parseFloat(form.min_experience) || 0
      });
      toast.success('✅ Job created!');
      setForm(emptyForm);
      loadJobs();
    } catch { toast.error('Failed to create job'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    await deleteJob(id); toast.success('Deleted!'); loadJobs();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        input:focus, textarea:focus { border-color: #3949ab !important; box-shadow: 0 0 0 3px rgba(57,73,171,0.15) !important; }
      `}</style>

      <div style={{ marginBottom: '2rem', animation: 'fadeSlideUp 0.5s ease both' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800,
          color: darkMode ? '#fff' : '#0f172a', margin: 0, marginBottom: '0.4rem' }}>
          Job Descriptions
        </h1>
        <p style={{ color: darkMode ? '#718096' : '#9ca3af', margin: 0 }}>
          Add positions to screen candidates against
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Form */}
        <div style={{ ...card, padding: '1.8rem', animation: 'fadeSlideUp 0.5s ease 0.1s both' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.5rem',
            color: darkMode ? '#e2e8f0' : '#1a202c', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>➕</span> Add New Position
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: darkMode ? '#718096' : '#9ca3af',
                  textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Job Title *</label>
                <input style={inputStyle} placeholder="e.g. Python Developer"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: darkMode ? '#718096' : '#9ca3af',
                  textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Company</label>
                <input style={inputStyle} placeholder="e.g. TechCorp"
                  value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: darkMode ? '#718096' : '#9ca3af',
                textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Job Description *</label>
              <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                placeholder="Paste the full job description here..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: darkMode ? '#718096' : '#9ca3af',
                textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Required Skills <span style={{ opacity: 0.6 }}>(comma separated)</span>
              </label>
              <input style={inputStyle} placeholder="python, django, sql, git, react"
                value={form.required_skills} onChange={e => setForm({ ...form, required_skills: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.8rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: darkMode ? '#718096' : '#9ca3af',
                  textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Preferred Skills</label>
                <input style={inputStyle} placeholder="docker, aws, kubernetes"
                  value={form.preferred_skills} onChange={e => setForm({ ...form, preferred_skills: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: darkMode ? '#718096' : '#9ca3af',
                  textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Min Exp (yrs)</label>
                <input style={inputStyle} type="number" placeholder="2"
                  value={form.min_experience} onChange={e => setForm({ ...form, min_experience: e.target.value })} />
              </div>
            </div>
            <button onClick={handleSubmit} disabled={loading} style={{
              padding: '13px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem',
              background: loading ? '#4a5568' : 'linear-gradient(135deg, #1a237e, #3949ab)',
              color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: loading ? 'none' : '0 4px 20px rgba(26,35,126,0.4)',
              transition: 'all 0.2s ease', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loading ? '⏳ Creating...' : '✨ Create Job'}
            </button>
          </div>
        </div>

        {/* Jobs list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeSlideUp 0.5s ease 0.2s both' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: darkMode ? '#e2e8f0' : '#1a202c',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Active Positions</span>
            <span style={{ background: darkMode ? 'rgba(99,179,237,0.15)' : 'rgba(26,35,126,0.08)',
              color: darkMode ? '#63b3ed' : '#3949ab', padding: '3px 10px', borderRadius: '20px',
              fontSize: '0.8rem', fontWeight: 700 }}>{jobs.length}</span>
          </div>
          {jobs.length === 0 ? (
            <div style={{ ...card, padding: '3rem', textAlign: 'center',
              color: darkMode ? '#4a5568' : '#d1d5db' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
              <div>No jobs yet — create one!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '600px', overflowY: 'auto' }}>
              {jobs.map((j, i) => {
                const reqSkills = j.required_skills ? JSON.parse(j.required_skills) : [];
                return (
                  <div key={j.id} style={{
                    ...card, padding: '1.2rem', position: 'relative',
                    animation: `fadeSlideUp 0.4s ease ${i * 0.05}s both`,
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: darkMode ? '#e2e8f0' : '#1a202c',
                          marginBottom: '2px' }}>{j.title}</div>
                        <div style={{ fontSize: '0.8rem', color: darkMode ? '#63b3ed' : '#3949ab',
                          fontWeight: 600, marginBottom: '8px' }}>{j.company} · {j.min_experience}+ yrs</div>
                        <div style={{ fontSize: '0.78rem', color: darkMode ? '#718096' : '#9ca3af',
                          marginBottom: '10px', lineHeight: 1.5 }}>
                          {j.description?.substring(0, 80)}...
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {reqSkills.slice(0, 5).map(s => (
                            <span key={s} style={{
                              padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
                              background: darkMode ? 'rgba(252,129,129,0.15)' : 'rgba(220,38,38,0.08)',
                              color: darkMode ? '#fc8181' : '#dc2626',
                              border: `1px solid ${darkMode ? 'rgba(252,129,129,0.2)' : 'rgba(220,38,38,0.15)'}`,
                            }}>{s}</span>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(j.id)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: darkMode ? '#4a5568' : '#d1d5db', fontSize: '1rem',
                        padding: '4px', borderRadius: '6px', transition: 'color 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fc8181'}
                      onMouseLeave={e => e.currentTarget.style.color = darkMode ? '#4a5568' : '#d1d5db'}
                      >✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}