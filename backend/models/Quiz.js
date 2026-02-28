const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true
  },

  difficulty: {
    type: String,
    required: true
  },

  questions: [
    {
      question: String,
      options: [String],
      answer: String
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Quiz", quizSchema);

