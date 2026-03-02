// routes/courseProgress.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const RoadmapCourse = require('../models/RoadmapCourse');

// PATCH /api/roadmap/:roadmapId/course/progress
// Body: { lessonId: "lesson-1-1", completed: true }
// Saves lesson completion to DB. Once completed=true it cannot be reversed.
router.patch('/:roadmapId/course/progress', protect, async (req, res) => {
  try {
    const { lessonId, completed } = req.body;
    if (!lessonId || completed === undefined) {
      return res.status(400).json({ message: 'lessonId and completed are required' });
    }

    const course = await RoadmapCourse.findOne({
      roadmapId: req.params.roadmapId,
      userId: req.user._id,
    });

    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Find the lesson across all phases and mark it completed
    // Once completed it stays completed — never allow reverting to false
    let found = false;
    for (const phase of course.phases) {
      for (const lesson of phase.lessons) {
        if (lesson.id === lessonId) {
          // Only allow marking completed, never un-completing
          if (completed === true) {
            lesson.completed = true;
            lesson.completedAt = lesson.completedAt || new Date();
          }
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) return res.status(404).json({ message: 'Lesson not found' });

    course.markModified('phases');
    await course.save();

    // Return counts for progress page use
    const totalLessons   = course.phases.reduce((n, p) => n + p.lessons.length, 0);
    const doneLessons    = course.phases.reduce((n, p) => n + p.lessons.filter(l => l.completed).length, 0);

    res.json({
      message: 'Progress saved',
      lessonId,
      totalLessons,
      doneLessons,
      percentComplete: totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0,
    });
  } catch (err) {
    console.error('[Progress] patch error:', err);
    res.status(500).json({ message: 'Failed to save progress' });
  }
});

module.exports = router;