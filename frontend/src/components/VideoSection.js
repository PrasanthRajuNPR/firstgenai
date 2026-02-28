import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "../pages/styles.css";
export default function VideoSection({
  subsection,
  isCompleted,
  onToggleComplete,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalCount,
}) {
  // FIX: Guard against undefined currentIndex/totalCount to prevent NaN display
  const displayIndex = currentIndex !== undefined ? currentIndex + 1 : 1;
  const displayTotal = totalCount || 1;

  return (
    <div className="video-wrapper">
      <div className="video-header">
        <div className="video-header-row">
          <div>
            <h1 className="video-title">{subsection.title}</h1>
            <p className="video-description">{subsection.description}</p>
          </div>

          <span className="video-counter">
            {displayIndex} / {displayTotal}
          </span>
        </div>
      </div>

      <div className="video-card">
        <div className="video-frame-container">
          <iframe
            src={subsection.videoUrl}
            className="video-frame"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={subsection.title}
          />
        </div>

        <div className="video-content">
          <div className="notes-header">
            <h3 className="notes-title">Lecture Notes</h3>

            <button
              onClick={onToggleComplete}
              className={`complete-btn ${
                isCompleted ? "complete-active" : "complete-inactive"
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="icon" />
                  Completed
                </>
              ) : (
                <>
                  <Circle className="icon" />
                  Mark as Complete
                </>
              )}
            </button>
          </div>

          <div className="notes-content">
            <p>{subsection.notes}</p>
          </div>
        </div>
      </div>

      <div className="navigation-buttons">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className={`nav-btn ${hasPrevious ? "nav-enabled" : "nav-disabled"}`}
        >
          <ChevronLeft className="icon" />
          Previous
        </button>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`nav-btn ${hasNext ? "nav-next-enabled" : "nav-disabled"}`}
        >
          Next
          <ChevronRight className="icon" />
        </button>
      </div>
    </div>
  );
}