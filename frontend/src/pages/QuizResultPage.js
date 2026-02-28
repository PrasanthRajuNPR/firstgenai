import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const QuizResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state;

  if (!result) {
    navigate("/quiz-setup");
    return null;
  }

  const { score, total, percentage, topic, difficulty } = result;

  const getGrade = (pct) => {
    if (pct >= 90) return { label: "Excellent! 🏆", grade: "A+", color: "var(--accent3)", bg: "rgba(6,214,160,0.1)", msg: "Outstanding! You've mastered this topic. Try a harder difficulty or a new topic." };
    if (pct >= 75) return { label: "Great Job! 🎉", grade: "A",  color: "var(--accent)",  bg: "rgba(79,142,247,0.1)", msg: "Really solid work! You have a strong grasp of this material. A bit more practice and you'll be at expert level." };
    if (pct >= 50) return { label: "Good Effort! 💪", grade: "B", color: "var(--gold)",   bg: "rgba(245,158,11,0.1)", msg: "Good effort! You understand the basics. Review the topics you missed and try again." };
    return              { label: "Keep Practicing! 📚", grade: "C", color: "var(--red)",  bg: "rgba(239,68,68,0.1)",  msg: "This topic needs more practice. Don't get discouraged — review the fundamentals and try again!" };
  };

  const pct = Math.round(percentage);
  const grade = getGrade(pct);
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (pct / 100) * circumference;
  const diffColor = difficulty === "Easy" ? "var(--accent3)" : difficulty === "Hard" ? "var(--red)" : "var(--gold)";

  return (
    <Layout>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* Header */}
        <div className="page-header" style={{ textAlign: "center" }}>
          <h1 className="page-title">Quiz Complete!</h1>
          <p className="page-subtitle">
            {topic} · <span style={{ color: diffColor, fontWeight: 700 }}>{difficulty}</span>
          </p>
        </div>

        {/* Grade Banner */}
        <div style={{
          background: grade.bg,
          border: `1px solid ${grade.color}40`,
          borderRadius: "var(--radius2)",
          padding: "20px 28px",
          textAlign: "center",
          marginBottom: 28,
          fontFamily: "var(--font-display)",
          fontSize: 20,
          fontWeight: 800,
          color: grade.color,
        }}>
          {grade.label}
        </div>

        {/* Score Card */}
        <div className="card" style={{ padding: "40px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>

            {/* Circular Progress */}
            <div style={{ position: "relative", width: 140, height: 140 }}>
              <svg width="140" height="140" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke={grade.color}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 28,
                  fontWeight: 800,
                  color: grade.color,
                  lineHeight: 1,
                }}>
                  {pct}%
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>score</div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text)" }}>
                  {score}<span style={{ fontSize: 20, color: "var(--text2)" }}>/{total}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>Questions Correct</div>
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                <div style={{
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "12px 20px",
                  textAlign: "center",
                  minWidth: 90,
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--accent3)" }}>{score}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>Correct ✓</div>
                </div>
                <div style={{
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "12px 20px",
                  textAlign: "center",
                  minWidth: 90,
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--red)" }}>{total - score}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>Wrong ✗</div>
                </div>
              </div>
            </div>
          </div>

          {/* Grade badge */}
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <div style={{
              display: "inline-block",
              background: grade.bg,
              color: grade.color,
              border: `1px solid ${grade.color}40`,
              borderRadius: 12,
              padding: "10px 32px",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 28,
              letterSpacing: 2,
            }}>
              Grade: {grade.grade}
            </div>
          </div>
        </div>

        {/* Performance Message */}
        <div style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "16px 20px",
          marginBottom: 28,
          fontSize: 14,
          color: "var(--text2)",
          lineHeight: 1.6,
        }}>
          {grade.msg}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => navigate("/quiz-setup")}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            ⚡ New Quiz
          </button>
          <button
            onClick={() => navigate("/quiz-history")}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            📊 History
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            🏠 Dashboard
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default QuizResultPage;
