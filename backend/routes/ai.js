const express = require('express');
const router = express.Router();
const { generateRoadmap } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { generateQuiz } = require('../controllers/quizaiController');
router.post('/generate-roadmap', protect, generateRoadmap);
router.post('/generate-quiz', protect, generateQuiz);
module.exports = router;
