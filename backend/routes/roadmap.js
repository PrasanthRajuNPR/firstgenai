const express = require('express');
const router = express.Router();
const { getUserRoadmaps, getRoadmapById } = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getUserRoadmaps);
router.get('/:id', protect, getRoadmapById);

module.exports = router;
 