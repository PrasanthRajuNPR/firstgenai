import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard',    icon: '⚡', label: 'Dashboard'    },
  { path: '/roadmap',      icon: '🗺️', label: 'Roadmaps'     },
  { path: '/progress',     icon: '📊', label: 'Progress'     },
  { path: '/chat',         icon: '🤖', label: 'AI Chat'      },
  { path: '/courses',      icon: '📚', label: 'Courses'      },
  { path: '/pdf-reader',   icon: '📄', label: 'PDF Reader'   },
  { path: '/VR-edu',       icon: '🥽', label: 'VR Campus'    },
  { path: '/quiz-setup',   icon: '🧠', label: 'Take Quiz'    },
];

const VR_URL = 'https://framevr.io/ai-ml-ds-vr-education';

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [vrOpen, setVrOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* ─── Scoped styles — fg- prefix avoids all conflicts ─── */}
      <style>{`
        .fg-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg, #050b18);
        }

        /* ========== SIDEBAR ========== */
        .fg-sidebar {
          position: fixed;
          top: 0; left: 0;
          width: 220px;
          height: 100vh;
          background: #0d1830;
          border-right: 1px solid rgba(99,157,255,0.12);
          display: flex;
          flex-direction: column;
          z-index: 200;
          overflow: hidden;
        }

        .fg-sidebar::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 140% 60% at 50% -10%,
            rgba(79,142,247,0.08) 0%, transparent 65%);
          pointer-events: none;
        }

        .fg-sidebar::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #4f8ef7, #7c6cfa, #00e5a0);
        }

        /* Logo */
        .fg-logo {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 19px;
          font-weight: 800;
          padding: 22px 18px 18px;
          border-bottom: 1px solid rgba(99,157,255,0.1);
          color: #e6eeff;
          letter-spacing: -0.3px;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }

        .fg-logo span { color: #4f8ef7; }

        /* Nav scroll area */
        .fg-nav {
          flex: 1;
          padding: 10px 8px;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
          z-index: 1;
        }

        .fg-nav::-webkit-scrollbar { width: 3px; }
        .fg-nav::-webkit-scrollbar-thumb {
          background: rgba(79,142,247,0.2);
          border-radius: 99px;
        }

        /* Nav items — both <Link> and <button> */
        .fg-item {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          padding: 9px 11px;
          margin-bottom: 2px;
          border-radius: 9px;
          border: 1px solid transparent;
          background: transparent;
          color: rgba(122,147,196,0.8);
          font-family: var(--font-body, 'Space Grotesk', sans-serif);
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          text-align: left;
          box-sizing: border-box;
          white-space: nowrap;
        }

        .fg-item:hover {
          background: rgba(79,142,247,0.09);
          color: #e6eeff;
          border-color: rgba(79,142,247,0.14);
        }

        .fg-item.fg-active {
          background: rgba(79,142,247,0.14);
          color: #6ba3ff;
          border-color: rgba(79,142,247,0.26);
          box-shadow: inset 3px 0 0 #4f8ef7;
        }

        .fg-icon {
          font-size: 15px;
          width: 19px;
          text-align: center;
          flex-shrink: 0;
        }

        .fg-label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }

        /* Footer */
        .fg-footer {
          padding: 10px 8px 14px;
          border-top: 1px solid rgba(99,157,255,0.1);
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        .fg-user {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 11px;
          border-radius: 9px;
          background: rgba(79,142,247,0.05);
          border: 1px solid rgba(79,142,247,0.1);
          margin-bottom: 4px;
        }

        .fg-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f8ef7, #7c6cfa);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
        }

        .fg-uname {
          font-size: 12.5px;
          font-weight: 700;
          color: #e6eeff;
          font-family: var(--font-display, 'Outfit', sans-serif);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .fg-ubranch {
          font-size: 10.5px;
          color: rgba(122,147,196,0.55);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ========== MAIN ========== */
        .fg-main {
          margin-left: 220px;
          flex: 1;
          min-height: 100vh;
          padding: 40px 44px;
          background: var(--bg, #050b18);
          box-sizing: border-box;
          background-image: radial-gradient(rgba(79,142,247,0.035) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        /* ========== VR OVERLAY ========== */
        .fg-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(5,11,24,0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: fgFadeIn 0.2s ease forwards;
        }

        @keyframes fgFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .fg-panel {
          width: 100%;
          max-width: 1100px;
          height: 90vh;
          background: #08101e;
          border-radius: 18px;
          border: 1px solid rgba(79,142,247,0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(79,142,247,0.06);
          animation: fgSlideUp 0.28s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        @keyframes fgSlideUp {
          from { opacity:0; transform: scale(0.96) translateY(14px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }

        .fg-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 20px;
          border-bottom: 1px solid rgba(79,142,247,0.11);
          background: rgba(13,24,48,0.65);
          flex-shrink: 0;
        }

        .fg-panel-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .fg-pulse-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #00e5a0;
          box-shadow: 0 0 8px rgba(0,229,160,0.65);
          animation: fgPulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes fgPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:0.4; transform:scale(0.75); }
        }

        .fg-panel-title {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-weight: 700;
          font-size: 14.5px;
          color: #e6eeff;
        }

        .fg-panel-url {
          font-size: 11px;
          color: rgba(122,147,196,0.45);
          font-family: 'JetBrains Mono', monospace;
        }

        .fg-panel-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .fg-fullscreen-link {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 12.5px;
          font-weight: 600;
          color: #4f8ef7;
          text-decoration: none;
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid rgba(79,142,247,0.25);
          background: rgba(79,142,247,0.08);
          transition: all 0.15s ease;
          display: inline-block;
        }

        .fg-fullscreen-link:hover {
          background: rgba(79,142,247,0.16);
          border-color: rgba(79,142,247,0.45);
          color: #6ba3ff;
        }

        .fg-close-btn {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(240,79,89,0.08);
          border: 1px solid rgba(240,79,89,0.22);
          color: #f04f59;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          line-height: 1;
          flex-shrink: 0;
        }

        .fg-close-btn:hover {
          background: rgba(240,79,89,0.18);
          border-color: rgba(240,79,89,0.45);
        }

        .fg-iframe {
          flex: 1;
          border: none;
          display: block;
          width: 100%;
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 900px) {
          .fg-sidebar { width: 60px; }
          .fg-logo    { display: none; }
          .fg-label   { display: none; }
          .fg-ubranch { display: none; }
          .fg-uname   { display: none; }
          .fg-user    { padding: 8px; justify-content: center; }
          .fg-avatar  { margin: 0; }
          .fg-item    { padding: 11px; justify-content: center; gap: 0; }
          .fg-icon    { width: auto; font-size: 18px; }
          .fg-main    { margin-left: 60px; padding: 28px 20px; }
        }

        @media (max-width: 640px) {
          .fg-sidebar { display: none; }
          .fg-main    { margin-left: 0; padding: 20px 16px; }
        }
      `}</style>

      <div className="fg-layout">

        {/* ── Sidebar ── */}
        <aside className="fg-sidebar">
          <div className="fg-logo">
            FirstGen<span>.ai</span>
          </div>

          <nav className="fg-nav">
            {navItems.map(item =>
              item.path === '/VR-edu' ? (
                <button
                  key={item.path}
                  onClick={() => setVrOpen(true)}
                  className={`fg-item ${vrOpen ? 'fg-active' : ''}`}
                >
                  <span className="fg-icon">{item.icon}</span>
                  <span className="fg-label">{item.label}</span>
                </button>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`fg-item ${pathname === item.path ? 'fg-active' : ''}`}
                >
                  <span className="fg-icon">{item.icon}</span>
                  <span className="fg-label">{item.label}</span>
                </Link>
              )
            )}
          </nav>

          <div className="fg-footer">
            <div className="fg-user">
              <div className="fg-avatar">👤</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="fg-uname">{user?.name}</div>
                <div className="fg-ubranch">{user?.branch || 'Student'}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="fg-item"
              style={{ width: '100%' }}
            >
              <span className="fg-icon">🚪</span>
              <span className="fg-label">Logout</span>
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="fg-main">
          {children}
        </main>
      </div>

      {/* ── VR Panel ── */}
      {vrOpen && (
        <div
          className="fg-overlay"
          onClick={e => { if (e.target === e.currentTarget) setVrOpen(false); }}
        >
          <div className="fg-panel">
            <div className="fg-panel-header">
              <div className="fg-panel-left">
                <div className="fg-pulse-dot" />
                <span className="fg-panel-title">🥽 VR Campus</span>
                <span className="fg-panel-url">framevr.io</span>
              </div>

              <div className="fg-panel-actions">
                <a
                  href={VR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fg-fullscreen-link"
                >
                  ↗ Full Screen
                </a>
                <button
                  className="fg-close-btn"
                  onClick={() => setVrOpen(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <iframe
              src={VR_URL}
              title="VR Campus"
              className="fg-iframe"
              allow="camera; microphone; xr-spatial-tracking; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}