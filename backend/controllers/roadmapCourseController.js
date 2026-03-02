// controllers/roadmapCourseController.js
const axios = require('axios');
const Roadmap = require('../models/Roadmap');
const RoadmapCourse = require('../models/RoadmapCourse');

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const safeParseJSON = (raw) => {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned);
};

// ─── YOUTUBE DATA API v3 ──────────────────────────────────────────────────────
// Searches YouTube for a lesson topic and returns a verified embed URL.
// Falls back through multiple search queries before giving up.

const searchYouTubeVideo = async (lessonTitle, phaseName) => {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  if (!YOUTUBE_API_KEY) {
    console.warn('[YouTube] YOUTUBE_API_KEY not set — skipping video search');
    return '';
  }

  // Build progressively broader search queries
  const queries = [
    `${lessonTitle} tutorial for beginners`,
    `${lessonTitle} ${phaseName} tutorial`,
    `${lessonTitle} explained programming`,
    `${lessonTitle} course`,
  ];

  // Trusted educational channels to prefer (channelId filter)
  // We search broadly and just pick the top result — YouTube's ranking already
  // favours well-known educational channels for technical queries
  for (const q of queries) {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q,
          type: 'video',
          videoEmbeddable: 'true',          // only videos that allow embedding
          videoCategoryId: '27',            // Education category
          maxResults: 5,
          relevanceLanguage: 'en',
          safeSearch: 'strict',
          key: YOUTUBE_API_KEY,
        },
        timeout: 8000,
      });

      const items = response.data.items || [];

      // Pick the first embeddable result with a valid videoId
      for (const item of items) {
        const videoId = item.id?.videoId;
        if (videoId && videoId.length === 11) {
          console.log(`[YouTube] ✓ "${lessonTitle}" → https://www.youtube.com/embed/${videoId} (${item.snippet?.channelTitle})`);
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // If Education category returned nothing, retry without category filter
      if (response.data.items?.length === 0) {
        const retry = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            q,
            type: 'video',
            videoEmbeddable: 'true',
            maxResults: 3,
            relevanceLanguage: 'en',
            key: YOUTUBE_API_KEY,
          },
          timeout: 8000,
        });

        for (const item of retry.data.items || []) {
          const videoId = item.id?.videoId;
          if (videoId && videoId.length === 11) {
            console.log(`[YouTube] ✓ "${lessonTitle}" (retry) → ${videoId}`);
            return `https://www.youtube.com/embed/${videoId}`;
          }
        }
      }
    } catch (err) {
      // Quota exceeded or network error — stop trying YouTube
      if (err.response?.status === 403) {
        console.warn('[YouTube] API quota exceeded or key invalid — skipping remaining searches');
        return '';
      }
      console.warn(`[YouTube] Search failed for "${q}":`, err.message);
    }
  }

  console.warn(`[YouTube] No video found for lesson: "${lessonTitle}"`);
  return '';
};

// Fetch YouTube videos for all lessons concurrently, with rate limiting
// YouTube free quota: 10,000 units/day. Each search = 100 units.
// Max ~100 searches/day on free tier. We batch to stay safe.
const attachYouTubeVideos = async (phases) => {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  if (!YOUTUBE_API_KEY) return phases; // skip gracefully if no key

  // Collect all lessons flat
  const allLessons = [];
  phases.forEach((phase, pi) => {
    phase.lessons.forEach((lesson, li) => {
      allLessons.push({ pi, li, lesson, phase });
    });
  });

  console.log(`[YouTube] Fetching videos for ${allLessons.length} lessons...`);

  // Process in batches of 5 concurrent requests to avoid hammering the API
  const BATCH_SIZE = 5;
  for (let i = 0; i < allLessons.length; i += BATCH_SIZE) {
    const batch = allLessons.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async ({ pi, li, lesson, phase }) => {
        const url = await searchYouTubeVideo(lesson.title, phase.title);
        phases[pi].lessons[li].videoUrl = url;
      })
    );
    // Small delay between batches to be polite to the API
    if (i + BATCH_SIZE < allLessons.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  console.log('[YouTube] ✓ Video attachment complete');
  return phases;
};

// ─── AI PROMPT — no video URLs, just structure ────────────────────────────────
// Key change: we removed the videoUrl instruction entirely.
// AI just generates titles, descriptions, notes, cheatsheets, resources.
// Real YouTube URLs are fetched separately via YouTube Data API.

const buildPrompt = (roadmap) => {
  const phaseList = roadmap.phases
    .map((p, i) => {
      const topics = (p.topics || []).join(', ') || 'general topics';
      return `Phase ${i + 1} — "${p.title}" (${p.timeline || ''}): ${topics}`;
    })
    .join('\n');

  return `You are an expert curriculum designer for engineering students. Convert this learning roadmap into a structured course.

ROADMAP TITLE: ${roadmap.title}
GOAL: ${roadmap.goal || 'Engineering excellence'}
BRANCH: ${roadmap.branchSnapshot || 'Computer Science'}

PHASES:
${phaseList}

RULES:
1. Each topic becomes exactly ONE lesson.
2. Lessons within each phase go beginner → advanced.
3. DO NOT include any videoUrl — videos will be sourced separately.
4. cheatsheet uses this markdown format (\\n for newlines):
   "### Key Concepts\\n- Point one\\n- Point two\\n### Syntax / Commands\\n\`example code\`\\n### Remember\\n- Important tip"
5. notes = 2-3 plain sentences of key learning points for this lesson.
6. resources = 1-2 objects: { "title": "...", "url": "..." } — use real official docs or cheatsheet sites.

Respond ONLY with valid JSON. No markdown fences, no explanation:

{
  "title": "Course title",
  "description": "One sentence description",
  "phases": [
    {
      "id": "phase-1",
      "title": "Phase title",
      "lessons": [
        {
          "id": "lesson-1-1",
          "title": "Lesson title — be specific e.g. 'JavaScript Arrays & Loops' not just 'Arrays'",
          "phase": "Phase title",
          "description": "1-2 sentences of what this lesson covers.",
          "notes": "2-3 sentences of key learning points and why they matter.",
          "cheatsheet": "### Key Concepts\\n- Point one\\n- Point two\\n### Remember\\n- Important tip",
          "resources": [
            { "title": "Official Docs", "url": "https://developer.mozilla.org" }
          ]
        }
      ]
    }
  ]
}`;
};

