import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../context/AuthContext";
import { coursesData } from "./courseData";
import CourseHeader from "../components/CourseHeader";
import Sidebar from "./Sidebar";
import VideoSection from "../components/VideoSection";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [activeSubsection, setActiveSubsection] = useState(null);
  const [completedSubsections, setCompletedSubsections] = useState(new Set());

  /* =========================
     Fetch Course
  ========================== */
  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      // Fetch the course metadata (title, price, etc.) from the API
      const res = await API.get("/courses");
      const allCourses = res.data.data || [];
      const apiCourse = allCourses.find((c) => c._id === courseId);

      if (!apiCourse) {
        console.error("Course not found in API for id:", courseId);
        return;
      }

      // Match with static courseData by title (normalized) to get sections/subsections
      const staticCourse = coursesData.find(
        (c) =>
          c.title.toLowerCase().trim() ===
          apiCourse.title.toLowerCase().trim()
      );

      if (!staticCourse) {
        console.warn(
          "No static course data found for title:",
          apiCourse.title,
          "— falling back to API course with no sections."
        );
      }

      // Merge: use API data for title/price/description, static data for sections
      const merged = {
        ...apiCourse,
        color: staticCourse?.color || "linear-gradient(to right, #3b82f6, #06b6d4)",
        sections: staticCourse?.sections || [],
      };

      setCourse(merged);

      // Auto-select first section and subsection
      const firstSection = merged.sections?.[0];
      if (firstSection) {
        setActiveSection(firstSection.id);
        const firstSub = firstSection.subsections?.[0];
        if (firstSub) {
          setActiveSubsection(firstSub.id);
        }
      }
    } catch (error) {
      console.error("Error loading course:", error);
    }
  };

  /* =========================
     Loading guard — all derived values below only run when course is ready
  ========================== */
  if (!course) {
    return <div style={{ padding: "2rem" }}>Loading course...</div>;
  }

  /* =========================
     Navigation Helpers
  ========================== */
  const allSubsections = (course.sections || []).flatMap((s) =>
    (s.subsections || []).map((sub) => ({
      sectionId: s.id,
      subsectionId: sub.id,
    }))
  );

  const currentFlatIndex = allSubsections.findIndex(
    (item) => item.subsectionId === activeSubsection
  );

  const hasPrevious = currentFlatIndex > 0;
  const hasNext = currentFlatIndex < allSubsections.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      const prev = allSubsections[currentFlatIndex - 1];
      setActiveSection(prev.sectionId);
      setActiveSubsection(prev.subsectionId);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const next = allSubsections[currentFlatIndex + 1];
      setActiveSection(next.sectionId);
      setActiveSubsection(next.subsectionId);
    }
  };

  /* =========================
     Progress Calculation
  ========================== */
  const totalSubsections = allSubsections.length;
  const progress =
    totalSubsections > 0
      ? (completedSubsections.size / totalSubsections) * 100
      : 0;

  /* =========================
     Current Section / Subsection
  ========================== */
  const currentSection = (course.sections || []).find((s) =>
    (s.subsections || []).some((sub) => sub.id === activeSubsection)
  );

  const currentSubsection = (currentSection?.subsections || []).find(
    (sub) => sub.id === activeSubsection
  );

  /* =========================
     Shared Layout Helper
  ========================== */
  const renderLayout = (content) => (
    <div className="course-detail-container">
      <CourseHeader
        course={course}
        onBack={() => navigate("/courses")}
        progress={progress}
      />
      <div className="course-layout">
        <Sidebar
          sections={course.sections || []}
          activeSubsection={activeSubsection}
          onSelectSubsection={(sectionId, subsectionId) => {
            setActiveSection(sectionId);
            setActiveSubsection(subsectionId);
          }}
          completedSubsections={completedSubsections}
        />
        <main className="course-content">{content}</main>
      </div>
    </div>
  );

  if (!currentSubsection) {
    return renderLayout(
      <p style={{ padding: "2rem" }}>
        Please select a lesson from the sidebar to begin.
      </p>
    );
  }

  return renderLayout(
    <VideoSection
      subsection={currentSubsection}
      isCompleted={completedSubsections.has(activeSubsection)}
      onToggleComplete={() => {
        setCompletedSubsections((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(activeSubsection)) newSet.delete(activeSubsection);
          else newSet.add(activeSubsection);
          return newSet;
        });
      }}
      onPrevious={handlePrevious}
      onNext={handleNext}
      hasPrevious={hasPrevious}
      hasNext={hasNext}
      currentIndex={currentFlatIndex}
      totalCount={totalSubsections}
    />
  );
}