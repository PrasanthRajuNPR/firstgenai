// src/pages/RoadmapCourse.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext';
import {
  ArrowLeft, CheckCircle2, Circle,
  ChevronDown, ChevronRight,
  BookOpen, Zap, ExternalLink, Play, RefreshCw,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   CHEAT SHEET — renders the AI-generated markdown-style string
───────────────────────────────────────────────────────────── */
function CheatSheet({ content }) {
  if (!content) return <p className="rc-empty-text">No cheat sheet for this lesson.</p>;

  return (
    <div className="rc-cs-wrap">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return <h4 key={i} className="rc-cs-h3">{line.slice(4)}</h4>;
        if (line.startsWith('## '))
          return <h3 key={i} className="rc-cs-h2">{line.slice(3)}</h3>;
        if (/^[-*] /.test(line))
          return (
            <div key={i} className="rc-cs-bullet">
              <span className="rc-cs-dot">▸</span>
              <span>{line.slice(2)}</span>
            </div>
          );
        if (line.startsWith('`') && line.endsWith('`') && line.length > 2)
          return <code key={i} className="rc-cs-code">{line.slice(1, -1)}</code>;
        if (line.startsWith('```') || line.trim() === '')
          return <div key={i} style={{ height: 6 }} />;
        const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <p key={i} className="rc-cs-text" dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VIDEO LESSON — main content area
───────────────────────────────────────────────────────────── */
function VideoLesson({ lesson, isCompleted, onMarkComplete, onPrev, onNext, hasPrev, hasNext, idx, total }) {
  const [tab, setTab] = useState('notes');
  useEffect(() => setTab('notes'), [lesson.id]);

  return (
    <div className="rc-lesson-wrap">
      {/* Meta pills + title */}
      <div className="rc-lesson-head">
        <div className="rc-pills">
          <span className="rc-pill-num">{idx + 1} / {total}</span>
          <span className="rc-pill-phase">{lesson.phase}</span>
        </div>
        <h1 className="rc-lesson-title">{lesson.title}</h1>
        <p className="rc-lesson-desc">{lesson.description}</p>
      </div>

      {/* Card: video + tabs */}
      <div className="rc-card">
        {lesson.videoUrl ? (
          <div className="rc-video-wrap">
            <iframe
              src={`${lesson.videoUrl}?rel=0&modestbranding=1`}
              className="rc-iframe"
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="rc-no-video">
            <Play size={38} strokeWidth={1.2} />
            <span>No video available for this lesson</span>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(lesson.title + ' tutorial')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rc-no-video-link"
            >
              Search on YouTube →
            </a>
          </div>
        )}

        {/* Tab bar */}
        <div className="rc-tabbar">
          {[
            { key: 'notes',      icon: <BookOpen size={13} />,      label: 'Notes'       },
            { key: 'cheatsheet', icon: <Zap size={13} />,           label: 'Cheat Sheet' },
            ...(lesson.resources?.length > 0
              ? [{ key: 'resources', icon: <ExternalLink size={13} />, label: 'Resources' }]
              : []),
          ].map(t => (
            <button
              key={t.key}
              className={`rc-tab ${tab === t.key ? 'rc-tab--on' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}

          {/* Mark complete — write-once, pushed to right */}
          <button
            onClick={() => !isCompleted && onMarkComplete()}
            className={`rc-complete ${isCompleted ? 'rc-complete--done' : 'rc-complete--todo'}`}
            style={{ marginLeft: 'auto', cursor: isCompleted ? 'default' : 'pointer' }}
            disabled={isCompleted}
            title={isCompleted ? 'Lesson completed — cannot undo' : 'Mark this lesson as complete'}
          >
            {isCompleted
              ? <><CheckCircle2 size={14} /> Completed ✓</>
              : <><Circle size={14} /> Mark Complete</>}
          </button>
        </div>

        {/* Tab content */}
        <div className="rc-tabcontent">
          {tab === 'notes' && (
            <p className="rc-notes-text">{lesson.notes || 'No notes for this lesson.'}</p>
          )}
          {tab === 'cheatsheet' && <CheatSheet content={lesson.cheatsheet} />}
          {tab === 'resources' && (
            <div className="rc-resources">
              {lesson.resources.map((r, i) => (
                <a key={i} href={r.url || '#'} target="_blank" rel="noopener noreferrer" className="rc-res-link">
                  <ExternalLink size={12} /> {r.title || r.url}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Prev / Next nav */}
      <div className="rc-nav-row">
        <button onClick={onPrev} disabled={!hasPrev} className={`rc-nav-btn ${hasPrev ? 'rc-nav-prev' : 'rc-nav-off'}`}>
          ← Previous
        </button>
        <button onClick={onNext} disabled={!hasNext} className={`rc-nav-btn ${hasNext ? 'rc-nav-next' : 'rc-nav-off'}`}>
          Next →
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR — phases + lessons list
───────────────────────────────────────────────────────────── */
function CourseSidebar({ phases, activeLessonId, onSelect, completedLessons }) {
  const [expanded, setExpanded] = useState(new Set(phases.map(p => p.id)));

  const toggle = (id) => setExpanded(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const pct = (phase) => {
    if (!phase.lessons.length) return 0;
    const done = phase.lessons.filter(l => completedLessons.has(l.id)).length;
    return Math.round((done / phase.lessons.length) * 100);
  };

  return (
    <aside className="rc-sidebar">
      <div className="rc-sidebar-inner">
        <p className="rc-sidebar-label">Course Content</p>

        {phases.map(phase => {
          const open = expanded.has(phase.id);
          const p    = pct(phase);

          return (
            <div key={phase.id} className="rc-phase">
              <button className="rc-phase-btn" onClick={() => toggle(phase.id)}>
                <span className="rc-phase-arrow">
                  {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </span>
                <div className="rc-phase-info">
                  <span className="rc-phase-title">{phase.title}</span>
                  <div className="rc-phase-bar-row">
                    <div className="rc-phase-bar">
                      <div className="rc-phase-fill" style={{ width: `${p}%` }} />
                    </div>
                    <span className="rc-phase-pct">{p}%</span>
                  </div>
                </div>
              </button>

              {open && (
                <div className="rc-lessons-list">
                  {phase.lessons.map(lesson => {
                    const active = activeLessonId === lesson.id;
                    const done   = completedLessons.has(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        className={`rc-lesson-btn ${active ? 'rc-lesson-btn--active' : ''}`}
                        onClick={() => onSelect(lesson.id)}
                      >
                        {done
                          ? <CheckCircle2 size={12} className="rc-icon-done" />
                          : <Circle      size={12} className="rc-icon-todo" />}
                        <span className={active ? 'rc-lbl-active' : done ? 'rc-lbl-done' : 'rc-lbl-default'}>
                          {lesson.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function RoadmapCourse() {
  const { roadmapId } = useParams();
  const navigate = useNavigate();

  const [course,           setCourse]           = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [generating,       setGenerating]       = useState(false);
  const [error,            setError]            = useState('');
  const [activeLessonId,   setActiveLessonId]   = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  useEffect(() => { fetchCourse(); }, [roadmapId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get(`/roadmap/${roadmapId}/course`);
      if (res.data?.course) {
        const c = res.data.course;
        setCourse(c);
        selectFirst(c);
        // Restore completed lessons from DB (persisted, write-once)
        const done = new Set();
        c.phases?.forEach(p => p.lessons?.forEach(l => { if (l.completed) done.add(l.id); }));
        setCompletedLessons(done);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setCourse(null); // not generated yet
      } else {
        setError('Failed to load course. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectFirst = (c) => {
    const first = c?.phases?.[0]?.lessons?.[0];
    if (first) setActiveLessonId(first.id);
  };

  const generateCourse = async () => {
    try {
      setGenerating(true);
      setError('');
      const res = await API.post(`/roadmap/${roadmapId}/course/generate`);
      setCourse(res.data.course);
      selectFirst(res.data.course);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate course. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const regenerateCourse = async () => {
    if (!window.confirm('Regenerate course? Your current progress will be reset.')) return;
    try {
      setGenerating(true);
      setError('');
      setCourse(null);
      setCompletedLessons(new Set());
      await API.delete(`/roadmap/${roadmapId}/course`);
      const res = await API.post(`/roadmap/${roadmapId}/course/generate`);
      setCourse(res.data.course);
      selectFirst(res.data.course);
    } catch (err) {
      setError(err.response?.data?.message || 'Regeneration failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  /* ── Flat list for prev/next ── */
  const allLessons    = course?.phases?.flatMap(p => p.lessons) ?? [];
  const currentIdx    = allLessons.findIndex(l => l.id === activeLessonId);
  const currentLesson = allLessons[currentIdx] ?? null;
  const total         = allLessons.length;
  const progress      = total > 0 ? Math.round((completedLessons.size / total) * 100) : 0;

  const markComplete = async (lessonId) => {
    // Write-once: if already completed, do nothing
    if (completedLessons.has(lessonId)) return;
    // Optimistic UI update immediately
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    // Persist to DB
    try {
      await API.patch(`/roadmap/${roadmapId}/course/progress`, { lessonId, completed: true });
    } catch (err) {
      console.error('[Course] Failed to save progress:', err.message);
      // Don't revert — keep optimistic update, user can see it saved visually
    }
  };

  /* ── LOADING ── */
  if (loading) return (
    <div className="rc-center">
      <div className="spinner" />
      <p style={{ color: 'var(--text2)', marginTop: 14, fontSize: 14 }}>Loading course…</p>
    </div>
  );

  /* ── GENERATING ── */
  if (generating) return (
    <div className="rc-center">
      <style>{`
        @keyframes rcSpin   { to { transform: rotate(360deg); } }
        @keyframes rcPulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.7)} }
      `}</style>
      <div className="rc-gen-card">
        <div className="rc-gen-spinner" />
        <h3 className="rc-gen-title">Building Your Course</h3>
        <p className="rc-gen-sub">
          AI is finding YouTube videos, writing cheat sheets and structuring a complete learning flow for each topic…
        </p>
        <div className="rc-gen-steps">
          {[
            'Analysing your roadmap topics',
            'Finding the best YouTube videos',
            'Writing cheat sheets & notes',
            'Ordering lessons for best flow',
          ].map((step, i) => (
            <div key={i} className="rc-gen-step">
              <span className="rc-gen-dot" style={{ animationDelay: `${i * 0.35}s` }} />
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── NOT YET GENERATED ── */
  if (!course) return (
    <div className="rc-center">
      <div className="rc-empty-card">
        <div className="rc-empty-icon">🎓</div>
        <h2 className="rc-empty-title">Turn Your Roadmap Into a Full Course</h2>
        <p className="rc-empty-sub">
          AI will find real YouTube videos for every topic, write cheat sheets and arrange
          everything into a structured learning flow — exactly like a real course.
        </p>

        {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

        <div className="rc-feature-grid">
          {[
            { icon: '▶️', text: 'Curated YouTube videos per topic' },
            { icon: '⚡', text: 'Cheat sheet after every lesson'   },
            { icon: '🗂️', text: 'Structured beginner → advanced'   },
            { icon: '✅', text: 'Progress tracking per lesson'      },
          ].map((f, i) => (
            <span key={i} className="rc-feature-chip"><span>{f.icon}</span> {f.text}</span>
          ))}
        </div>

        <button onClick={generateCourse} className="btn btn-primary" style={{ width: 'auto', padding: '13px 40px', fontSize: 15 }}>
          ⚡ Generate My Course
        </button>
        <button onClick={() => navigate('/roadmap')} className="btn btn-secondary" style={{ width: 'auto', padding: '10px 24px', marginTop: 10 }}>
          ← Back to Roadmaps
        </button>
      </div>
    </div>
  );

  /* ── COURSE VIEW ── */
  return (
    <>
      <style>{CSS}</style>

      <div className="rc-root">
        {/* Fixed header */}
        <header className="rc-header">
          <div className="rc-header-inner">
            <div className="rc-header-left">
              <button className="rc-back-btn" onClick={() => navigate('/roadmap')}>
                <ArrowLeft size={15} /> Back
              </button>
              <div className="rc-h-divider" />
              <div className="rc-h-info">
                <h1 className="rc-h-title">{course.title}</h1>
                <p className="rc-h-sub">{course.description}</p>
              </div>
            </div>
            <div className="rc-header-right">
              <span className="rc-h-badge">{progress}% Complete</span>
              <button className="rc-regen-btn" onClick={regenerateCourse} title="Regenerate course">
                <RefreshCw size={13} />
              </button>
            </div>
          </div>
          <div className="rc-h-track">
            <div className="rc-h-fill" style={{ width: `${progress}%` }} />
          </div>
        </header>

        {/* Body */}
        <div className="rc-body">
          <CourseSidebar
            phases={course.phases}
            activeLessonId={activeLessonId}
            onSelect={setActiveLessonId}
            completedLessons={completedLessons}
          />
          <main className="rc-main">
            {currentLesson ? (
              <VideoLesson
                lesson={currentLesson}
                isCompleted={completedLessons.has(activeLessonId)}
                onMarkComplete={() => markComplete(activeLessonId)}
                onPrev={() => currentIdx > 0 && setActiveLessonId(allLessons[currentIdx - 1].id)}
                onNext={() => currentIdx < total - 1 && setActiveLessonId(allLessons[currentIdx + 1].id)}
                hasPrev={currentIdx > 0}
                hasNext={currentIdx < total - 1}
                idx={currentIdx}
                total={total}
              />
            ) : (
              <p className="rc-hint">Select a lesson from the sidebar to begin.</p>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   STYLES — all rc- prefixed, zero conflict with global CSS
───────────────────────────────────────────────────────────── */
const CSS = `
  /* ── Shared state screens ── */
  .rc-center {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: var(--bg, #050b18);
    padding: 24px;
  }

  /* ── Generate card ── */
  .rc-gen-card {
    background: var(--card, #0d1830);
    border: 1px solid rgba(99,157,255,0.18);
    border-radius: 20px;
    padding: 52px 56px;
    max-width: 460px; width: 100%;
    text-align: center;
  }
  .rc-gen-spinner {
    width: 48px; height: 48px;
    border: 3px solid rgba(79,142,247,0.15);
    border-top-color: var(--accent, #4f8ef7);
    border-radius: 50%;
    animation: rcSpin 0.8s linear infinite;
    margin: 0 auto 22px;
  }
  .rc-gen-title {
    font-family: var(--font-display, 'Outfit', sans-serif);
    font-size: 20px; font-weight: 700;
    color: var(--text, #e6eeff); margin-bottom: 10px;
  }
  .rc-gen-sub {
    color: var(--text2, #7a93c4);
    font-size: 13.5px; line-height: 1.65; margin-bottom: 24px;
  }
  .rc-gen-steps { display: flex; flex-direction: column; gap: 10px; text-align: left; }
  .rc-gen-step  {
    display: flex; align-items: center; gap: 12px;
    font-size: 13px; color: var(--text2, #7a93c4);
  }
  .rc-gen-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--accent, #4f8ef7); flex-shrink: 0;
    box-shadow: 0 0 8px rgba(79,142,247,0.6);
    display: inline-block;
    animation: rcPulse 1.4s ease-in-out infinite;
  }

  /* ── Empty card ── */
  .rc-empty-card {
    background: var(--card, #0d1830);
    border: 1px solid rgba(99,157,255,0.18);
    border-radius: 20px;
    padding: 52px 48px;
    max-width: 560px; width: 100%;
    text-align: center;
    position: relative; overflow: hidden;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
  }
  .rc-empty-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--accent, #4f8ef7), var(--accent2, #7c6cfa), var(--accent3, #00e5a0));
  }
  .rc-empty-icon  { font-size: 52px; margin-bottom: 14px; }
  .rc-empty-title {
    font-family: var(--font-display, 'Outfit', sans-serif);
    font-size: 22px; font-weight: 800;
    color: var(--text, #e6eeff); margin-bottom: 10px; letter-spacing: -.4px;
  }
  .rc-empty-sub   { color: var(--text2, #7a93c4); font-size: 14px; line-height: 1.65; margin-bottom: 20px; }
  .rc-feature-grid {
    display: flex; flex-wrap: wrap; gap: 8px;
    justify-content: center; margin-bottom: 24px;
  }
  .rc-feature-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px;
    background: rgba(79,142,247,0.08);
    border: 1px solid rgba(79,142,247,0.18);
    border-radius: 99px; font-size: 12.5px;
    color: rgba(184,200,232,0.8);
  }

  /* ── Root layout ── */
  .rc-root {
    min-height: 100vh;
    background: var(--bg, #050b18);
    color: var(--text, #e6eeff);
    font-family: var(--font-body, 'Space Grotesk', sans-serif);
  }

  /* ── Fixed header ── */
  .rc-header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 300;
    background: rgba(5,11,24,0.93);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(99,157,255,0.13);
  }
  .rc-header-inner {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 22px 9px; gap: 16px;
  }
  .rc-header-left  { display: flex; align-items: center; gap: 14px; min-width: 0; }
  .rc-header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

  .rc-back-btn {
    display: inline-flex; align-items: center; gap: 5px;
    background: none; border: none;
    color: var(--text2, #7a93c4);
    cursor: pointer; font-size: 13px; font-weight: 500;
    font-family: inherit; padding: 5px 9px; border-radius: 7px;
    transition: all .15s; flex-shrink: 0;
  }
  .rc-back-btn:hover { background: rgba(79,142,247,0.09); color: var(--text, #e6eeff); }

  .rc-h-divider { width: 1px; height: 20px; background: rgba(99,157,255,0.18); flex-shrink: 0; }

  .rc-h-info { min-width: 0; }
  .rc-h-title {
    font-family: var(--font-display, 'Outfit', sans-serif);
    font-size: 15px; font-weight: 700; color: var(--text, #e6eeff);
    margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .rc-h-sub {
    font-size: 11.5px; color: var(--text3, #3d5585);
    margin: 1px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .rc-h-badge {
    font-size: 11.5px; font-family: 'JetBrains Mono', monospace;
    color: var(--text2, #7a93c4);
    background: rgba(79,142,247,0.1);
    border: 1px solid rgba(79,142,247,0.2);
    padding: 4px 12px; border-radius: 99px;
  }

  .rc-regen-btn {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 50%;
    background: rgba(79,142,247,0.08);
    border: 1px solid rgba(79,142,247,0.2);
    color: var(--text2, #7a93c4);
    cursor: pointer; transition: all .15s;
  }
  .rc-regen-btn:hover { background: rgba(79,142,247,0.18); color: var(--accent, #4f8ef7); }

  .rc-h-track { height: 3px; background: rgba(79,142,247,0.1); }
  .rc-h-fill  { height: 100%; background: linear-gradient(90deg, var(--accent, #4f8ef7), var(--accent2, #7c6cfa)); transition: width .6s ease; }

  /* ── Body layout ── */
  .rc-body {
    display: flex;
    padding-top: 72px; /* exact header height */
    min-height: 100vh;
  }

  /* ── Sidebar ── */
  .rc-sidebar {
    position: fixed;
    top: 72px; left: 0; bottom: 0; width: 285px;
    background: rgba(8,15,31,0.97);
    border-right: 1px solid rgba(99,157,255,0.1);
    z-index: 100; overflow: hidden;
    display: flex; flex-direction: column;
  }
  .rc-sidebar-inner {
    flex: 1; overflow-y: auto; padding: 16px 12px;
  }
  .rc-sidebar-inner::-webkit-scrollbar { width: 3px; }
  .rc-sidebar-inner::-webkit-scrollbar-thumb {
    background: rgba(79,142,247,0.22); border-radius: 99px;
  }

  .rc-sidebar-label {
    font-size: 10px; font-weight: 700;
    color: var(--text3, #3d5585);
    text-transform: uppercase; letter-spacing: 1.3px;
    margin-bottom: 10px; padding: 0 4px;
  }

  /* Phase */
  .rc-phase { margin-bottom: 3px; }

  .rc-phase-btn {
    width: 100%; display: flex; align-items: flex-start; gap: 7px;
    padding: 8px 10px; border-radius: 8px;
    background: transparent; border: none;
    cursor: pointer; transition: background .14s; text-align: left;
  }
  .rc-phase-btn:hover { background: rgba(79,142,247,0.07); }

  .rc-phase-arrow { color: var(--text3, #3d5585); flex-shrink: 0; margin-top: 2px; display: flex; }
  .rc-phase-info  { flex: 1; min-width: 0; }
  .rc-phase-title {
    display: block;
    font-family: var(--font-display, 'Outfit', sans-serif);
    font-size: 12px; font-weight: 600; color: #b8c8e8;
    margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .rc-phase-bar-row { display: flex; align-items: center; gap: 6px; }
  .rc-phase-bar {
    flex: 1; height: 3px;
    background: rgba(79,142,247,0.1); border-radius: 99px; overflow: hidden;
  }
  .rc-phase-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent, #4f8ef7), var(--accent2, #7c6cfa));
    border-radius: 99px; transition: width .4s ease;
  }
  .rc-phase-pct {
    font-size: 10px; min-width: 24px;
    font-family: 'JetBrains Mono', monospace;
    color: var(--text3, #3d5585);
  }

  /* Lessons list */
  .rc-lessons-list {
    margin-left: 20px;
    display: flex; flex-direction: column; gap: 1px; padding: 2px 0 4px;
  }

  .rc-lesson-btn {
    width: 100%; display: flex; align-items: center; gap: 8px;
    padding: 7px 10px; border-radius: 7px;
    background: transparent; border: 1px solid transparent;
    cursor: pointer; transition: background .13s; text-align: left;
  }
  .rc-lesson-btn:hover { background: rgba(79,142,247,0.07); }
  .rc-lesson-btn--active {
    background: rgba(79,142,247,0.13) !important;
    border-color: rgba(79,142,247,0.26) !important;
  }

  .rc-icon-done   { color: var(--accent3, #00e5a0); flex-shrink: 0; }
  .rc-icon-todo   { color: rgba(122,147,196,0.3);   flex-shrink: 0; }
  .rc-lbl-active  { font-size: 12px; color: var(--accent-h, #6ba3ff); font-weight: 600; font-family: var(--font-body, sans-serif); }
  .rc-lbl-done    { font-size: 12px; color: #b8c8e8; font-family: var(--font-body, sans-serif); }
  .rc-lbl-default { font-size: 12px; color: rgba(122,147,196,0.65); font-family: var(--font-body, sans-serif); }

  /* ── Main content ── */
  .rc-main {
    margin-left: 285px; flex: 1;
    padding: 32px 40px 48px; min-height: calc(100vh - 72px);
    box-sizing: border-box;
  }
  .rc-hint { padding: 3rem; color: var(--text3, #3d5585); font-size: 15px; }

  /* ── Lesson wrap ── */
  .rc-lesson-wrap { max-width: 860px; margin: 0 auto; }

  .rc-lesson-head  { margin-bottom: 18px; }
  .rc-pills        { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .rc-pill-num {
    font-size: 11px; font-family: 'JetBrains Mono', monospace;
    color: var(--text2, #7a93c4);
    background: rgba(79,142,247,0.09); border: 1px solid rgba(79,142,247,0.17);
    padding: 3px 10px; border-radius: 99px;
  }
  .rc-pill-phase {
    font-size: 11px; font-weight: 600;
    font-family: var(--font-display, 'Outfit', sans-serif);
    color: var(--accent, #4f8ef7);
    background: rgba(79,142,247,0.08); border: 1px solid rgba(79,142,247,0.17);
    padding: 3px 10px; border-radius: 99px;
  }

  .rc-lesson-title {
    font-family: var(--font-display, 'Outfit', sans-serif);
    font-size: 22px; font-weight: 700;
    color: var(--text, #e6eeff); margin: 0 0 7px; line-height: 1.3;
  }
  .rc-lesson-desc  { font-size: 13.5px; color: var(--text2, #7a93c4); line-height: 1.65; max-width: 560px; margin: 0; }

  /* ── Video card ── */
  .rc-card {
    background: rgba(13,24,48,0.7);
    border: 1px solid rgba(99,157,255,0.13);
    border-radius: 14px; overflow: hidden; margin-bottom: 20px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.4);
  }

  .rc-video-wrap {
    position: relative; width: 100%; aspect-ratio: 16/9; background: #000;
  }
  .rc-iframe {
    position: absolute; inset: 0; width: 100%; height: 100%; border: none; display: block;
  }
  .rc-no-video {
    aspect-ratio: 16/9;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 10px; color: var(--text3, #3d5585); background: rgba(8,15,31,0.8); font-size: 13px;
  }
  .rc-no-video-link {
    font-size: 13px; font-weight: 600;
    color: var(--accent, #4f8ef7); text-decoration: none;
    padding: 7px 16px; border-radius: 8px;
    border: 1px solid rgba(79,142,247,0.25);
    background: rgba(79,142,247,0.08);
    transition: all .15s; margin-top: 4px;
  }
  .rc-no-video-link:hover { background: rgba(79,142,247,0.16); }

  /* ── Tab bar ── */
  .rc-tabbar {
    display: flex; align-items: center; gap: 3px; flex-wrap: wrap;
    padding: 10px 14px 0;
    border-top: 1px solid rgba(99,157,255,0.1);
    background: rgba(8,15,31,0.5);
  }
  .rc-tab {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 13px; border-radius: 7px 7px 0 0;
    border: none; background: transparent;
    color: rgba(122,147,196,0.6);
    font-size: 12.5px; font-weight: 600;
    font-family: var(--font-display, 'Outfit', sans-serif);
    cursor: pointer; transition: all .14s;
  }
  .rc-tab:hover { color: var(--text, #e6eeff); background: rgba(79,142,247,0.07); }
  .rc-tab--on {
    color: var(--accent, #4f8ef7) !important;
    background: rgba(79,142,247,0.12) !important;
    border-bottom: 2px solid var(--accent, #4f8ef7);
  }

  .rc-complete {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 13px; border-radius: 7px; border: 1px solid;
    font-size: 12px; font-weight: 600;
    font-family: var(--font-display, 'Outfit', sans-serif);
    cursor: pointer; transition: all .15s; margin-bottom: 2px;
  }
  .rc-complete--todo {
    background: rgba(79,142,247,0.07); border-color: rgba(79,142,247,0.2);
    color: var(--text2, #7a93c4);
  }
  .rc-complete--todo:hover { background: rgba(79,142,247,0.14); color: var(--text, #e6eeff); }
  .rc-complete--done {
    background: rgba(0,229,160,0.09); border-color: rgba(0,229,160,0.28);
    color: var(--accent3, #00e5a0);
  }

  /* ── Tab content ── */
  .rc-tabcontent  { padding: 20px 22px 24px; min-height: 110px; }
  .rc-notes-text  { color: rgba(184,200,232,0.85); line-height: 1.75; font-size: 13.5px; margin: 0; }
  .rc-empty-text  { color: var(--text3, #3d5585); font-size: 13.5px; padding: 8px 0; margin: 0; }
  .rc-resources   { display: flex; flex-direction: column; gap: 8px; }
  .rc-res-link {
    display: inline-flex; align-items: center; gap: 8px;
    color: var(--accent, #4f8ef7); font-size: 13.5px; text-decoration: none;
    padding: 8px 14px;
    background: rgba(79,142,247,0.07); border: 1px solid rgba(79,142,247,0.17);
    border-radius: 8px; transition: all .14s;
  }
  .rc-res-link:hover { background: rgba(79,142,247,0.14); border-color: rgba(79,142,247,0.35); }

  /* ── Cheat sheet ── */
  .rc-cs-wrap {
    background: rgba(8,15,31,0.65);
    border: 1px solid rgba(99,157,255,0.12);
    border-radius: 10px; padding: 16px 18px;
    font-size: 13px; line-height: 1.7;
  }
  .rc-cs-h3 {
    font-family: var(--font-display, 'Outfit', sans-serif);
    font-size: 11px; font-weight: 700; color: var(--accent, #4f8ef7);
    text-transform: uppercase; letter-spacing: .8px;
    margin: 14px 0 6px; padding-bottom: 5px;
    border-bottom: 1px solid rgba(79,142,247,0.14);
  }
  .rc-cs-h3:first-child { margin-top: 0; }
  .rc-cs-h2 {
    font-family: var(--font-display, 'Outfit', sans-serif);
    font-size: 14px; font-weight: 700; color: var(--text, #e6eeff); margin: 12px 0 5px;
  }
  .rc-cs-bullet {
    display: flex; gap: 8px; color: rgba(184,200,232,0.85); margin-bottom: 3px; font-size: 13px;
  }
  .rc-cs-dot { color: var(--accent, #4f8ef7); flex-shrink: 0; font-size: 10px; margin-top: 4px; }
  .rc-cs-code {
    display: block;
    font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--accent3, #00e5a0);
    background: rgba(0,229,160,0.06); border: 1px solid rgba(0,229,160,0.14);
    border-radius: 6px; padding: 5px 12px; margin: 4px 0;
  }
  .rc-cs-text { color: rgba(184,200,232,0.8); font-size: 13px; margin-bottom: 1px; }
  .rc-cs-text strong { color: var(--text, #e6eeff); font-weight: 600; }

  /* ── Nav row ── */
  .rc-nav-row { display: flex; justify-content: space-between; gap: 12px; }
  .rc-nav-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 22px; border-radius: 9px; border: none;
    font-family: var(--font-display, 'Outfit', sans-serif);
    font-size: 13.5px; font-weight: 600;
    cursor: pointer; transition: all .16s;
  }
  .rc-nav-prev {
    background: rgba(79,142,247,0.09); border: 1px solid rgba(79,142,247,0.2);
    color: rgba(184,200,232,0.9);
  }
  .rc-nav-prev:hover { background: rgba(79,142,247,0.16); color: var(--text, #e6eeff); }
  .rc-nav-next {
    background: var(--accent, #4f8ef7); color: #fff;
    box-shadow: 0 4px 16px rgba(79,142,247,0.3);
  }
  .rc-nav-next:hover {
    background: var(--accent-h, #6ba3ff);
    box-shadow: 0 6px 22px rgba(79,142,247,0.45);
    transform: translateY(-1px);
  }
  .rc-nav-off {
    background: rgba(79,142,247,0.04); border: 1px solid rgba(79,142,247,0.08);
    color: rgba(122,147,196,0.28); cursor: not-allowed;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .rc-sidebar { width: 220px; }
    .rc-main    { margin-left: 220px; padding: 24px 20px 40px; }
  }
  @media (max-width: 640px) {
    .rc-sidebar { display: none; }
    .rc-main    { margin-left: 0; padding: 20px 14px 40px; }
    .rc-lesson-title { font-size: 18px; }
  }
`;