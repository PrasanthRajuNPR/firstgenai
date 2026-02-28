import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { path: '/roadmap', icon: '🗺️', label: 'Roadmaps' },
  { path: '/progress', icon: '📊', label: 'Progress' },
  { path: '/chat', icon: '🤖', label: 'AI Chat' },
  { path: '/Courses', icon: '📚', label: 'Courses' },
  { path: '/pdf-reader', icon: '🤖', label: 'pdf reader' },
  { path: '/VR-edu', icon: '📚', label: 'VR' },
  { path: '/quiz-setup',   icon: '🧠', label: 'Take Quiz'    },
  { path: '/quiz-history', icon: '📊', label: 'Quiz History' },
  { path: '/notes',        icon: '📒', label: 'Notes'        },
  { path: '/email-demo',   icon: '✉️', label: 'Email Demo'   }, // ✅ ADDED
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
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-logo">Edu<span>Empower</span></div>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              item.path === '/VR-edu'
                ? (
                  <button
                    key={item.path}
                    onClick={() => setVrOpen(true)}
                    className={`nav-item ${vrOpen ? 'active' : ''}`}
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </button>
                )
                : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${pathname === item.path ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </Link>
                )
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="nav-item" style={{ marginBottom: 8, cursor: 'default' }}>
              <span className="nav-icon">👤</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>{user?.branch || 'Student'}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="nav-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)' }}>
              <span className="nav-icon">🚪</span>
              Logout
            </button>
          </div>
        </aside>
        <main className="main-content">{children}</main>
      </div>

      {/* VR Panel Overlay */}
      {vrOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            width: '100%', maxWidth: '1100px', height: '90vh',
            background: '#0d1117', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 80px rgba(0,0,0,0.6)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.875rem 1.25rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              flexShrink: 0
            }}>
              <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1rem' }}>
                🥽 VR Campus
              </span>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <a
                  href={VR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.8rem', color: '#63b3ed', textDecoration: 'none',
                    padding: '0.35rem 0.875rem', borderRadius: '6px',
                    border: '1px solid rgba(99,179,237,0.3)',
                    background: 'rgba(99,179,237,0.08)'
                  }}
                >
                  ↗ Open Full Screen
                </a>
                <button
                  onClick={() => setVrOpen(false)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8', fontSize: '0.875rem',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* iFrame */}
            <iframe
              src={VR_URL}
              title="VR Campus"
              style={{ flex: 1, border: 'none', display: 'block' }}
              allow="camera; microphone; xr-spatial-tracking; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
