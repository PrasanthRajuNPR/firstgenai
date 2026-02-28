import React, { useState } from "react";
import { API } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

// These match the backend QUESTION_BANK keys exactly
const OFFLINE_TOPICS = [
  "JavaScript", "React", "Data Structures", "Algorithms",
  "Python", "SQL", "Operating Systems", "Computer Networks",
  "OOP Concepts", "System Design",
];

const QuizSetupPage = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [offlineTopics, setOfflineTopics] = useState(null); // shown when AI fails + no bank match

  const navigate = useNavigate();

  const generateQuiz = async () => {
    if (!topic.trim()) {
      setError("Please enter or select a topic");
      return;
    }
    setError("");
    setOfflineTopics(null);
    setLoading(true);

    try {
      const res = await API.post("/ai/generate-quiz", {
        topic: topic.trim(),
        difficulty,
        numberOfQuestions: Number(numberOfQuestions),
      });

      // Show a subtle note if using offline questions
      navigate("/quiz", {
        state: {
          ...res.data,
          isOffline: res.data.source === 'offline',
        }
      });
    } catch (err) {
      console.error("Quiz generation error:", err);
      const data = err.response?.data;

      if (data?.offlineTopics) {
        // AI quota exceeded AND no bank match — show available topics
        setOfflineTopics(data.offlineTopics);
        setError(data.tip || "AI is unavailable. Please choose a topic from the offline list below.");
      } else {
        const serverMsg = data?.error || data?.message;
        setError(serverMsg || "Quiz generation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const difficultyColors = {
    Easy: "var(--accent3)",
    Medium: "var(--gold)",
    Hard: "var(--red)",
  };

  const displayTopics = offlineTopics
    ? offlineTopics.map(t => t.charAt(0).toUpperCase() + t.slice(1))
    : OFFLINE_TOPICS;

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">🧠 AI Quiz Generator</h1>
        <p className="page-subtitle">Generate a personalized quiz on any topic in seconds</p>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="card" style={{ padding: "36px 40px" }}>

          {/* Topic Input */}
          <div className="form-group">
            <label>Topic</label>
            <input
              placeholder="e.g. React Hooks, Binary Trees, SQL Joins..."
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setError(""); setOfflineTopics(null); }}
              onKeyDown={(e) => e.key === "Enter" && !loading && generateQuiz()}
              style={{ fontSize: 16 }}
            />
          </div>

          {/* Topic chips — show offline topics if AI is down */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}>
              <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                {offlineTopics ? "⚡ Available Offline Topics" : "Quick Pick"}
              </div>
              {offlineTopics && (
                <span style={{
                  fontSize: 11,
                  background: "rgba(245,158,11,0.15)",
                  color: "var(--gold)",
                  border: "1px solid rgba(245,158,11,0.3)",
                  borderRadius: 20,
                  padding: "2px 8px",
                  fontWeight: 600,
                }}>
                  AI offline — using question bank
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {displayTopics.map(t => (
                <button
                  key={t}
                  onClick={() => { setTopic(t); setError(""); setOfflineTopics(null); }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: `1px solid ${topic === t ? "var(--accent)" : offlineTopics ? "rgba(245,158,11,0.4)" : "var(--border2)"}`,
                    background: topic === t ? "rgba(79,142,247,0.15)" : offlineTopics ? "rgba(245,158,11,0.08)" : "var(--bg3)",
                    color: topic === t ? "var(--accent)" : offlineTopics ? "var(--gold)" : "var(--text2)",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    transition: "all 0.2s",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="form-group">
            <label>Difficulty</label>
            <div style={{ display: "flex", gap: 12 }}>
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "var(--radius)",
                    border: `2px solid ${difficulty === d ? difficultyColors[d] : "var(--border2)"}`,
                    background: difficulty === d ? `${difficultyColors[d]}18` : "var(--bg2)",
                    color: difficulty === d ? difficultyColors[d] : "var(--text2)",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    transition: "all 0.2s",
                  }}
                >
                  {d === "Easy" ? "🟢" : d === "Medium" ? "🟡" : "🔴"} {d}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div className="form-group">
            <label>
              Number of Questions:{" "}
              <span style={{ color: "var(--accent)", fontWeight: 700 }}>{numberOfQuestions}</span>
            </label>
            <div style={{ padding: "8px 0" }}>
              <input
                type="range" min="3" max="10" value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(e.target.value)}
                style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer", height: 6 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
                <span>3</span><span>5</span><span>7</span><span>10</span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && !offlineTopics && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5",
              padding: "14px 18px",
              borderRadius: "var(--radius)",
              fontSize: 13,
              marginBottom: 20,
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Summary Preview */}
          {topic && (
            <div style={{
              background: "var(--bg2)",
              border: "1px solid var(--border2)",
              borderRadius: "var(--radius)",
              padding: "16px 20px",
              marginBottom: 24,
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
            }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>Topic</div>
                <div style={{ fontWeight: 700, color: "var(--text)" }}>{topic}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>Difficulty</div>
                <div style={{ fontWeight: 700, color: difficultyColors[difficulty] }}>{difficulty}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>Questions</div>
                <div style={{ fontWeight: 700, color: "var(--text)" }}>{numberOfQuestions}</div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateQuiz}
            disabled={loading}
            className="btn btn-primary"
            style={{ opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer", gap: 10 }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 18, height: 18,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  flexShrink: 0,
                }} />
                Generating Quiz...
              </>
            ) : "⚡ Generate Quiz"}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default QuizSetupPage;
