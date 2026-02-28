import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../context/AuthContext";
import Layout from "../components/Layout";

// ─── MINI BAR CHART ──────────────────────────────────────────────────────────
const MiniBarChart = ({ data, color = "var(--accent)" }) => {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: "100%",
              height: `${(d.count / max) * 48}px`,
              minHeight: d.count > 0 ? 4 : 2,
              background: d.count > 0 ? color : "var(--border)",
              borderRadius: "4px 4px 0 0",
              transition: "height 0.6s ease",
              opacity: d.count > 0 ? 1 : 0.4,
            }}
          />
          <span style={{ fontSize: 10, color: "var(--text3)" }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
};

// ─── SCORE SPARKLINE ─────────────────────────────────────────────────────────
const Sparkline = ({ scores, width = 120, height = 36 }) => {
  if (!scores || scores.length < 2) return null;
  const max = 100, min = 0, padX = 4;
  const pts = scores.map((s, i) => {
    const x = padX + (i / (scores.length - 1)) * (width - padX * 2);
    const y = height - 4 - ((s - min) / (max - min)) * (height - 8);
    return `${x},${y}`;
  });
  const trend = scores[0] - scores[scores.length - 1]; // newest first
  const color = trend >= 0 ? "var(--accent3)" : "var(--red)";
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* last point dot */}
      <circle
        cx={pts[0].split(",")[0]}
        cy={pts[0].split(",")[1]}
        r="3"
        fill={color}
      />
    </svg>
  );
};

// ─── SCORE RING ───────────────────────────────────────────────────────────────
const ScoreRing = ({ pct, size = 56, stroke = 5, color = "var(--accent)" }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: size * 0.22, fontWeight: 800, fill: "var(--text)", fontFamily: "var(--font-display)" }}>
        {pct}%
      </text>
    </svg>
  );
};

// ─── GRADE HELPERS ────────────────────────────────────────────────────────────
const getGrade = (pct) => {
  if (pct >= 90) return { label: "A+", color: "var(--accent3)", bg: "rgba(6,214,160,0.12)" };
  if (pct >= 75) return { label: "A",  color: "var(--accent)",  bg: "rgba(79,142,247,0.12)" };
  if (pct >= 50) return { label: "B",  color: "var(--gold)",    bg: "rgba(245,158,11,0.12)" };
  return                { label: "C",  color: "var(--red)",     bg: "rgba(239,68,68,0.12)" };
};

