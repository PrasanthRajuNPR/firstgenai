import { useState, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();
const API_BASE = "https://firstgenai.onrender.com";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pdf-root { min-height: 100vh; background: #eef2ff; font-family: 'DM Sans', sans-serif; }

  .topbar {
    height: 52px; background: #1e3a8a;
    display: flex; align-items: center; padding: 0 20px; gap: 12px;
    position: sticky; top: 0; z-index: 100;
    box-shadow: 0 2px 12px rgba(30,58,138,0.3);
  }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 15px; color: #fff; flex: 1; }
  .topbar-title span { color: #93c5fd; }

  .nav-btn {
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
    border-radius: 6px; color: #bfdbfe; cursor: pointer; padding: 5px 11px;
    font-size: 13px; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
  }
  .nav-btn:hover { background: rgba(255,255,255,0.2); color: #fff; }
  .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .page-info { font-size: 12px; color: #93c5fd; min-width: 70px; text-align: center; }

  .upload-btn {
    background: #3b82f6; border: none; border-radius: 7px; color: #fff;
    cursor: pointer; padding: 6px 16px; font-size: 12px; font-weight: 700;
    font-family: 'Syne', sans-serif; transition: all 0.15s; letter-spacing: 0.3px;
  }
  .upload-btn:hover { background: #60a5fa; }

  .hint-bar {
    text-align: center; padding: 6px;
    background: linear-gradient(90deg, #1e3a8a, #1d4ed8, #1e3a8a);
    font-size: 11px; color: #bfdbfe; letter-spacing: 1.2px;
    font-family: 'Syne', sans-serif; font-weight: 700; text-transform: uppercase;
  }

  .pdf-canvas {
    display: flex; flex-direction: column; align-items: center;
    padding: 40px 20px; min-height: calc(100vh - 84px);
    position: relative;
  }

  .upload-zone {
    margin-top: 60px; width: 100%; max-width: 440px;
    border: 2px dashed #93c5fd; border-radius: 20px; padding: 56px 40px;
    text-align: center; transition: all 0.25s; background: #fff;
  }
  .upload-zone.drag { border-color: #3b82f6; background: #eff6ff; }
  .upload-icon { font-size: 48px; margin-bottom: 16px; }
  .upload-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #1e3a8a; margin-bottom: 8px; }
  .upload-sub { font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
  .upload-cta {
    display: inline-block; padding: 11px 28px; background: #1e3a8a;
    border-radius: 8px; color: #fff; font-weight: 700; cursor: pointer;
    font-size: 13px; font-family: 'Syne', sans-serif; transition: all 0.15s;
  }
  .upload-cta:hover { background: #1d4ed8; }

  .popup-card {
    position: fixed;
    z-index: 9999;
    width: 315px;
    background: #0f172a;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(15,23,42,0.55), 0 0 0 1px rgba(96,165,250,0.2);
    animation: popIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes popIn {
    from { opacity: 0; transform: scale(0.85) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .popup-header {
    padding: 12px 14px 10px;
    display: flex; align-items: center; justify-content: space-between;
    background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
    flex-shrink: 0;
  }

  .popup-badge { display: flex; align-items: center; gap: 8px; }

  .popup-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #93c5fd; box-shadow: 0 0 10px #60a5fa;
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

  .popup-label {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 11px;
    color: #fff; letter-spacing: 1px; text-transform: uppercase;
  }

  .popup-close {
    background: rgba(255,255,255,0.15); border: none; border-radius: 5px;
    color: #bfdbfe; cursor: pointer; width: 22px; height: 22px; font-size: 12px;
    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
    flex-shrink: 0;
  }
  .popup-close:hover { background: rgba(255,255,255,0.25); color: #fff; }

  .popup-selected {
    margin: 10px 14px 0; padding: 7px 10px;
    background: rgba(96,165,250,0.08); border-left: 2px solid #3b82f6;
    border-radius: 0 6px 6px 0; font-size: 11px; color: #475569;
    font-style: italic; line-height: 1.5;
    max-height: 36px; overflow: hidden;
    flex-shrink: 0;
  }

  .popup-tabs { padding: 10px 14px 0; display: flex; gap: 5px; flex-shrink: 0; }

  .tab-btn {
    flex: 1; padding: 5px 4px; font-size: 10px; font-weight: 700;
    font-family: 'Syne', sans-serif; letter-spacing: 0.5px; text-transform: uppercase;
    border-radius: 5px; border: 1px solid rgba(96,165,250,0.15);
    cursor: pointer; transition: all 0.15s; background: transparent; color: #334155;
  }
  .tab-btn.active { background: #3b82f6; border-color: #3b82f6; color: #fff; box-shadow: 0 2px 8px rgba(59,130,246,0.4); }
  .tab-btn:hover:not(.active) { border-color: rgba(96,165,250,0.4); color: #93c5fd; }

  .popup-body {
    padding: 12px 14px 14px;
    min-height: 60px;
    max-height: 220px;
    overflow-y: auto;
    flex: 1;
  }

  .popup-body::-webkit-scrollbar { width: 3px; }
  .popup-body::-webkit-scrollbar-track { background: transparent; }
  .popup-body::-webkit-scrollbar-thumb { background: #1d4ed8; border-radius: 2px; }

  .explanation-text { font-size: 12.5px; color: #94a3b8; line-height: 1.8; font-weight: 300; }

  .typing-cursor::after {
    content: '▌'; animation: blink 0.7s infinite; color: #3b82f6; font-size: 10px;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  .skeleton {
    height: 8px; border-radius: 4px; margin-bottom: 8px;
    background: linear-gradient(90deg, rgba(96,165,250,0.05) 25%, rgba(96,165,250,0.15) 50%, rgba(96,165,250,0.05) 75%);
    background-size: 200% 100%; animation: shimmer 1.4s infinite;
  }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

  .popup-footer {
    padding: 7px 14px; border-top: 1px solid rgba(96,165,250,0.08);
    display: flex; justify-content: space-between; align-items: center;
    background: rgba(96,165,250,0.03);
    flex-shrink: 0;
  }
  .footer-brand { font-size: 9px; color: #1e293b; font-family: 'Syne', sans-serif; letter-spacing: 1px; text-transform: uppercase; }
  .copy-btn { background: none; border: none; color: #334155; cursor: pointer; font-size: 10px; font-family: 'DM Sans', sans-serif; transition: color 0.15s; }
  .copy-btn:hover { color: #60a5fa; }
`;

function useTypewriter(text, speed = 14) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    if (!text) return;
    let i = 0;
    const t = setInterval(() => {
      i++; setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(t); setDone(true); }
    }, speed);
    return () => clearInterval(t);
  }, [text]);
  return { displayed, done };
}

function ExplainPopup({ text, position, onClose, pdfTopic }) {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("normal");
  const [copied, setCopied] = useState(false);
  const { displayed, done } = useTypewriter(loading ? "" : explanation);

  const fetchExplanation = useCallback(async (m) => {
    setLoading(true); setExplanation("");
    try {
      const res = await fetch(`${API_BASE}/api/ai/explain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ selectedText: text, documentTopic: pdfTopic, mode: m }),
      });
      const data = await res.json();
      setExplanation(data.explanation || "Could not generate explanation.");
    } catch {
      setExplanation("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [text, pdfTopic]);

  useEffect(() => { fetchExplanation("normal"); }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(explanation);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  // Smart dynamic positioning
  const POPUP_W = 315;
  const POPUP_MAX_H = 360; // header + tabs + max body + footer
  const MARGIN = 12;
  const spaceBelow = window.innerHeight - position.y - MARGIN;
  const spaceAbove = position.y - MARGIN;

  let top;
  if (spaceBelow >= POPUP_MAX_H) {
    top = position.y + MARGIN;
  } else if (spaceAbove >= POPUP_MAX_H) {
    top = position.y - POPUP_MAX_H - MARGIN;
  } else {
    // center vertically on screen
    top = Math.max(MARGIN, (window.innerHeight - POPUP_MAX_H) / 2);
  }

  const left = Math.min(
    Math.max(position.x - POPUP_W / 2, MARGIN),
    window.innerWidth - POPUP_W - MARGIN
  );

  return (
    <div className="popup-card" style={{ top, left }}>
      {/* Header */}
      <div className="popup-header">
        <div className="popup-badge">
          <div className="popup-dot" />
          <span className="popup-label">AI Tutor</span>
        </div>
        <button className="popup-close" onClick={onClose}>✕</button>
      </div>

      {/* Selected text preview */}
      <div className="popup-selected">
        "{text.length > 80 ? text.slice(0, 80) + "…" : text}"
      </div>

      {/* Mode tabs */}
      <div className="popup-tabs">
        {[
          { id: "normal", label: "📖 Explain" },
          { id: "simple", label: "🧒 Simplify" },
          { id: "example", label: "💡 Example" },
        ].map(m => (
          <button
            key={m.id}
            className={`tab-btn ${mode === m.id ? "active" : ""}`}
            onClick={() => { setMode(m.id); fetchExplanation(m.id); }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Body — scrollable */}
      <div className="popup-body">
        {loading ? (
          <>{[100, 82, 60].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: `${w}%` }} />
          ))}</>
        ) : (
          <p className={`explanation-text ${!done ? "typing-cursor" : ""}`}>
            {displayed}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="popup-footer">
        <span className="footer-brand">firstgenai</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? "✓ Copied!" : "⎘ Copy"}
        </button>
      </div>
    </div>
  );
}

export default function PDFReader() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [popup, setPopup] = useState(null);
  const [pdfTopic, setPdfTopic] = useState("General Academic Document");
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file) => {
    if (!file || file.type !== "application/pdf") return;
    setPdfFile(file);
    setPdfUrl(URL.createObjectURL(file));
    setPdfTopic(file.name.replace(".pdf", "").replace(/[-_]/g, " "));
  };

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const text = selection.toString().trim();
    if (text.length < 5) return;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setPopup({
      text,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.bottom,
      },
    });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.closest && e.target.closest(".popup-card")) return;
      setTimeout(handleTextSelection, 50);
    };
    document.addEventListener("mouseup", handler);
    return () => document.removeEventListener("mouseup", handler);
  }, [handleTextSelection]);

  return (
    <>
      <style>{styles}</style>
      <div className="pdf-root">

        {/* Topbar */}
        <div className="topbar">
          <span className="topbar-title">FirstGen<span>.ai</span> — PDF Reader</span>
          {pdfFile && (
            <>
              <button className="nav-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>‹</button>
              <span className="page-info">{currentPage} / {numPages || "…"}</span>
              <button className="nav-btn" onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage >= numPages}>›</button>
              <button className="nav-btn" onClick={() => setScale(s => Math.max(0.6, +(s - 0.1).toFixed(1)))}>−</button>
              <span className="page-info">{Math.round(scale * 100)}%</span>
              <button className="nav-btn" onClick={() => setScale(s => Math.min(2.5, +(s + 0.1).toFixed(1)))}>+</button>
              <label className="upload-btn">
                ＋ New PDF
                <input type="file" accept=".pdf" style={{ display: "none" }} onChange={e => handleFileSelect(e.target.files[0])} />
              </label>
            </>
          )}
        </div>

        {pdfFile && <div className="hint-bar">✦ Select any text for instant AI explanation</div>}

        {/* PDF Area */}
        <div
          className="pdf-canvas"
          onClick={(e) => { if (!e.target.closest(".popup-card")) setPopup(null); }}
        >
          {!pdfFile ? (
            <div
              className={`upload-zone ${dragOver ? "drag" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
            >
              <div className="upload-icon">📄</div>
              <div className="upload-title">Drop your PDF here</div>
              <p className="upload-sub">Upload any textbook, notes, or document.<br />Select any text to get instant AI explanations.</p>
              <label className="upload-cta">
                Browse Files
                <input type="file" accept=".pdf" style={{ display: "none" }} onChange={e => handleFileSelect(e.target.files[0])} />
              </label>
            </div>
          ) : (
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<div style={{ color: "#64748b", fontSize: 13, marginTop: 40 }}>Loading PDF…</div>}
            >
              <Page pageNumber={currentPage} scale={scale} renderTextLayer={true} renderAnnotationLayer={true} loading={null} />
            </Document>
          )}
        </div>

        {/* Popup */}
        {popup && (
          <ExplainPopup
            text={popup.text}
            position={popup.position}
            pdfTopic={pdfTopic}
            onClose={() => setPopup(null)}
          />
        )}
      </div>
    </>
  );
}
