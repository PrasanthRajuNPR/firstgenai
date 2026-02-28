import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../context/AuthContext';
import Layout from '../components/Layout';

function PhaseItem({ phase }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="phase-item">
      <div className="phase-header" onClick={() => setOpen(!open)}>
        <div>
          <div className="phase-title">{phase.title}</div>
          <div className="phase-timeline">{phase.timeline}</div>
        </div>
        <span className={`phase-chevron ${open ? 'open' : ''}`}>▼</span>
      </div>
      {open && (
        <div className="phase-body">
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text2)', marginTop: 16 }}>📚 Topics</div>
          <div className="topics-list">
            {phase.topics?.map((t, i) => <span key={i} className="topic-chip">{t}</span>)}
          </div>
          {phase.resources?.length > 0 && (
            <>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text2)', marginTop: 16 }}>🔗 Resources</div>
              <div className="resources-list">
                {phase.resources.map((r, i) => (
                  <div key={i} className="resource-item">
                    <span>→</span> {r}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/roadmap')
      .then(res => {
        setRoadmaps(res.data);
        if (res.data.length > 0) setSelected(res.data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner"></div></div></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">📚 My Roadmaps</h1>
        <p className="page-subtitle">Your AI-generated learning paths</p>
      </div>

      {roadmaps.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
          <h3>No roadmaps yet</h3>
          <p style={{ color: 'var(--text2)', marginBottom: 24 }}>Complete onboarding to generate your first roadmap</p>
          <Link to="/onboarding" className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>Get Started</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
          {/* Sidebar list */}
          <div>
            {roadmaps.map(rm => (
              <div
                key={rm._id}
                onClick={() => setSelected(rm)}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius)',
                  border: `1px solid ${selected?._id === rm._id ? 'var(--accent)' : 'var(--border)'}`,
                  background: selected?._id === rm._id ? 'rgba(79,142,247,0.08)' : 'var(--card)',
                  cursor: 'pointer',
                  marginBottom: 12,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{rm.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{rm.phases?.length || 0} phases</div>
                <div className="progress-bar" style={{ marginTop: 10 }}>
                  <div className="progress-fill" style={{ width: `${rm.completionPct}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800 }}>{selected.title}</h2>
                  <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
                    {selected.branchSnapshot} · {new Date(selected.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Link to={`/planner/${selected._id}`} className="btn btn-primary" style={{ width: 'auto' }}>
                  📋 Open Planner
                </Link>
              </div>
              {selected.phases?.map((phase, i) => <PhaseItem key={i} phase={phase} />)}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
