import { ArrowLeft } from "lucide-react";
import "../pages/styles.css";

export default function CourseHeader({ course, onBack, progress }) {
  return (
    <header className="course-header">
      <div className="course-header-inner">
        <div className="course-header-top">
          <div className="course-header-left">
            <button onClick={onBack} className="back-btn">
              <ArrowLeft className="back-icon" />
              <span>Back</span>
            </button>

            <div className="divider" />

            <div>
              <h1 className="course-title">{course.title}</h1>
              <p className="course-description">
                {course.description}
              </p>
            </div>
          </div>

          <div className="course-progress-text">
            {Math.round(progress)}% Complete
          </div>
        </div>

        <div className="progress-container">
          <div
            className="progress-dynamic"
            style={{
              width: `${progress}%`,
              background: course.color,
            }}
          />
        </div>
      </div>
    </header>
  );
}