const Quiz = require("../models/Quiz");
const Result = require("../models/Result");

// ─── SUBMIT QUIZ ─────────────────────────────────────────────────────────────
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    if (!quizId || answers === undefined) {
      return res.status(400).json({ message: "quizId and answers are required" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.answer || answers[String(i)] === q.answer) score++;
    });

    await Result.create({
      userId: req.user._id || req.user.id,
      quizId,
      score,
      totalQuestions: quiz.questions.length,
    });

    res.json({
      score,
      total: quiz.questions.length,
      percentage: Math.round((score / quiz.questions.length) * 10000) / 100,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
    });
  } catch (err) {
    console.error("submitQuiz error:", err);
    res.status(500).json({ message: "Quiz submission failed", error: err.message });
  }
};

// ─── QUIZ HISTORY + ANALYTICS ────────────────────────────────────────────────
exports.getQuizHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Fetch last 50 results with quiz details
    const results = await Result.find({ userId })
      .populate("quizId", "topic difficulty questions")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    if (results.length === 0) {
      return res.json({ results: [], analytics: null });
    }

    // ── Build per-topic stats ────────────────────────────────────────────────
    const topicMap = {};
    results.forEach((r) => {
      const topic = r.quizId?.topic || "Unknown";
      const pct = Math.round((r.score / r.totalQuestions) * 100);
      if (!topicMap[topic]) {
        topicMap[topic] = { topic, attempts: 0, totalScore: 0, totalQuestions: 0, best: 0, scores: [] };
      }
      topicMap[topic].attempts++;
      topicMap[topic].totalScore += r.score;
      topicMap[topic].totalQuestions += r.totalQuestions;
      topicMap[topic].best = Math.max(topicMap[topic].best, pct);
      topicMap[topic].scores.push(pct);
    });

    const topicStats = Object.values(topicMap).map((t) => ({
      topic: t.topic,
      attempts: t.attempts,
      avgScore: Math.round(t.totalScore / t.totalQuestions * 100),
      bestScore: t.best,
      trend: t.scores.length >= 2
        ? t.scores[0] - t.scores[t.scores.length - 1] // positive = improving (newest first)
        : 0,
    }));

    // ── Overall analytics ────────────────────────────────────────────────────
    const totalAttempts = results.length;
    const totalScore = results.reduce((s, r) => s + r.score, 0);
    const totalQuestions = results.reduce((s, r) => s + r.totalQuestions, 0);
    const overallAvg = Math.round((totalScore / totalQuestions) * 100);
    const bestResult = results.reduce((best, r) => {
      const pct = (r.score / r.totalQuestions) * 100;
      return pct > (best.score / best.totalQuestions) * 100 ? r : best;
    });

    // ── Weekly activity (last 7 days) ────────────────────────────────────────
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
      const dayStr = d.toLocaleDateString("en-IN", { weekday: "short" });
      const count = results.filter((r) => {
        const rd = new Date(r.createdAt);
        return rd.toDateString() === d.toDateString();
      }).length;
      return { day: dayStr, count };
    });

    // ── Difficulty breakdown ─────────────────────────────────────────────────
    const diffMap = { Easy: { attempts: 0, totalPct: 0 }, Medium: { attempts: 0, totalPct: 0 }, Hard: { attempts: 0, totalPct: 0 } };
    results.forEach((r) => {
      const diff = r.quizId?.difficulty || "Medium";
      if (diffMap[diff]) {
        diffMap[diff].attempts++;
        diffMap[diff].totalPct += (r.score / r.totalQuestions) * 100;
      }
    });
    const difficultyBreakdown = Object.entries(diffMap).map(([label, d]) => ({
      label,
      attempts: d.attempts,
      avgScore: d.attempts ? Math.round(d.totalPct / d.attempts) : 0,
    }));

    // ── Streak calculation ───────────────────────────────────────────────────
    const uniqueDays = [...new Set(results.map((r) => new Date(r.createdAt).toDateString()))];
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (uniqueDays.includes(today) || uniqueDays.includes(yesterday)) {
      let check = new Date();
      if (!uniqueDays.includes(today)) check = new Date(Date.now() - 86400000);
      while (uniqueDays.includes(check.toDateString())) {
        streak++;
        check = new Date(check - 86400000);
      }
    }

    // ── Formatted results for the table ─────────────────────────────────────
    const formattedResults = results.map((r) => ({
      _id: r._id,
      topic: r.quizId?.topic || "Unknown",
      difficulty: r.quizId?.difficulty || "Medium",
      score: r.score,
      totalQuestions: r.totalQuestions,
      percentage: Math.round((r.score / r.totalQuestions) * 100),
      createdAt: r.createdAt,
    }));

    res.json({
      results: formattedResults,
      analytics: {
        totalAttempts,
        overallAvg,
        streak,
        bestTopic: topicStats.sort((a, b) => b.avgScore - a.avgScore)[0]?.topic || "-",
        topicStats,
        weeklyActivity,
        difficultyBreakdown,
        recentTrend: results.slice(0, 5).map((r) => Math.round((r.score / r.totalQuestions) * 100)),
      },
    });
  } catch (err) {
    console.error("getQuizHistory error:", err);
    res.status(500).json({ message: "Failed to fetch quiz history", error: err.message });
  }
};
