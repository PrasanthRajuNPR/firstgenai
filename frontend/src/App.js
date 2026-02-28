import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import RoadmapPage from './pages/RoadmapPage';
import PlannerPage from './pages/PlannerPage';
import ProgressPage from './pages/ProgressPage';
import ChatPage from './pages/ChatPage';
import './index.css';
import Courses from './pages/Courses';
import CourseDetail from "./pages/CourseDetail";
import PDFReader from "./pages/PDFReader"
import QuizSetupPage from "./pages/QuizSetupPage "
import QuizPage from "./pages/QuizPage";
import QuizResultPage from "./pages/QuizResultPage";
import QuizHistoryPage from "./pages/QuizHistoryPage";
import ChatWidget from "./ChatWidget";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
      <Route path="/planner/:roadmapId" element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      {/* FIX: Route path changed to lowercase "/courses" for consistency */}
      <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
      {/* FIX: CourseDetail wrapped in ProtectedRoute so auth is enforced */}
      <Route path="/course/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
      <Route path="/pdf-reader" element={<PDFReader />} />
      <Route path="/quiz-setup"          element={<ProtectedRoute><QuizSetupPage /></ProtectedRoute>} />
      <Route path="/quiz"                element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
      <Route path="/quiz-result"         element={<ProtectedRoute><QuizResultPage /></ProtectedRoute>} />
      <Route path="/quiz-history"        element={<ProtectedRoute><QuizHistoryPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ChatWidget/>
      </BrowserRouter>
    </AuthProvider>
  );
}