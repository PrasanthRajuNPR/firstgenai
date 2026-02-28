import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !user.onboardingComplete) {
      navigate('/onboarding');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [rmRes, prRes] = await Promise.all([
        API.get('/roadmap'),
        API.get('/planner/progress'),
      ]);
      setRoadmaps(rmRes.data);
      setProgress(prRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getGoalLabel = (goal) => ({
    placement: '🏢 Campus Placement',
    higher: '🎓 Higher Studies',
    core: '⚙️ Core Engineering',
    startup: '🚀 Startup',
  }[goal] || goal);

  const timeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner"></div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">{timeOfDay()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Track your progress and stay on top of your learning goals</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{user?.currentStreak || 0}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{progress?.completedTasks || 0}</div>
          <div className="stat-label">Tasks Completed</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon">📈</div>
          <div className="stat-value">{progress?.completionPct || 0}%</div>
          <div className="stat-label">Overall Progress</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">🗺️</div>
          <div className="stat-value">{roadmaps.length}</div>
          <div className="stat-label">Active Roadmaps</div>
        </div>
      </div>

      {/* Roadmaps */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Your Roadmaps</h2>
        <button onClick={() => navigate('/onboarding')} className="btn btn-secondary btn-sm">
          + New Roadmap
        </button>
      </div>

      {roadmaps.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <h3 style={{ marginBottom: 8 }}>No roadmaps yet!</h3>
          <p style={{ color: 'var(--text2)', marginBottom: 24 }}>Complete onboarding to generate your personalized AI roadmap</p>
          <button onClick={() => navigate('/onboarding')} className="btn btn-primary" style={{ width: 'auto' }}>
            Generate My Roadmap
          </button>
        </div>
      ) : (
        <div className="roadmap-grid">
          {roadmaps.map(rm => (
            <div key={rm._id} className="roadmap-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div className="roadmap-title">{rm.title}</div>
                <span className="badge badge-day">{rm.phases?.length || 0} phases</span>
              </div>
              <div className="roadmap-meta">
                {getGoalLabel(rm.goal)} · {new Date(rm.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${rm.completionPct}%` }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <span className="progress-pct">{rm.completionPct}% complete</span>
                <Link to={`/planner/${rm._id}`} className="btn btn-secondary btn-sm">Open →</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
