// src/pages/ProgressPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { API } from '../context/AuthContext';
import { PlayCircle, BookOpen, CheckCircle2, Trophy, Target, TrendingUp, ArrowRight } from 'lucide-react';

// ── SVG ring component ────────────────────────────────────────────────────────
function Ring({ pct, size = 120, stroke = 10, color = '#4f8ef7', label, sub }) {
  const r   = (size - stroke) / 2;
  const c   = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <div className="progress-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(79,142,247,0.1)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="ring-label">
        <div className="ring-pct" style={{ color }}>{pct}%</div>
        {label && <div className="ring-sub">{label}</div>}
        {sub   && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Single course row ─────────────────────────────────────────────────────────
function CourseRow({ course, roadmapTitle, onClick }) {
  const total = course.phases?.reduce((n, p) => n + p.lessons.length, 0) ?? 0;
  const done  = course.phases?.reduce((n, p) => n + p.lessons.filter(l => l.completed).length, 0) ?? 0;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 18px',
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 10, cursor: 'pointer', transition: 'all 0.18s',
        marginBottom: 10,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg3)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.background = 'var(--bg2)'; }}
    >
      <PlayCircle size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {course.title || roadmapTitle || 'Untitled Course'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="progress-bar" style={{ flex: 1, height: 5 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--font-mono)', minWidth: 60 }}>
            {done}/{total} lessons
          </span>
        </div>
      </div>
      <div style={{
        fontSize: 13, fontWeight: 700, color: pct === 100 ? '#00e5a0' : 'var(--accent)',
        fontFamily: 'var(--font-mono)', minWidth: 38, textAlign: 'right',
      }}>
        {pct}%
      </div>
      {pct === 100 && <Trophy size={16} color="#f0b429" style={{ flexShrink: 0 }} />}
      <ArrowRight size={14} color="var(--text3)" style={{ flexShrink: 0 }} />
    </div>
  );
}

