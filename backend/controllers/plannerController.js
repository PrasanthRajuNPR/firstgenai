const Planner = require('../models/Planner');
const User = require('../models/User');

const getPlannerByRoadmap = async (req, res) => {
  try {
    const planner = await Planner.findOne({ roadmapId: req.params.roadmapId, userId: req.user._id });
    if (!planner) return res.status(404).json({ message: 'Planner not found' });
    res.json(planner);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch planner' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { plannerId, taskId } = req.params;
    const { completed } = req.body;

    const planner = await Planner.findOne({ _id: plannerId, userId: req.user._id });
    if (!planner) return res.status(404).json({ message: 'Planner not found' });

    const task = planner.weeklySchedule.id(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // 12-hour lock check
    if (task.locked) {
      return res.status(403).json({ message: 'Editing window expired' });
    }

    if (task.completedAt) {
      const hoursSince = (Date.now() - new Date(task.completedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSince >= 12) {
        task.locked = true;
        await planner.save();
        return res.status(403).json({ message: 'Editing window expired' });
      }
    }

    task.completed = completed;
    if (completed) {
      task.completedAt = new Date();

      // Update streak
      const user = await User.findById(req.user._id);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!user.lastActiveDate) {
        user.currentStreak = 1;
      } else {
        const last = new Date(user.lastActiveDate);
        last.setHours(0, 0, 0, 0);
        const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // Same day, no change
        } else if (diffDays === 1) {
          user.currentStreak += 1;
        } else {
          user.currentStreak = 1;
        }
      }
      user.lastActiveDate = new Date();
      await user.save();
    } else {
      task.completedAt = null;
    }

    await planner.save();
    res.json({ planner, streak: req.user.currentStreak });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

const getProgress = async (req, res) => {
  try {
    const planners = await Planner.find({ userId: req.user._id });
    let totalTasks = 0;
    let completedTasks = 0;
    const completedTopics = [];

    planners.forEach(planner => {
      planner.weeklySchedule.forEach(task => {
        totalTasks++;
        if (task.completed) {
          completedTasks++;
          completedTopics.push(task.title);
        }
      });
    });

    const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      totalTasks,
      completedTasks,
      completionPct,
      completedTopics,
      currentStreak: req.user.currentStreak,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
};

module.exports = { getPlannerByRoadmap, updateTask, getProgress };
