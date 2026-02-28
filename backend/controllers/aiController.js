const axios = require('axios');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const Planner = require('../models/Planner');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Fallback roadmap remains the same
const getFallbackRoadmap = (profile) => ({
  title: `${profile.branch} Engineering Roadmap - ${profile.goal}`,
  phases: [
    {
      title: 'Foundation Phase',
      timeline: 'Weeks 1-4',
      topics: ['Core Mathematics', 'Programming Fundamentals', 'Problem Solving Basics', 'Data Structures Introduction'],
      resources: ['NPTEL lectures', 'GeeksforGeeks', 'YouTube tutorials'],
    },
    // ... rest of your phases
  ],
});

/**
 * NEW: Unified Gemini API Call
 * Using Gemini 2.5 Flash for high performance and native JSON mode.
 */
const callGeminiAPI = async (profile) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  // Using v1beta for stable JSON Schema support
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = `Create a structured learning roadmap for a engineering student.
  Profile: Branch ${profile.branch}, Year ${profile.year}, Goal ${profile.goal}.
  Provide a clear path with 3-4 phases.`;

  try {
    const response = await axios.post(API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        response_mime_type: "application/json",
        // STOPS TRUNCATION: Explicitly define the schema so the AI doesn't waste tokens
        response_schema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            phases: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  timeline: { type: "STRING" },
                  topics: { type: "ARRAY", items: { type: "STRING" } },
                  resources: { type: "ARRAY", items: { type: "STRING" } }
                },
                required: ["title", "timeline", "topics", "resources"]
              }
            }
          },
          required: ["title", "phases"]
        },
        temperature: 0.2, // Lower temp = less rambling = less truncation
        maxOutputTokens: 2000, 
      }
    });

    const resultText = response.data.candidates[0].content.parts[0].text;
    
    // Recovery Logic: If the string is still unterminated, we catch it here
    try {
      return JSON.parse(resultText);
    } catch (parseError) {
      // If AI fails at the very last bracket, this manually closes the JSON
      if (resultText.trim().endsWith('"')) return JSON.parse(resultText + ' ] } ] }');
      throw parseError;
    }
  } catch (error) {
    console.error("Gemini Critical Error:", error.response?.data || error.message);
    throw error;
  }
};
const generatePlanner = (userId, roadmapId, phases, dailyStudyTime) => {
  const tasks = [];
  const allTopics = [];

  phases.forEach(phase => {
    phase.topics.forEach(topic => {
      allTopics.push({ topic, phase: phase.title });
    });
  });

  allTopics.forEach((item, index) => {
    const day = DAYS[index % 7];
    tasks.push({
      title: item.topic,
      day,
      duration: dailyStudyTime || '2 hours',
      completed: false,
      completedAt: null,
      locked: false,
      phase: item.phase,
    });
  });

  return { userId, roadmapId, weeklySchedule: tasks };
};

const generateRoadmap = async (req, res) => {
  try {
    const { branch, year, goal, dailyStudyTime, skillLevel } = req.body;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
      branch, year, goal, dailyStudyTime, skillLevel, onboardingComplete: true,
    });

    const profile = { branch, year, goal, dailyStudyTime, skillLevel };

    let roadmapData;
    let aiUsed = true;

    try {
      // Use the new Gemini call
      roadmapData = await callGeminiAPI(profile);

      if (!roadmapData || !roadmapData.phases || !Array.isArray(roadmapData.phases)) {
        throw new Error('Invalid AI response structure');
      }
    } catch (aiError) {
      console.warn('Gemini generation failed, using fallback:', aiError.message);
      roadmapData = getFallbackRoadmap(profile);
      aiUsed = false;
    }

    const roadmap = await Roadmap.create({
      userId,
      title: roadmapData.title,
      goal,
      branchSnapshot: branch,
      phases: roadmapData.phases,
    });

    const plannerData = generatePlanner(userId, roadmap._id, roadmapData.phases, dailyStudyTime);
    const planner = await Planner.create(plannerData);

    res.status(201).json({
      message: 'Roadmap and planner generated successfully',
      roadmap,
      planner,
      aiUsed,
    });
  } catch (err) {
    console.error('generateRoadmap error:', err);
    res.status(500).json({ message: 'Failed to generate roadmap', error: err.message });
  }
};

module.exports = { generateRoadmap };