import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../context/AuthContext';
import Layout from '../components/Layout';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function PlannerPage() {
  const { roadmapId } = useParams();
  const [planner, setPlanner] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    Promise.all([
      API.get(`/planner/${roadmapId}`),
      API.get(`/roadmap/${roadmapId}`),
    ])
      .then(([pRes, rRes]) => {
        setPlanner(pRes.data);
        setRoadmap(rRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [roadmapId]);

  const toggleTask = async (task) => {
    if (task.locked) {
      setErrorMsg('This task is locked — editing window has expired (12h).');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    setUpdating(task._id);
    try {
      const res = await API.patch(`/planner/${planner._id}/task/${task._id}`, {
        completed: !task.completed,
      });
      setPlanner(res.data.planner);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update task';
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setUpdating(null);
    }
  };

  const getTasksByDay = () => {
    const grouped = {};
    DAYS.forEach(d => (grouped[d] = []));
    planner?.weeklySchedule?.forEach(task => {
      const day = task.day || 'Monday';
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(task);
    });
    return grouped;
  };

  const totalTasks = planner?.weeklySchedule?.length || 0;
  const doneTasks = planner?.weeklySchedule?.filter(t => t.completed).length || 0;
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const isEditingExpired = (task) => {
    if (!task.completedAt) return false;
    const hours = (Date.now() - new Date(task.completedAt).getTime()) / (1000 * 60 * 60);
    return hours >= 12;
  };

  if (loading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner"></div></div></Layout>;

  const grouped = getTasksByDay();

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">📋 Weekly Planner</h1>
            <p className="page-subtitle">{roadmap?.title}</p>
          </div>
          <Link to="/roadmap" className="btn btn-secondary btn-sm">← Roadmap</Link>
        </div>
      </div>

      {errorMsg && (
        <div className="error-msg" style={{ marginBottom: 20 }}>{errorMsg}</div>
      )}

      {/* Progress bar */}
      <div className="card card-sm" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>{doneTasks} / {totalTasks} tasks completed</span>
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{pct}%</span>
        </div>
        <div className="progress-bar" style={{ height: 10, marginBottom: 0 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }}></div>
        </div>
      </div>

      {/* Tasks by day */}
      {DAYS.map(day => {
        const dayTasks = grouped[day] || [];
        if (dayTasks.length === 0) return null;

        return (
          <div key={day} style={{ marginBottom: 28 }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--text2)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              {day}
              <span style={{ fontSize: 12, background: 'var(--bg3)', padding: '2px 8px', borderRadius: 20, fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
                {dayTasks.filter(t => t.completed).length}/{dayTasks.length}
              </span>
            </div>
            <div className="tasks-list">
              {dayTasks.map(task => {
                const expired = isEditingExpired(task) || task.locked;
                return (
                  <div key={task._id} className={`task-item ${task.completed ? 'completed' : ''} ${expired && task.completed ? 'locked' : ''}`}>
                    <div
                      className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                      onClick={() => !updating && toggleTask(task)}
                    >
                      {task.completed && '✓'}
                    </div>
                    <div className="task-info">
                      <div className={`task-title ${task.completed ? 'done' : ''}`}>{task.title}</div>
                      <div className="task-meta">
                        {task.phase} · {task.duration}
                        {task.completedAt && (
                          <span style={{ marginLeft: 8 }}>
                            · Completed {new Date(task.completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                    {expired && task.completed && <span className="badge badge-locked">🔒 Locked</span>}
                    {!expired && task.completed && <span className="badge badge-completed">✓ Done</span>}
                    {updating === task._id && <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </Layout>
  );
}
