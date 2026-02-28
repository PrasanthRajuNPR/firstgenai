import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../context/AuthContext";
import Layout from "../components/Layout";

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const quiz = location.state;

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      navigate("/quiz-setup");
    }
  }, [quiz, navigate]);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) return null;

  const question = quiz.questions[current];
  const totalQuestions = quiz.questions.length;
  const progressPct = Math.round((current / totalQuestions) * 100);
  const isLastQuestion = current === totalQuestions - 1;
  const hasAnswered = answers[current] !== undefined;

  const selectAnswer = (option) => {
    if (submitting) return;
    setAnswers(prev => ({ ...prev, [current]: option }));
    setError("");
  };

  const goNext = () => {
    if (!hasAnswered) { setError("Please select an answer before continuing."); return; }
    if (isLastQuestion) { submitQuiz(); } else { setError(""); setCurrent(p => p + 1); }
  };

  const goPrev = () => { if (current > 0) { setError(""); setCurrent(p => p - 1); } };

  const submitQuiz = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await API.post("/quiz/submit", { quizId: quiz._id, answers });
      navigate("/quiz-result", {
        state: { ...res.data, topic: quiz.topic, difficulty: quiz.difficulty }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
      setSubmitting(false);
    }
  };

  const optionLabels = ["A", "B", "C", "D"];
  const diffColor = quiz.difficulty === "Easy" ? "var(--accent3)" : quiz.difficulty === "Hard" ? "var(--red)" : "var(--gold)";

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Offline banner */}
        {quiz.isOffline && (
          <div style={{
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: "var(--radius)",
            padding: "10px 16px",
            marginBottom: 20,
            fontSize: 13,
            color: "var(--gold)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            ⚡ Using offline question bank — AI quota exceeded. Questions still accurate!
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title" style={{ fontSize: 24 }}>🧠 {quiz.topic}</h1>
            <p style={{ color: "var(--text2)", fontSize: 14 }}>
              Difficulty: <span style={{ color: diffColor, fontWeight: 700 }}>{quiz.difficulty}</span>
            </p>
          </div>
          <div style={{
            background: "var(--card2)", border: "1px solid var(--border2)",
            borderRadius: 20, padding: "8px 20px",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--accent)",
          }}>
            {current + 1} / {totalQuestions}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 32 }}>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${progressPct}%`, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: 8 }}>
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%", cursor: "pointer",
                background: i === current ? "var(--accent2)"
                  : answers[i] !== undefined ? "var(--accent3)"
                  : "var(--border2)",
                transition: "background 0.3s",
              }}
                onClick={() => { if (answers[i] !== undefined || i <= current) { setError(""); setCurrent(i); } }}
              />
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="card" style={{ padding: "36px 40px", marginBottom: 20 }}>
          <div style={{
            display: "inline-block", background: "rgba(79,142,247,0.12)", color: "var(--accent)",
            fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)",
            padding: "4px 12px", borderRadius: 20, marginBottom: 20, letterSpacing: "0.5px",
          }}>
            QUESTION {current + 1}
          </div>

          <p style={{ fontSize: 19, fontWeight: 600, fontFamily: "var(--font-display)", lineHeight: 1.55, marginBottom: 32, color: "var(--text)" }}>
            {question.question}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {question.options.map((opt, index) => {
              const isSelected = answers[current] === opt;
              return (
                <div
                  key={index}
                  onClick={() => selectAnswer(opt)}
                  style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "16px 20px",
                    borderRadius: "var(--radius)",
                    border: `2px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                    background: isSelected ? "rgba(79,142,247,0.12)" : "var(--bg2)",
                    cursor: submitting ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    userSelect: "none",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    border: `2px solid ${isSelected ? "var(--accent)" : "var(--border2)"}`,
                    background: isSelected ? "var(--accent)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14,
                    color: isSelected ? "white" : "var(--text2)",
                    transition: "all 0.2s",
                  }}>
                    {optionLabels[index]}
                  </div>
                  <span style={{ fontSize: 15, color: isSelected ? "var(--text)" : "var(--text2)", fontWeight: isSelected ? 600 : 400, transition: "all 0.2s" }}>
                    {opt}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#fca5a5", padding: "14px 18px", borderRadius: "var(--radius)",
            fontSize: 14, marginBottom: 16,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
          <button
            onClick={goPrev}
            disabled={current === 0 || submitting}
            className="btn btn-secondary"
            style={{ opacity: current === 0 ? 0.4 : 1, cursor: current === 0 ? "not-allowed" : "pointer", width: "auto" }}
          >
            ← Previous
          </button>
          <button
            onClick={goNext}
            disabled={submitting}
            className="btn btn-primary"
            style={{ flex: 1, maxWidth: 280, opacity: submitting ? 0.75 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
          >
            {submitting ? (
              <>
                <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Submitting...
              </>
            ) : isLastQuestion ? "Submit Quiz ✓" : "Next →"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text3)" }}>
          {Object.keys(answers).length} of {totalQuestions} questions answered
        </div>
      </div>
    </Layout>
  );
};

export default QuizPage;

