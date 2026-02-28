const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, branch, year, goal, dailyStudyTime, skillLevel } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, branch, year, goal, dailyStudyTime, skillLevel },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

module.exports = router;
