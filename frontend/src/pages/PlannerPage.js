// src/pages/PlannerPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { API } from '../context/AuthContext';
import {
  CheckCircle2, Lock, PlayCircle, ChevronDown,
  ChevronRight, ArrowLeft, Clock, BookOpen,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

/** Group the flat weeklySchedule array into { day: [tasks] } preserving day order */
function groupByDay(tasks = []) {
  const map = {};
  tasks.forEach(t => {
    const d = t.day || 'Unscheduled';
    if (!map[d]) map[d] = [];
    map[d].push(t);
  });

  // Sort keys: known days first, then any extras
  const sorted = [
    ...DAY_ORDER.filter(d => map[d]),
    ...Object.keys(map).filter(d => !DAY_ORDER.includes(d)),
  ];
  return sorted.map(day => ({ day, tasks: map[day] }));
}

function normalise(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }

// ─── Task item ────────────────────────────────────────────────────────────────
function TaskItem({ task, onToggle }) {
  const isLocked   = task.locked;
  const isCoursed  = task.completedByCourse;
  const isDone     = task.completed;
  const canToggle  = !isLocked && !isCoursed;

  return (
    <div
      className={`task-item${isDone ? ' completed' : ''}`}
      style={isCoursed ? {
        background: 'rgba(0,229,160,0.04)',
        borderColor: 'rgba(0,229,160,0.2)',
      } : isLocked ? {
        background: 'rgba(240,79,89,0.04)',
        borderColor: 'rgba(240,79,89,0.15)',
        opacity: 0.75,
      } : {}}
    >
      {/* Checkbox */}
      <div
        onClick={() => canToggle && onToggle(task._id, !task.completed)}
        className={`task-checkbox${isDone ? ' checked' : ''}`}
        style={{
          cursor: canToggle ? 'pointer' : 'not-allowed',
          background: isDone
            ? isCoursed ? '#00e5a0' : isLocked ? 'var(--text3)' : 'var(--accent)'
            : 'transparent',
          borderColor: isDone
            ? isCoursed ? '#00e5a0' : isLocked ? 'var(--text3)' : 'var(--accent)'
            : undefined,
        }}
        title={
          isCoursed ? 'Completed via video course' :
          isLocked  ? 'Locked — 12-hour editing window expired' :
          isDone    ? 'Click to mark incomplete' :
                      'Click to mark complete'
        }
      >
        {isDone && (isLocked || isCoursed ? <Lock size={10} /> : '✓')}
      </div>

      {/* Info */}
      <div className="task-info">
        <div className={`task-title${isDone ? ' done' : ''}`}>{task.title}</div>
        <div className="task-meta" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {task.duration && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={10} /> {task.duration}
            </span>
          )}
          {task.phase && <span style={{ color: 'var(--accent2)' }}>· {task.phase}</span>}
          {isCoursed && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99,
              background: 'rgba(0,229,160,0.12)', color: '#00e5a0',
              border: '1px solid rgba(0,229,160,0.25)',
            }}>
              🎓 via course
            </span>
          )}
          {isLocked && !isCoursed && (
            <span style={{ fontSize: 10, color: 'var(--red)' }}>🔒 locked</span>
          )}
        </div>
      </div>

      {/* Right icon */}
      {isCoursed
        ? <CheckCircle2 size={15} color="#00e5a0" style={{ flexShrink: 0 }} />
        : isDone
          ? <CheckCircle2 size={15} color={isLocked ? 'var(--text3)' : 'var(--accent)'} style={{ flexShrink: 0 }} />
          : null
      }
    </div>
  );
}