// ─── STRATEGY 1: GROQ ────────────────────────────────────────────────────────

const callGroq = async (prompt) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set in .env');

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a curriculum designer. Respond ONLY with valid JSON. No markdown fences, no text outside the JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 8000,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  return safeParseJSON(response.data.choices[0].message.content);
};

// ─── STRATEGY 2: GEMINI FALLBACK ─────────────────────────────────────────────

const callGemini = async (prompt) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set in .env');

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 8000 },
    },
    { timeout: 60000 }
  );

  return safeParseJSON(response.data.candidates[0].content.parts[0].text);
};

// ─── SANITISE AI OUTPUT ───────────────────────────────────────────────────────

const sanitiseCourse = (data) => {
  if (!data || !Array.isArray(data.phases)) {
    throw new Error('AI returned invalid structure — no phases array');
  }
  data.phases = data.phases.map((phase, pi) => ({
    id:      phase.id    || `phase-${pi + 1}`,
    title:   phase.title || `Phase ${pi + 1}`,
    lessons: (Array.isArray(phase.lessons) ? phase.lessons : []).map((lesson, li) => ({
      id:          lesson.id          || `lesson-${pi + 1}-${li + 1}`,
      title:       lesson.title       || `Lesson ${li + 1}`,
      phase:       lesson.phase       || phase.title,
      description: lesson.description || '',
      videoUrl:    '',  // will be filled by YouTube API
      notes:       lesson.notes       || '',
      cheatsheet:  lesson.cheatsheet  || '',
      resources:   Array.isArray(lesson.resources) ? lesson.resources : [],
    })),
  }));
  return data;
};

// ─── CONTROLLERS ─────────────────────────────────────────────────────────────

// GET /api/roadmap/:roadmapId/course
const getCourse = async (req, res) => {
  try {
    const course = await RoadmapCourse.findOne({
      roadmapId: req.params.roadmapId,
      userId: req.user._id,
    });

    if (!course) return res.status(404).json({ message: 'Course not generated yet' });

    res.json({ course });
  } catch (err) {
    console.error('[Course] getCourse error:', err);
    res.status(500).json({ message: 'Failed to fetch course' });
  }
};

// POST /api/roadmap/:roadmapId/course/generate
const generateCourse = async (req, res) => {
  try {
    // 1. Load roadmap
    const roadmap = await Roadmap.findOne({
      _id: req.params.roadmapId,
      userId: req.user._id,
    });

    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
    if (!roadmap.phases?.length) return res.status(400).json({ message: 'Roadmap has no phases' });

    // 2. Delete existing course (allow regeneration)
    await RoadmapCourse.deleteOne({ roadmapId: req.params.roadmapId, userId: req.user._id });

    // 3. Generate course structure with AI (no video URLs)
    let courseData = null;
    let aiUsed = '';

    try {
      console.log('[Course] Generating structure with Groq...');
      courseData = await callGroq(buildPrompt(roadmap));
      aiUsed = 'groq';
      console.log('[Course] ✓ Groq succeeded');
    } catch (groqErr) {
      console.warn('[Course] Groq failed:', groqErr.message);
      try {
        console.log('[Course] Falling back to Gemini...');
        courseData = await callGemini(buildPrompt(roadmap));
        aiUsed = 'gemini';
        console.log('[Course] ✓ Gemini succeeded');
      } catch (geminiErr) {
        console.error('[Course] Both AI providers failed');
        return res.status(503).json({
          message: 'AI service unavailable. Please try again shortly.',
        });
      }
    }

    // 4. Sanitise AI output
    courseData = sanitiseCourse(courseData);

    // 5. Fetch REAL YouTube video URLs via YouTube Data API v3
    //    This replaces the hallucinated URLs the AI would have generated.
    courseData.phases = await attachYouTubeVideos(courseData.phases);

    // 6. Save to MongoDB
    const saved = await RoadmapCourse.create({
      roadmapId:   req.params.roadmapId,
      userId:      req.user._id,
      title:       courseData.title       || roadmap.title,
      description: courseData.description || '',
      phases:      courseData.phases,
    });

    const totalLessons = saved.phases.reduce((n, p) => n + p.lessons.length, 0);
    const withVideo    = saved.phases.reduce((n, p) => n + p.lessons.filter(l => l.videoUrl).length, 0);
    console.log(`[Course] ✓ Saved "${saved.title}" (${aiUsed}) — ${totalLessons} lessons, ${withVideo} with videos`);

    res.status(201).json({ course: saved, aiUsed });
  } catch (err) {
    console.error('[Course] generateCourse error:', err);
    res.status(500).json({ message: 'Failed to generate course', error: err.message });
  }
};

// DELETE /api/roadmap/:roadmapId/course
const deleteCourse = async (req, res) => {
  try {
    await RoadmapCourse.deleteOne({ roadmapId: req.params.roadmapId, userId: req.user._id });
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('[Course] deleteCourse error:', err);
    res.status(500).json({ message: 'Failed to delete course' });
  }
};

module.exports = { getCourse, generateCourse, deleteCourse };