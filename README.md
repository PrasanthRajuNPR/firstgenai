# EduEmpower 🎓
### AI-Powered Learning Companion for Engineering Students

A full-stack MERN application that generates personalized AI roadmaps, auto-builds weekly planners, and tracks your learning journey.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Anthropic API key (or OpenAI)

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

**Required `.env` values:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/eduempower
JWT_SECRET=your_strong_secret_here
ANTHROPIC_API_KEY=sk-ant-...        # Get from console.anthropic.com
AI_PROVIDER=anthropic
```

> **Using OpenAI instead?** Set `AI_PROVIDER=openai` and `OPENAI_API_KEY=sk-...`

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:5000`

---

## 🏗️ Architecture

```
eduempower/
├── backend/
│   ├── server.js              # Express entry point
│   ├── models/
│   │   ├── User.js            # User with streak tracking
│   │   ├── Roadmap.js         # AI-generated phases
│   │   ├── Planner.js         # Weekly task schedule
│   │   └── Chat.js            # Chat history per user
│   ├── controllers/
│   │   ├── authController.js  # Register, login, getMe
│   │   ├── aiController.js    # Core AI pipeline
│   │   ├── roadmapController.js
│   │   ├── plannerController.js # Task complete + streak + lock
│   │   └── chatController.js
│   ├── routes/               # Express routers
│   └── middleware/
│       └── auth.js            # JWT protect middleware
└── frontend/
    └── src/
        ├── context/AuthContext.js  # Global auth + Axios
        ├── pages/
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── OnboardingPage.js   # 🚀 Main AI trigger
        │   ├── DashboardPage.js
        │   ├── RoadmapPage.js
        │   ├── PlannerPage.js      # Task completion + locks
        │   ├── ProgressPage.js     # Read-only stats
        │   └── ChatPage.js         # EduBot chat
        └── components/
            └── Layout.js           # Sidebar navigation
```

---

## 🔄 Core Pipeline

```
Register/Login → Onboarding Form
                      ↓
              POST /api/ai/generate-roadmap
                      ↓
         1. Update user profile in MongoDB
         2. Call Anthropic/OpenAI API
         3. Parse & validate JSON roadmap
         4. Save Roadmap to MongoDB
         5. Auto-generate Planner from topics
         6. Save Planner linked to Roadmap
                      ↓
              Redirect to Dashboard
```

---

## 🔐 Key Features

### 12-Hour Edit Lock
- Mark task complete → `completedAt` timestamp set
- Backend checks: `(now - completedAt) >= 12h` → `locked = true`
- Locked tasks return `403: "Editing window expired"`

### Streak System
- Complete any task → backend checks `lastActiveDate`
- Yesterday → `streak++`
- Today → no change
- Gap > 1 day → `streak = 1`

### AI Fallback
- If AI API fails → serves a static 3-phase roadmap template
- User still gets a complete planner immediately

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✓ | Get current user |
| POST | `/api/ai/generate-roadmap` | ✓ | Full AI pipeline |
| GET | `/api/roadmap` | ✓ | All user roadmaps |
| GET | `/api/roadmap/:id` | ✓ | Single roadmap |
| GET | `/api/planner/:roadmapId` | ✓ | Planner for roadmap |
| PATCH | `/api/planner/:pid/task/:tid` | ✓ | Update task |
| GET | `/api/planner/progress` | ✓ | Overall progress stats |
| POST | `/api/chat` | ✓ | Send chat message |
| GET | `/api/chat/history` | ✓ | Chat history |

---

## 🎨 Design System

- **Dark theme** with blue/purple/green accent palette
- **Syne** (display) + **DM Sans** (body) typefaces
- Responsive with mobile-first sidebar collapse
- CSS custom properties for consistent theming