const diffColor = (d) =>
  d === "Easy" ? "var(--accent3)" : d === "Hard" ? "var(--red)" : "var(--gold)";

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function QuizHistoryPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date"); // date | score | topic

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/quiz/history");
        setData(res.data);
      } catch (err) {
        setError("Failed to load quiz history.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <Layout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div className="spinner" />
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="error-msg">{error}</div>
    </Layout>
  );

  const { results = [], analytics } = data || {};

  // ── Empty state ──────────────────────────────────────────────────────────
  if (results.length === 0) return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">📊 Quiz History</h1>
        <p className="page-subtitle">Track your learning progress over time</p>
      </div>
      <div className="card" style={{ textAlign: "center", padding: "72px 40px" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🧠</div>
        <h3 style={{ marginBottom: 10, fontSize: 22 }}>No quizzes taken yet!</h3>
        <p style={{ color: "var(--text2)", marginBottom: 28 }}>
          Start a quiz to see your progress, scores and analytics here.
        </p>
        <button onClick={() => navigate("/quiz-setup")} className="btn btn-primary" style={{ width: "auto" }}>
          ⚡ Take Your First Quiz
        </button>
      </div>
    </Layout>
  );

  // ── Filter & sort ────────────────────────────────────────────────────────
  const difficulties = ["All", "Easy", "Medium", "Hard"];
  const filtered = results
    .filter((r) => filter === "All" || r.difficulty === filter)
    .sort((a, b) => {
      if (sortBy === "score") return b.percentage - a.percentage;
      if (sortBy === "topic") return a.topic.localeCompare(b.topic);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const a = analytics;

  return (
    <Layout>
      {/* ── Page Header ── */}
      <div className="page-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 className="page-title">📊 Quiz History</h1>
          <p className="page-subtitle">Your learning analytics and past performance</p>
        </div>
        <button onClick={() => navigate("/quiz-setup")} className="btn btn-primary" style={{ width: "auto" }}>
          ⚡ New Quiz
        </button>
      </div>

      {/* ── Top KPI Cards ── */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card blue">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{a.totalAttempts}</div>
          <div className="stat-label">Total Quizzes</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">📈</div>
          <div className="stat-value">{a.overallAvg}%</div>
          <div className="stat-label">Overall Average</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{a.streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">🏆</div>
          <div className="stat-value" style={{ fontSize: 18, lineHeight: 1.3 }}>{a.bestTopic}</div>
          <div className="stat-label">Best Topic</div>
        </div>
      </div>

      {/* ── Analytics Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 28 }}>

        {/* Weekly Activity */}
        <div className="card" style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 16 }}>
            📅 Weekly Activity
          </div>
          <MiniBarChart data={a.weeklyActivity} color="var(--accent)" />
          <div style={{ marginTop: 12, fontSize: 13, color: "var(--text3)" }}>
            {a.weeklyActivity.reduce((s, d) => s + d.count, 0)} quizzes this week
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="card" style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 16 }}>
            ⚖️ Difficulty Breakdown
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {a.difficultyBreakdown.map((d) => (
              <div key={d.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: diffColor(d.label), fontWeight: 600 }}>{d.label}</span>
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>
                    {d.attempts} quiz{d.attempts !== 1 ? "zes" : ""} · avg {d.avgScore}%
                  </span>
                </div>
                <div style={{ background: "var(--border)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${d.avgScore}%`,
                    background: diffColor(d.label),
                    borderRadius: 4, transition: "width 0.8s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Trend */}
        <div className="card" style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 16 }}>
            📉 Recent Trend
          </div>
          {a.recentTrend.length >= 2 ? (
            <>
              <Sparkline scores={a.recentTrend} width={160} height={48} />
              <div style={{ marginTop: 12, fontSize: 13, color: "var(--text3)" }}>
                {a.recentTrend[0] >= a.recentTrend[a.recentTrend.length - 1]
                  ? <span style={{ color: "var(--accent3)" }}>↑ Improving</span>
                  : <span style={{ color: "var(--red)" }}>↓ Needs work</span>}
                {" — last {a.recentTrend.length} quizzes".replace("{a.recentTrend.length}", a.recentTrend.length)}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 8 }}>Take more quizzes to see your trend.</div>
          )}
        </div>
      </div>

      {/* ── Topic Performance Table ── */}
      <div className="card" style={{ padding: "28px", marginBottom: 28 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🗂️ Topic Performance</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Topic", "Attempts", "Avg Score", "Best Score", "Trend"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left", padding: "10px 16px",
                    fontSize: 12, fontWeight: 700, color: "var(--text3)",
                    textTransform: "uppercase", letterSpacing: "0.5px",
                    borderBottom: "1px solid var(--border)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {a.topicStats.sort((x, y) => y.attempts - x.attempts).map((t, i) => {
                const g = getGrade(t.avgScore);
                return (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "14px 16px", fontWeight: 600, fontSize: 14 }}>{t.topic}</td>
                    <td style={{ padding: "14px 16px", color: "var(--text2)", fontSize: 14 }}>{t.attempts}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ background: "var(--border)", borderRadius: 4, height: 6, width: 80, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${t.avgScore}%`, background: g.color, borderRadius: 4, transition: "width 0.8s ease" }} />
                        </div>
                        <span style={{ fontSize: 13, color: g.color, fontWeight: 700 }}>{t.avgScore}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: g.bg, color: g.color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                        {t.bestScore}%
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {t.trend >= 5 && <span style={{ color: "var(--accent3)", fontSize: 13, fontWeight: 600 }}>↑ Rising</span>}
                      {t.trend <= -5 && <span style={{ color: "var(--red)", fontSize: 13, fontWeight: 600 }}>↓ Falling</span>}
                      {Math.abs(t.trend) < 5 && <span style={{ color: "var(--text3)", fontSize: 13 }}>→ Steady</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Results History ── */}
      <div className="card" style={{ padding: "28px" }}>
        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>📋 All Results</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {/* Difficulty filter */}
            <div style={{ display: "flex", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              {difficulties.map((d) => (
                <button key={d} onClick={() => setFilter(d)} style={{
                  padding: "7px 14px", border: "none", cursor: "pointer",
                  background: filter === d ? "var(--accent)" : "transparent",
                  color: filter === d ? "white" : "var(--text2)",
                  fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)",
                  transition: "all 0.2s",
                }}>{d}</button>
              ))}
            </div>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "7px 12px", background: "var(--bg2)", border: "1px solid var(--border)",
                borderRadius: 8, color: "var(--text2)", fontSize: 13,
                fontFamily: "var(--font-body)", cursor: "pointer",
              }}
            >
              <option value="date">Sort: Latest</option>
              <option value="score">Sort: Score</option>
              <option value="topic">Sort: Topic</option>
            </select>
          </div>
        </div>

        {/* Results list */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text3)" }}>
            No results for "{filter}" difficulty.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((r, i) => {
              const g = getGrade(r.percentage);
              const date = new Date(r.createdAt);
              const dateStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
              const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
              return (
                <div
                  key={r._id}
                  style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "16px 20px",
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    transition: "border-color 0.2s",
                    animation: `fadeSlideIn 0.3s ease ${i * 0.04}s both`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border2)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  {/* Score ring */}
                  <ScoreRing
                    pct={r.percentage}
                    size={52}
                    stroke={4}
                    color={g.color}
                  />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{r.topic}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>{dateStr} · {timeStr}</div>
                  </div>

                  {/* Score text */}
                  <div style={{ textAlign: "center", minWidth: 60 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: g.color }}>
                      {r.score}/{r.totalQuestions}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>score</div>
                  </div>

                  {/* Grade badge */}
                  <div style={{
                    background: g.bg, color: g.color,
                    borderRadius: 8, padding: "6px 14px",
                    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16,
                    minWidth: 44, textAlign: "center",
                  }}>
                    {g.label}
                  </div>

                  {/* Difficulty badge */}
                  <div style={{
                    color: diffColor(r.difficulty),
                    fontSize: 12, fontWeight: 700,
                    background: `${diffColor(r.difficulty)}18`,
                    padding: "4px 10px", borderRadius: 20,
                    minWidth: 60, textAlign: "center",
                  }}>
                    {r.difficulty}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 16, fontSize: 13, color: "var(--text3)", textAlign: "right" }}>
          Showing {filtered.length} of {results.length} results
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Layout>
  );
}

