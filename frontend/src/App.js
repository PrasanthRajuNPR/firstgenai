// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage  from './pages/DashboardPage';
import RoadmapPage    from './pages/RoadmapPage';
import RoadmapCourse  from './pages/RoadmapCourse';   // ← NEW
import PlannerPage    from './pages/PlannerPage';
import ProgressPage   from './pages/ProgressPage';
import ChatPage       from './pages/ChatPage';
import Courses        from './pages/Courses';
import CourseDetail   from './pages/CourseDetail';
import PDFReader      from './pages/PDFReader'; 
import QuizSetupPage  from './pages/QuizSetupPage ';  // preserve your spacing
import QuizPage       from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';
import QuizHistoryPage from './pages/QuizHistoryPage';

import ChatWidget from './ChatWidget';
import './index.css';

/* ── Route guards ── */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (user)    return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth */}
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Onboarding */}
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

      {/* Core */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/roadmap"   element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />

      {/* ── NEW: Roadmap → Full Course viewer ── */}
      <Route
        path="/roadmap/:roadmapId/course"
        element={<ProtectedRoute><RoadmapCourse /></ProtectedRoute>}
      />

      <Route path="/planner/:roadmapId" element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
      <Route path="/progress"           element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
      <Route path="/chat"               element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

      {/* Courses */}
      <Route path="/courses"          element={<ProtectedRoute><Courses /></ProtectedRoute>} />
      <Route path="/course/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />

      {/* Tools */}
      <Route path="/pdf-reader" element={<PDFReader />} />

      {/* Quiz */}
      <Route path="/quiz-setup"    element={<ProtectedRoute><QuizSetupPage /></ProtectedRoute>} />
      <Route path="/quiz"          element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
      <Route path="/quiz-result"   element={<ProtectedRoute><QuizResultPage /></ProtectedRoute>} />
      <Route path="/quiz-history"  element={<ProtectedRoute><QuizHistoryPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ChatWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}