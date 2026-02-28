const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  day: { type: String },
  duration: { type: String },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  locked: { type: Boolean, default: false },
  phase: { type: String },
});

const plannerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
  weeklySchedule: [taskSchema],
}, { timestamps: true });

module.exports = mongoose.model('Planner', plannerSchema);
