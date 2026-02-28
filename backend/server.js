const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ================= CORS =================
const allowedOrigins = [
  "http://localhost:3000",
  "https://firstgen-ai.onrender.com" // ✅ only frontend needed
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("Blocked origin:", origin);
      return callback(new Error("CORS blocked: " + origin));
    }
  },
  credentials: true
}));

// 🔥 Handle preflight manually (important for Render)
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://firstgen-ai.onrender.com");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

// ============== MIDDLEWARE ==============
app.use(express.json());