// ── Roadmap row ───────────────────────────────────────────────────────────────
function RoadmapRow({ roadmap, courseData }) {
  const totalTopics = roadmap.phases?.reduce((n, p) => n + (p.topics?.length ?? 0), 0) ?? 0;
  const courseTotal = courseData?.phases?.reduce((n, p) => n + p.lessons.length, 0) ?? 0;
  const courseDone  = courseData?.phases?.reduce((n, p) => n + p.lessons.filter(l => l.completed).length, 0) ?? 0;
  const pct = courseTotal ? Math.round((courseDone / courseTotal) * 100) : 0;

  return (
    <div style={{
      padding: '14px 18px', background: 'var(--bg2)',
      border: '1px solid var(--border)', borderRadius: 10, marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{roadmap.title}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{
            fontSize: 11, padding: '2px 10px', borderRadius: 99,
            background: 'rgba(79,142,247,0.1)', color: 'var(--accent)',
            border: '1px solid rgba(79,142,247,0.2)', fontFamily: 'var(--font-mono)',
          }}>
            {totalTopics} topics
          </span>
          {courseTotal > 0 && (
            <span style={{
              fontSize: 11, padding: '2px 10px', borderRadius: 99,
              background: pct === 100 ? 'rgba(0,229,160,0.1)' : 'rgba(124,108,250,0.1)',
              color: pct === 100 ? '#00e5a0' : 'var(--accent2)',
              border: `1px solid ${pct === 100 ? 'rgba(0,229,160,0.2)' : 'rgba(124,108,250,0.2)'}`,
              fontFamily: 'var(--font-mono)',
            }}>
              🎓 {pct}% course done
            </span>
          )}
        </div>
      </div>
      {courseTotal > 0 && (
        <div className="progress-bar" style={{ height: 4 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const navigate = useNavigate();

  const [roadmaps,  setRoadmaps]  = useState([]);
  const [courses,   setCourses]   = useState([]);  // array of { roadmapId, course }
  const [quizStats, setQuizStats] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);

      // Load roadmaps
      const rmRes = await API.get('/roadmap').catch(() => null);
      const rms   = rmRes?.data?.roadmaps ?? rmRes?.data ?? [];
      setRoadmaps(rms);

      // Load course progress for each roadmap concurrently
      const courseResults = await Promise.all(
        rms.map(rm =>
          API.get(`/roadmap/${rm._id}/course`)
            .then(res => ({ roadmapId: rm._id, course: res.data.course }))
            .catch(() => null)
        )
      );
      setCourses(courseResults.filter(Boolean));

      // Load quiz history for quiz stats
      const quizRes = await API.get('/quiz/history').catch(() => null);
      if (quizRes?.data) {
        const quizzes = quizRes.data.quizzes ?? quizRes.data ?? [];
        if (quizzes.length) {
          const avg = Math.round(quizzes.reduce((s, q) => s + (q.score ?? 0), 0) / quizzes.length);
          setQuizStats({ total: quizzes.length, avg, best: Math.max(...quizzes.map(q => q.score ?? 0)) });
        }
      }
    } catch (err) {
      console.error('[Progress] load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Aggregate stats ──────────────────────────────────────────────────────
  const totalLessons   = courses.reduce((n, c) => n + (c.course?.phases?.reduce((s, p) => s + p.lessons.length, 0) ?? 0), 0);
  const doneLessons    = courses.reduce((n, c) => n + (c.course?.phases?.reduce((s, p) => s + p.lessons.filter(l => l.completed).length, 0) ?? 0), 0);
  const coursePct      = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;

  const completedCourses = courses.filter(c => {
    const total = c.course?.phases?.reduce((n, p) => n + p.lessons.length, 0) ?? 0;
    const done  = c.course?.phases?.reduce((n, p) => n + p.lessons.filter(l => l.completed).length, 0) ?? 0;
    return total > 0 && done === total;
  }).length;

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      {/* ── Header ── */}
      <div className="page-header">
        <h1 className="page-title">📊 Your Progress</h1>
        <p className="page-subtitle">Track your learning across roadmaps, video courses, and quizzes</p>
      </div>

      {/* ── Summary rings ── */}
      <div style={{
        display: 'flex', gap: 32, flexWrap: 'wrap',
        justifyContent: 'center', marginBottom: 40,
        padding: '28px', background: 'var(--card)',
        border: '1px solid var(--border)', borderRadius: 16,
      }}>
        <div style={{ textAlign: 'center' }}>
          <Ring pct={coursePct} size={130} color="#4f8ef7" label="Course" sub={`${doneLessons}/${totalLessons} lessons`} />
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8 }}>Video Lessons</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Ring pct={roadmaps.length ? Math.min(100, Math.round((roadmaps.length / Math.max(1, roadmaps.length)) * 100)) : 0}
            size={130} color="#7c6cfa" label="Roadmaps" sub={`${roadmaps.length} active`} />
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8 }}>Learning Paths</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Ring pct={quizStats?.avg ?? 0} size={130} color="#00e5a0" label="Avg Score" sub={`${quizStats?.total ?? 0} quizzes`} />
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8 }}>Quiz Average</div>
        </div>
      </div>

      {/* ── Top stat cards ── */}
      <div className="stats-grid" style={{ marginBottom: 36 }}>
        <div className="stat-card blue">
          <div className="stat-icon">🗺️</div>
          <div className="stat-value">{roadmaps.length}</div>
          <div className="stat-label">Roadmaps</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">🎓</div>
          <div className="stat-value">{courses.length}</div>
          <div className="stat-label">Courses Generated</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{doneLessons}</div>
          <div className="stat-label">Lessons Done</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{completedCourses}</div>
          <div className="stat-label">Courses Finished</div>
        </div>
      </div>

      {/* ── Course progress section ── */}
      {courses.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
              🎓 Video Course Progress
            </h2>
            <span style={{ fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>
              {doneLessons} / {totalLessons} lessons complete
            </span>
          </div>
          {courses.map(({ roadmapId, course }) => {
            const rm = roadmaps.find(r => r._id === roadmapId);
            return (
              <CourseRow
                key={roadmapId}
                course={course}
                roadmapTitle={rm?.title}
                onClick={() => navigate(`/roadmap/${roadmapId}/course`)}
              />
            );
          })}
        </div>
      )}

      {/* ── Roadmaps section ── */}
      {roadmaps.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            🗺️ Learning Roadmaps
          </h2>
          {roadmaps.map(rm => {
            const courseData = courses.find(c => c.roadmapId === rm._id)?.course ?? null;
            return <RoadmapRow key={rm._id} roadmap={rm} courseData={courseData} />;
          })}
        </div>
      )}

      {/* ── Quiz stats section ── */}
      {quizStats && (
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            🧠 Quiz Performance
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12,
          }}>
            {[
              { label: 'Quizzes Taken', value: quizStats.total, icon: '📝', color: 'blue' },
              { label: 'Average Score', value: `${quizStats.avg}%`, icon: '📊', color: 'green' },
              { label: 'Best Score', value: `${quizStats.best}%`, icon: '🏆', color: 'gold' },
            ].map(stat => (
              <div key={stat.label} className={`stat-card ${stat.color}`} style={{ padding: '16px 20px' }}>
                <div className="stat-icon" style={{ fontSize: 22 }}>{stat.icon}</div>
                <div className="stat-value" style={{ fontSize: 26 }}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/quiz-history')}
            className="btn btn-secondary"
            style={{ marginTop: 14, width: 'auto', padding: '9px 22px' }}
          >
            View Quiz History →
          </button>
        </div>
      )}

      {/* ── Empty state ── */}
      {roadmaps.length === 0 && courses.length === 0 && !quizStats && (
        <div className="card" style={{ textAlign: 'center', padding: '52px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🚀</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>
            Start your learning journey
          </h3>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>
            Generate a roadmap, build a course, and track your progress here.
          </p>
          <button className="btn btn-primary" style={{ width: 'auto', padding: '11px 28px' }}
            onClick={() => navigate('/roadmap')}>
            Create My First Roadmap
          </button>
        </div>
      )}
    </Layout>
  );
}