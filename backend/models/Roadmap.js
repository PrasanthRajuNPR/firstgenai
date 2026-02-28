const mongoose = require('mongoose');

const phaseSchema = new mongoose.Schema({
  title: String,
  timeline: String,
  topics: [String],
  resources: [String],
});

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  goal: { type: String },
  branchSnapshot: { type: String },
  phases: [phaseSchema],
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
