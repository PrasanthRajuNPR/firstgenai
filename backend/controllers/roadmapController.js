const Roadmap = require('../models/Roadmap');
const Planner = require('../models/Planner');

const getUserRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Attach completion % from planner
    const roadmapsWithProgress = await Promise.all(
      roadmaps.map(async (roadmap) => {
        const planner = await Planner.findOne({ roadmapId: roadmap._id });
        let completionPct = 0;
        if (planner && planner.weeklySchedule.length > 0) {
          const done = planner.weeklySchedule.filter(t => t.completed).length;
          completionPct = Math.round((done / planner.weeklySchedule.length) * 100);
        }
        return { ...roadmap.toObject(), completionPct };
      })
    );

    res.json(roadmapsWithProgress);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch roadmaps' });
  }
};

const getRoadmapById = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user._id });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
    res.json(roadmap);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch roadmap' });
  }
};

module.exports = { getUserRoadmaps, getRoadmapById };
