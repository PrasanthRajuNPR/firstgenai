const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
    getAllCourses, 
    capturePayment, 
    verifySignature 
} = require('../controllers/courseController');

router.get('/', getAllCourses);
router.post('/capturePayment', protect, capturePayment);
router.post('/verifySignature', protect, verifySignature);

module.exports = router;
// courseRoutes.js — No changes needed, already correct