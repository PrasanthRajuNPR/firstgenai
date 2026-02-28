import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API } from '../context/AuthContext';

const LOAD_STEPS = [
  { step: 'Analyzing your profile...', sub: 'Understanding your goals and background' },
  { step: 'Generating roadmap...', sub: 'AI is crafting your personalized learning path' },
  { step: 'Building your planner...', sub: 'Scheduling tasks based on your study time' },
  { step: 'Almost ready!', sub: 'Setting up your dashboard' },
];

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    branch: user?.branch || '',
    year: user?.year || '',
    goal: user?.goal || '',
    dailyStudyTime: user?.dailyStudyTime || '',
    skillLevel: user?.skillLevel || '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const { branch, year, goal, dailyStudyTime, skillLevel } = form;
    if (!branch || !year || !goal || !dailyStudyTime || !skillLevel) {
      return setError('Please fill in all fields to generate your personalized roadmap.');
    }

    setLoading(true);

    // Animate through loader steps
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < LOAD_STEPS.length) setLoadStep(stepIndex);
    }, 2500);

    try {
      await API.post('/ai/generate-roadmap', { branch, year, goal, dailyStudyTime, skillLevel });
      await refreshUser();
      clearInterval(stepInterval);
      navigate('/dashboard');
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.response?.data?.message || 'Failed to generate roadmap. Please try again.');
      setLoading(false);
      setLoadStep(0);
    }
  };

  return (
    <>
      {loading && (
        <div className="loader-overlay">
          <div className="loader-card">
            <div className="loader-spinner"></div>
            <div className="loader-step">{LOAD_STEPS[loadStep].step}</div>
            <div className="loader-sub">{LOAD_STEPS[loadStep].sub}<span className="loader-dots"></span></div>
            <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center' }}>
              {LOAD_STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i <= loadStep ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i <= loadStep ? 'var(--accent)' : 'var(--border2)',
                  transition: 'all 0.3s',
                }}></div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="onboarding-page">
        <div className="onboarding-card">
          <div className="onboarding-header">
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
            <h1>Welcome, {user?.name?.split(' ')[0]}!</h1>
            <p>Tell us about yourself so we can build your perfect learning roadmap</p>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Engineering Branch</label>
                <input
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science, Mechanical"
                  required
                />
              </div>

              <div className="form-group">
                <label>Current Year</label>
                <select name="year" value={form.year} onChange={handleChange} required>
                  <option value="">Select year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Final Year">Final Year</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Primary Goal</label>
                <select name="goal" value={form.goal} onChange={handleChange} required>
                  <option value="">What do you want to achieve?</option>
                  <option value="placement">🏢 Campus Placement</option>
                  <option value="higher">🎓 Higher Studies (MS/MBA)</option>
                  <option value="core">⚙️ Core Engineering Role</option>
                  <option value="startup">🚀 Build a Startup</option>
                </select>
              </div>

              <div className="form-group">
                <label>Daily Study Time</label>
                <select name="dailyStudyTime" value={form.dailyStudyTime} onChange={handleChange} required>
                  <option value="">How much can you study?</option>
                  <option value="1 hour">1 hour/day</option>
                  <option value="2 hours">2 hours/day</option>
                  <option value="3 hours">3 hours/day</option>
                  <option value="4 hours">4 hours/day</option>
                  <option value="5+ hours">5+ hours/day</option>
                </select>
              </div>

              <div className="form-group">
                <label>Current Skill Level</label>
                <select name="skillLevel" value={form.skillLevel} onChange={handleChange} required>
                  <option value="">Your current level</option>
                  <option value="beginner">🌱 Beginner</option>
                  <option value="intermediate">⚡ Intermediate</option>
                  <option value="advanced">🔥 Advanced</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: 8, fontSize: 17, padding: '16px 24px' }}
            >
              🚀 Generate My Plan!
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
