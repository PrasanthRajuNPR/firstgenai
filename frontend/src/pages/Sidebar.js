import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar({
  sections,
  activeSubsection,
  onSelectSubsection,
  completedSubsections,
}) {
  // Static courseData always uses plain "id" field
  const getId = (item) => item.id || item._id || "";

  const [expandedSections, setExpandedSections] = useState(
    new Set(sections.map((s) => getId(s)))
  );

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) newSet.delete(sectionId);
      else newSet.add(sectionId);
      return newSet;
    });
  };

  const getSectionProgress = (section) => {
    const total = section.subsections.length;
    if (total === 0) return 0;
    const completed = section.subsections.filter((sub) =>
      completedSubsections.has(getId(sub))
    ).length;
    return (completed / total) * 100;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <h2 className="sidebar-title">Course Content</h2>

        <div className="sidebar-sections">
          {sections.map((section) => {
            const sectionId = getId(section);
            const isExpanded = expandedSections.has(sectionId);
            const progress = getSectionProgress(section);

            return (
              <div key={sectionId} className="section-block">
                <button
                  onClick={() => toggleSection(sectionId)}
                  className="section-toggle"
                >
                  <div className="section-header-left">
                    {isExpanded ? (
                      <ChevronDown className="icon-small" />
                    ) : (
                      <ChevronRight className="icon-small" />
                    )}
                    <div className="section-header-text">
                      <h3>{section.title}</h3>
                      <div className="progress-row">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span>{Math.round(progress)}%</span>
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="subsections">
                    {section.subsections.map((subsection) => {
                      const subId = getId(subsection);
                      const isActive = activeSubsection === subId;
                      const isCompleted = completedSubsections.has(subId);

                      return (
                        <button
                          key={subId}
                          onClick={() => onSelectSubsection(sectionId, subId)}
                          className={`subsection-btn ${isActive ? "sub-active" : ""}`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="icon-small green" />
                          ) : (
                            <Circle className="icon-small gray" />
                          )}
                          <span
                            className={`subsection-text ${
                              isActive
                                ? "text-active"
                                : isCompleted
                                ? "text-completed"
                                : "text-default"
                            }`}
                          >
                            {subsection.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}