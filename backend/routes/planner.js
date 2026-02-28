const express = require('express');
const router = express.Router();
const { getPlannerByRoadmap, updateTask, getProgress } = require('../controllers/plannerController');
const { protect } = require('../middleware/auth');

router.get('/progress', protect, getProgress);
router.get('/:roadmapId', protect, getPlannerByRoadmap);
router.patch('/:plannerId/task/:taskId', protect, updateTask);

module.exports = router;
 