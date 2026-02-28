import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function ProgressPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/planner/progress')
      .then(res => setProgress(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const CircularRing = ({ pct }) => {
    const r = 80;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;

    return (
      <div className="progress-ring-container" style={{ width: 200, height: 200 }}>
        <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="100" cy="100" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
          <circle
            cx="100" cy="100" r={r} fill="none"
            stroke="url(#grad)" strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--accent2)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="ring-label">
          <div className="ring-pct">{pct}%</div>
          <div className="ring-sub">complete</div>
        </div>
      </div>
    );
  };

  if (loading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner"></div></div></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">📊 My Progress</h1>
        <p className="page-subtitle">Read-only view of your learning journey</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* Ring + stats */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <CircularRing pct={progress?.completionPct || 0} />
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{progress?.completedTasks || 0}</div>
              <div style={{ color: 'var(--text2)', fontSize: 14 }}>Tasks Completed</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{progress?.totalTasks || 0}</div>
              <div style={{ color: 'var(--text2)', fontSize: 14 }}>Total Tasks</div>
            </div>
          </div>
        </div>

        {/* Streak card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🔥</div>
          <div style={{ fontSize: 52, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>
            {user?.currentStreak || 0}
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 16 }}>Day Streak</div>
          <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 8 }}>
            Keep it up! Complete a task daily to maintain your streak.
          </div>
        </div>
      </div>

      {/* Completed topics */}
      <div className="card">
        <h3 style={{ marginBottom: 20, fontSize: 18 }}>✅ Completed Topics</h3>
        {progress?.completedTopics?.length === 0 ? (
          <p style={{ color: 'var(--text2)' }}>No topics completed yet. Start your planner to begin!</p>
        ) : (
          <div className="topics-list">
            {progress?.completedTopics?.map((topic, i) => (
              <div key={i} className="topic-chip" style={{ background: 'rgba(6,214,160,0.1)', borderColor: 'rgba(6,214,160,0.2)', color: 'var(--accent3)' }}>
                ✓ {topic}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
