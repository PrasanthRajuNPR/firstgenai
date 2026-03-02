// src/pages/RoadmapPage.js
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { API } from '../context/AuthContext';

/* ── Collapsible phase item ── */
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
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text2)', marginTop: 16 }}>
            📚 Topics
          </div>
          <div className="topics-list">
            {phase.topics?.map((t, i) => (
              <span key={i} className="topic-chip">{t}</span>
            ))}
          </div>

          {phase.resources?.length > 0 && (
            <>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text2)', marginTop: 16 }}>
                🔗 Resources
              </div>
              <div className="resources-list">
                {phase.resources.map((r, i) => (
                  <div key={i} className="resource-item">→ {r}</div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main page ── */
export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/roadmap')
      .then(res => {
        setRoadmaps(res.data);
        if (res.data.length > 0) setSelected(res.data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div className="spinner" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">🗺️ My Roadmaps</h1>
        <p className="page-subtitle">Your AI-generated learning paths</p>
      </div>

      {roadmaps.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
          <h3>No roadmaps yet</h3>
          <p style={{ color: 'var(--text2)', marginBottom: 24 }}>
            Complete onboarding to generate your first AI roadmap
          </p>
          <Link to="/onboarding" className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>
            Get Started →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>

          {/* ── Left: roadmap list ── */}
          <div>
            {roadmaps.map(rm => (
              <div
                key={rm._id}
                onClick={() => setSelected(rm)}
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius)',
                  border: `1px solid ${selected?._id === rm._id ? 'var(--accent)' : 'var(--border)'}`,
                  background: selected?._id === rm._id ? 'rgba(79,142,247,0.08)' : 'var(--card)',
                  cursor: 'pointer',
                  marginBottom: 10,
                  transition: 'all 0.18s',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: 'var(--text)' }}>
                  {rm.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
                  {rm.phases?.length || 0} phases · {rm.branchSnapshot}
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${rm.completionPct || 0}%` }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                  {rm.completionPct || 0}% planner complete
                </div>
              </div>
            ))}
          </div>

          {/* ── Right: detail panel ── */}
          {selected && (
            <div>
              {/* Title + action buttons */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 20, gap: 16, flexWrap: 'wrap',
              }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{selected.title}</h2>
                  <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4, marginBottom: 0 }}>
                    {selected.branchSnapshot} · {new Date(selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link
                    to={`/planner/${selected._id}`}
                    className="btn btn-secondary"
                    style={{ width: 'auto', padding: '8px 18px', fontSize: 13 }}
                  >
                    📋 Open Planner
                  </Link>

                  {/* ── START COURSE BUTTON ── */}
                  <button
                    onClick={() => navigate(`/roadmap/${selected._id}/course`)}
                    className="btn btn-primary"
                    style={{
                      width: 'auto', padding: '8px 18px', fontSize: 13,
                      background: 'linear-gradient(135deg, #4f8ef7, #7c6cfa)',
                      boxShadow: '0 4px 14px rgba(79,142,247,0.3)',
                    }}
                  >
                    🎓 Start Course
                  </button>
                </div>
              </div>

              {/* ── Course callout banner ── */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', marginBottom: 24,
                background: 'rgba(79,142,247,0.06)',
                border: '1px solid rgba(79,142,247,0.18)',
                borderRadius: 12,
              }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>🎓</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: 13.5, color: 'var(--text)', marginBottom: 2,
                  }}>
                    Turn this roadmap into a full video course
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
                    AI finds YouTube videos, writes cheat sheets and structures a complete
                    beginner → advanced learning flow for every topic.
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/roadmap/${selected._id}/course`)}
                  style={{
                    flexShrink: 0, padding: '8px 16px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #4f8ef7, #7c6cfa)',
                    border: 'none', color: '#fff',
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: 12.5, cursor: 'pointer', whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(79,142,247,0.28)',
                    transition: 'all .18s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Generate Course →
                </button>
              </div>

              {/* Phases */}
              {selected.phases?.map((phase, i) => (
                <PhaseItem key={i} phase={phase} />
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}