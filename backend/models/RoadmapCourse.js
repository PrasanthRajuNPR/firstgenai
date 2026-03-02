// models/RoadmapCourse.js
const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  id:          { type: String, required: true },
  title:       { type: String, required: true },
  phase:       { type: String, default: '' },
  description: { type: String, default: '' },
  videoUrl:    { type: String, default: '' },
  notes:       { type: String, default: '' },
  cheatsheet:  { type: String, default: '' },
  resources:   [{ title: String, url: String }],
  // ── Progress tracking (write-once: once true, never reverts to false) ──
  completed:   { type: Boolean, default: false },
  completedAt: { type: Date,    default: null  },
}, { _id: false });

const phaseSchema = new mongoose.Schema({
  id:      { type: String, required: true },
  title:   { type: String, required: true },
  lessons: [lessonSchema],
}, { _id: false });

const roadmapCourseSchema = new mongoose.Schema({
  roadmapId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  title:       { type: String, default: '' },
  description: { type: String, default: '' },
  phases:      [phaseSchema],
}, { timestamps: true });

// One course per roadmap per user
roadmapCourseSchema.index({ roadmapId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('RoadmapCourse', roadmapCourseSchema);