// ─── Day group ────────────────────────────────────────────────────────────────
function DayGroup({ day, tasks, onToggle, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const done  = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="phase-item" style={{ marginBottom: 10 }}>
      <div className="phase-header" onClick={() => setOpen(o => !o)}>
        <div>
          <div className="phase-title" style={{ fontSize: 15 }}>{day}</div>
          <div style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            {done}/{total} tasks · {pct}%
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 72, height: 4, borderRadius: 99, background: 'var(--bg4)', overflow: 'hidden' }}>
            <div style={{
              width: `${pct}%`, height: '100%', borderRadius: 99,
              background: pct === 100
                ? '#00e5a0'
                : 'linear-gradient(90deg, var(--accent), var(--accent2))',
              transition: 'width 0.5s ease',
            }} />
          </div>
          {open
            ? <ChevronDown size={13} color="var(--text3)" />
            : <ChevronRight size={13} color="var(--text3)" />
          }
        </div>
      </div>

      {open && (
        <div className="phase-body" style={{ padding: '6px 16px 16px' }}>
          <div className="tasks-list">
            {tasks.map(task => (
              <TaskItem
                key={task._id}
                task={task}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PlannerPage() {
  const { roadmapId } = useParams();
  const navigate      = useNavigate();

  const [planner,  setPlanner]  = useState(null);   // raw Planner document from DB
  const [roadmap,  setRoadmap]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [toast,    setToast]    = useState('');      // success/error toast message

  const showToast = (msg, ms = 2200) => {
    setToast(msg);
    setTimeout(() => setToast(''), ms);
  };

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Load planner + roadmap in parallel
      const [plannerRes, roadmapRes] = await Promise.allSettled([
        API.get(`/planner/${roadmapId}`),
        API.get(`/roadmap/${roadmapId}`),
      ]);

      // Roadmap (for title)
      if (roadmapRes.status === 'fulfilled') {
        const d = roadmapRes.value.data;
        setRoadmap(d?.roadmap ?? d ?? null);
      }

      // Planner
      if (plannerRes.status === 'rejected') {
        if (plannerRes.reason?.response?.status === 404) {
          setPlanner(null); // not generated yet
        } else {
          setError('Failed to load planner. Please try again.');
        }
        return;
      }

      let plannerData = plannerRes.value.data;

      // Try to overlay course completions (non-critical — ignore if fails)
      try {
        const courseRes = await API.get(`/roadmap/${roadmapId}/course`);
        const courseData = courseRes.data?.course ?? null;
        if (courseData) plannerData = overlayCourse(plannerData, courseData);
      } catch {
        // No course yet — fine
      }

      setPlanner(plannerData);
    } catch (err) {
      setError('Failed to load planner.');
      console.error('[Planner] load error:', err);
    } finally {
      setLoading(false);
    }
  }, [roadmapId]);

  useEffect(() => { load(); }, [load]);

  // ── Overlay course completions onto planner tasks ─────────────────────────
  // Course lessons that are completed get marked completedByCourse=true on
  // matching planner tasks (matched by normalised title).
  function overlayCourse(plannerData, courseData) {
    const doneTitles = new Set();
    courseData.phases?.forEach(p =>
      p.lessons?.forEach(l => { if (l.completed) doneTitles.add(normalise(l.title)); })
    );
    if (!doneTitles.size) return plannerData;

    return {
      ...plannerData,
      weeklySchedule: plannerData.weeklySchedule.map(task =>
        doneTitles.has(normalise(task.title))
          ? { ...task, completed: true, completedByCourse: true }
          : task
      ),
    };
  }

  // ── Toggle task ───────────────────────────────────────────────────────────
  // API: PATCH /planner/:plannerId/task/:taskId  body: { completed: bool }
  const handleToggle = async (taskId, newCompleted) => {
    if (!planner) return;

    // Optimistic update
    setPlanner(p => ({
      ...p,
      weeklySchedule: p.weeklySchedule.map(t =>
        t._id === taskId ? { ...t, completed: newCompleted, completedAt: newCompleted ? new Date() : null } : t
      ),
    }));

    try {
      setSaving(true);
      await API.patch(`/planner/${planner._id}/task/${taskId}`, { completed: newCompleted });
      if (newCompleted) showToast('✅ Task completed!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update task';
      // If locked, reflect that in state
      if (err.response?.status === 403) {
        setPlanner(p => ({
          ...p,
          weeklySchedule: p.weeklySchedule.map(t =>
            t._id === taskId ? { ...t, locked: true, completed: t.completed } : t
          ),
        }));
        showToast('🔒 ' + msg);
      } else {
        // Revert optimistic update on other errors
        setPlanner(p => ({
          ...p,
          weeklySchedule: p.weeklySchedule.map(t =>
            t._id === taskId ? { ...t, completed: !newCompleted } : t
          ),
        }));
        showToast('❌ ' + msg);
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const schedule   = planner?.weeklySchedule ?? [];
  const grouped    = groupByDay(schedule);
  const total      = schedule.length;
  const done       = schedule.filter(t => t.completed).length;
  const locked     = schedule.filter(t => t.locked).length;
  const courseDone = schedule.filter(t => t.completedByCourse).length;
  const pct        = total ? Math.round((done / total) * 100) : 0;

  // ── Loading ───────────────────────────────────────────────────────────────
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
        <button
          onClick={() => navigate('/roadmap')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text2)', display: 'inline-flex', alignItems: 'center',
            gap: 6, fontSize: 13, padding: '6px 0', marginBottom: 10,
          }}
        >
          <ArrowLeft size={14} /> Back to Roadmaps
        </button>
        <h1 className="page-title">📋 {roadmap?.title ?? 'Study Planner'}</h1>
        <p className="page-subtitle">
          Your weekly learning schedule · Tasks lock 12 hours after completion
        </p>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {/* ── No planner generated yet ── */}
      {!planner && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '52px 24px' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>
            No planner generated yet
          </h3>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>
            A planner is generated automatically when your roadmap is created.
            If you're missing it, please regenerate your roadmap.
          </p>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 28px' }}
            onClick={() => navigate('/roadmap')}
          >
            Go to Roadmaps
          </button>
        </div>
      )}

      {planner && (
        <>
          {/* ── Stats row ── */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card blue">
              <div className="stat-icon">📋</div>
              <div className="stat-value">{total}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{done}</div>
              <div className="stat-label">Completed</div>
            </div>
            {courseDone > 0 && (
              <div className="stat-card purple">
                <div className="stat-icon">🎓</div>
                <div className="stat-value">{courseDone}</div>
                <div className="stat-label">Via Course</div>
              </div>
            )}
            <div className="stat-card gold">
              <div className="stat-icon">📊</div>
              <div className="stat-value">{pct}%</div>
              <div className="stat-label">Progress</div>
            </div>
          </div>

          {/* ── Overall progress bar ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Overall Progress</span>
              <span style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                {done} / {total} tasks
              </span>
            </div>
            <div className="progress-bar" style={{ height: 9 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${pct}%`,
                  background: pct === 100
                    ? '#00e5a0'
                    : 'linear-gradient(90deg, var(--accent), var(--accent2))',
                }}
              />
            </div>
          </div>

          {/* ── Course-sync banner ── */}
          {courseDone > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 16px', borderRadius: 10, marginBottom: 24,
              background: 'rgba(0,229,160,0.06)',
              border: '1px solid rgba(0,229,160,0.2)',
              fontSize: 13, color: 'var(--text2)',
            }}>
              <CheckCircle2 size={15} color="#00e5a0" style={{ flexShrink: 0 }} />
              <span>
                <strong style={{ color: '#00e5a0' }}>{courseDone} task{courseDone !== 1 ? 's' : ''}</strong>
                {' '}auto-completed from your video course.
              </span>
              <button
                onClick={() => navigate(`/roadmap/${roadmapId}/course`)}
                style={{
                  marginLeft: 'auto', background: 'rgba(0,229,160,0.1)',
                  border: '1px solid rgba(0,229,160,0.25)', color: '#00e5a0',
                  borderRadius: 7, padding: '4px 12px', fontSize: 12,
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)',
                  whiteSpace: 'nowrap',
                }}
              >
                Open Course →
              </button>
            </div>
          )}

          {/* ── Day groups ── */}
          {grouped.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--text2)' }}>
              No tasks found in this planner.
            </div>
          )}

          {grouped.map((group, i) => (
            <DayGroup
              key={group.day}
              day={group.day}
              tasks={group.tasks}
              onToggle={handleToggle}
              defaultOpen={i === 0}
            />
          ))}
        </>
      )}

      {/* ── Saving indicator ── */}
      {saving && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: 'var(--card)', border: '1px solid var(--border2)',
          borderRadius: 10, padding: '9px 16px', fontSize: 13,
          color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 999,
        }}>
          <div className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} />
          Saving…
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--card2)', border: '1px solid var(--border2)',
          borderRadius: 10, padding: '10px 20px', fontSize: 13.5,
          color: 'var(--text)', fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 1000,
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast}
        </div>
      )}
    </Layout>
  );
}