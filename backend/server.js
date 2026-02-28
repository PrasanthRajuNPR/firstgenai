const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:3000",
  "https://firstgenai.onrender.com",
  "https://eduempower.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const app = express();

app.use(cors());
app.use(express.json());
const quizRoutes = require("./routes/quiz");


app.use("/api/quiz", quizRoutes);
const aiRoutes = require("./routes/ai");
app.use("/api/ai", aiRoutes);
// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
// app.use('/api/ai', require('./routes/ai'));
app.use('/api/roadmap', require('./routes/roadmap'));
app.use('/api/planner', require('./routes/planner'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/courses', require('./routes/courseRoutes'));
const explainRoute = require("./routes/explainRoute");
app.use("/api/ex-ai", explainRoute);
// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001; // ✅ Changed to 3001 to match frontend AuthContext baseURL

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });