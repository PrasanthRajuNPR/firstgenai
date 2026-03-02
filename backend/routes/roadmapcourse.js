// routes/roadmapCourse.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCourse, generateCourse, deleteCourse } = require('../controllers/roadmapCourseController');

// GET    /api/roadmap/:roadmapId/course           — fetch stored course
// POST   /api/roadmap/:roadmapId/course/generate  — AI generate + save course
// DELETE /api/roadmap/:roadmapId/course           — delete so user can regenerate

router.get('/:roadmapId/course',           protect, getCourse);
router.post('/:roadmapId/course/generate', protect, generateCourse);
router.delete('/:roadmapId/course',        protect, deleteCourse);

module.exports = router;