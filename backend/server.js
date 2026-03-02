// server.js
const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");

const app = express(); // ✅ CREATE APP FIRST

// ================= CORS =================
app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
  })
);

// ============== MIDDLEWARE ==============
app.use(express.json());

// ============== ROUTES ==============
app.use("/api/roadmap", require("./routes/Courseprogress"));

app.use("/api/quiz",    require("./routes/quiz"));
app.use("/api/ai",      require("./routes/ai"));
app.use("/api/auth",    require("./routes/auth"));
app.use("/api/user",    require("./routes/user"));
app.use("/api/roadmap", require("./routes/roadmap"));
app.use("/api/roadmap", require("./routes/roadmapcourse")); // ← NEW: course generation
app.use("/api/planner", require("./routes/planner"));
app.use("/api/chat",    require("./routes/chat"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/ai",      require("./routes/explainRoute"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ============== PORT (Render Safe) ==============
const PORT = process.env.PORT || 5000;

// ============== DB CONNECT ==============
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });