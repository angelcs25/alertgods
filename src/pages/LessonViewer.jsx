import { useState } from "react";
import { LESSONS } from "../modules/lessonRegistry";
import { MODULE_FIRST_LESSON } from "../modules/lessonRegistry";

// ─────────────────────────────────────────────────────────────────────────────
// LESSON VIEWER
// Lessons now live in src/modules/lessons/<module>/<lesson-id>.js
// Add lessons to src/modules/lessons/lessonRegistry.js
// ─────────────────────────────────────────────────────────────────────────────

const CALLOUT_STYLES = {
  key:     { bg: "#080a20", border: "#1a3a6a", color: "#4a9adf", label: "KEY CONCEPT" },
  tip:     { bg: "#082018", border: "#0a3020", color: "#00c97a", label: "TIP" },
  warning: { bg: "#201008", border: "#402010", color: "#e0a030", label: "WATCH OUT" },
};

function Block({ block, quizState, onAnswer }) {
  const mono = "'JetBrains Mono','Fira Code',monospace";

  switch (block.type) {

    case "text":
      return (
        <p style={{ fontSize: 15, color: "#8a9aaa", lineHeight: 1.85, marginBottom: 20 }}>
          {block.body}
        </p>
      );

    case "heading":
      return (
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#c8d8e8", marginBottom: 12, marginTop: 32, paddingBottom: 8, borderBottom: "1px solid #0a1828" }}>
          {block.body}
        </h3>
      );

    case "callout": {
      const s = CALLOUT_STYLES[block.variant] || CALLOUT_STYLES.key;
      return (
        <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderLeft: `3px solid ${s.color}`, borderRadius: 3, padding: "14px 18px", marginBottom: 20 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: s.color, letterSpacing: "0.15em", marginBottom: 8 }}>{s.label}</div>
          <p style={{ fontSize: 13, color: "#8a9aaa", lineHeight: 1.75, margin: 0 }}>{block.body}</p>
        </div>
      );
    }

    case "list":
      return (
        <ul style={{ marginBottom: 20, paddingLeft: 0, listStyle: "none" }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: "#7a8a9a", lineHeight: 1.7, marginBottom: 8, alignItems: "flex-start" }}>
              <span style={{ color: "#00c97a", fontSize: 9, marginTop: 5, flexShrink: 0 }}>▸</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div style={{ overflowX: "auto", marginBottom: 24 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: mono, fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #0f1e30" }}>
                {block.headers.map((h, i) => (
                  <th key={i} style={{ textAlign: "left", padding: "8px 16px 8px 0", color: "#2a4060", fontSize: 9, letterSpacing: "0.12em", fontWeight: 400 }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: "1px solid #0a1020" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: "10px 16px 10px 0", color: ci === 0 ? "#c8d8e8" : "#5a7a9a", fontSize: 12, lineHeight: 1.5 }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "example":
      return (
        <div style={{ background: "#060c14", border: "1px solid #0f1e30", borderRadius: 3, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#4a9adf", letterSpacing: "0.15em", marginBottom: 10 }}>{block.label}</div>
          <pre style={{ fontFamily: mono, fontSize: 12, color: "#7a9aaa", lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{block.body}</pre>
        </div>
      );

    case "quiz": {
      const answered = quizState?.answered;
      const selected = quizState?.selected;
      const correct  = block.answer;
      return (
        <div style={{ background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 3, padding: "20px 22px", marginBottom: 24, marginTop: 32 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#4a9adf", letterSpacing: "0.15em", marginBottom: 14 }}>QUICK CHECK</div>
          <p style={{ fontSize: 14, color: "#c8d8e8", lineHeight: 1.7, marginBottom: 18, fontWeight: 500 }}>{block.question}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {block.options.map((opt, i) => {
              let bg = "#060c14", border = "#1a2530", color = "#5a7a9a";
              if (answered) {
                if (i === correct)        { bg = "#082018"; border = "#0a3020"; color = "#00c97a"; }
                else if (i === selected)  { bg = "#200808"; border = "#300a0a"; color = "#e05050"; }
              } else if (selected === i)  { bg = "#0a1828"; border = "#2a4060"; color = "#c8d8e8"; }
              return (
                <button key={i} onClick={() => !answered && onAnswer(i)}
                  style={{ background: bg, border: `1px solid ${border}`, color, fontFamily: mono, fontSize: 12, padding: "10px 14px", borderRadius: 2, cursor: answered ? "default" : "pointer", textAlign: "left", transition: "all 0.15s" }}>
                  <span style={{ marginRight: 10, opacity: 0.5 }}>{String.fromCharCode(65 + i)}.</span>
                  {opt}
                  {answered && i === correct && <span style={{ marginLeft: 10 }}>✓</span>}
                  {answered && i === selected && i !== correct && <span style={{ marginLeft: 10 }}>✗</span>}
                </button>
              );
            })}
          </div>
          {answered && (
            <div style={{ marginTop: 14, fontSize: 12, color: selected === correct ? "#00c97a" : "#e05050", fontFamily: mono }}>
              {selected === correct ? "✓ Correct!" : `✗ The correct answer is: ${block.options[correct]}`}
            </div>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}

export default function LessonViewer({ lessonId, onBack, onNavigate }) {
  const lesson = LESSONS.find(l => l.id === lessonId) || LESSONS[0];
  const moduleIndex = LESSONS.filter(l => l.module === lesson.module).sort((a, b) => a.order - b.order);
  const currentIndex = moduleIndex.findIndex(l => l.id === lesson.id);
  const prevLesson = moduleIndex[currentIndex - 1] || null;
  const nextLesson = moduleIndex[currentIndex + 1] || null;

  const [quizStates, setQuizStates] = useState({});
  const quizBlocks = lesson.content.filter(b => b.type === "quiz");

  function handleAnswer(quizIdx, selected) {
    const block = quizBlocks[quizIdx];
    setQuizStates(prev => ({
      ...prev,
      [`${lessonId}-${quizIdx}`]: { selected, answered: true, correct: block.answer === selected },
    }));
  }

  let quizBlockCount = 0;
  const mono = "'JetBrains Mono','Fira Code',monospace";
  const LEVEL_COLOR = { Beginner: "#00c97a", Intermediate: "#e0a030", Advanced: "#4a9adf" };

  // Lesson not found
  if (!lesson) {
    return (
      <div style={{ fontFamily: mono, background: "#050c18", color: "#c8d8e8", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#e05050", marginBottom: 16 }}>Lesson not found: {lessonId}</div>
          <button onClick={() => onNavigate("/learn")} style={{ background: "none", border: "1px solid #1a2530", color: "#4a6a8a", fontFamily: mono, fontSize: 10, padding: "8px 16px", borderRadius: 2, cursor: "pointer" }}>
            ← Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#050c18", color: "#c8d8e8", minHeight: "100vh" }}>
      <style>{`* { box-sizing:border-box; margin:0; padding:0; } ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#1a2a3a;border-radius:2px}`}</style>

      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(5,12,24,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #0a1828", padding: "0 40px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => onNavigate("/learn")}
            style={{ background: "none", border: "none", color: "#3a5a7a", fontFamily: mono, fontSize: 11, cursor: "pointer", letterSpacing: "0.06em" }}
          >
            ← Library
          </button>
          <span style={{ color: "#0f1e30" }}>|</span>
          <span style={{ fontFamily: mono, fontSize: 10, color: "#2a4060", letterSpacing: "0.12em" }}>{lesson.moduleLabel}</span>
        </div>
        <button onClick={() => onNavigate("/")} style={{ background: "none", border: "none", color: "#00c97a", fontFamily: mono, fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", cursor: "pointer" }}>◈ ALERTGODS</button>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 40px 80px" }}>

        {/* Lesson header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontFamily: mono, fontSize: 9, padding: "2px 7px", borderRadius: 2, background: (LEVEL_COLOR[lesson.level] || "#00c97a") + "15", color: LEVEL_COLOR[lesson.level] || "#00c97a", border: `1px solid ${(LEVEL_COLOR[lesson.level] || "#00c97a")}40`, letterSpacing: "0.1em" }}>
              {lesson.level?.toUpperCase()}
            </span>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#2a4060" }}>Lesson {lesson.order}</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#2a4060" }}>·</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#2a4060" }}>{lesson.duration} read</span>
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: "#e8f0f8", lineHeight: 1.15 }}>
            {lesson.title}
          </h1>
        </div>

        {/* Progress bar through module */}
        {moduleIndex.length > 1 && (
          <div style={{ display: "flex", gap: 4, marginBottom: 40 }}>
            {moduleIndex.map((l, i) => (
              <div
                key={l.id}
                title={l.title}
                onClick={() => onBack(l.id)}
                style={{ flex: 1, height: 3, borderRadius: 2, background: i <= currentIndex ? "#00c97a" : "#0f1e30", transition: "background 0.3s", cursor: "pointer" }}
              />
            ))}
          </div>
        )}

        {/* Content blocks */}
        {lesson.content.map((block, i) => {
          if (block.type === "quiz") {
            const qIdx = quizBlockCount++;
            const stateKey = `${lessonId}-${qIdx}`;
            return (
              <Block key={i} block={block} quizState={quizStates[stateKey] || {}}
                onAnswer={(selected) => handleAnswer(qIdx, selected)} />
            );
          }
          return <Block key={i} block={block} />;
        })}

        {/* Bottom navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 48, paddingTop: 24, borderTop: "1px solid #0a1828" }}>
          {prevLesson ? (
            <button onClick={() => onNavigate(`/learn/${prevLesson.id}`)}
            //<button onClick={() => onBack(prevLesson.id)}
              style={{ background: "none", border: "1px solid #1a2530", color: "#4a6a8a", fontFamily: mono, fontSize: 10, padding: "8px 16px", borderRadius: 2, cursor: "pointer", letterSpacing: "0.06em" }}>
              ← {prevLesson.title}
            </button>
          ) : (
            <button onClick={() => onNavigate("/learn")}
              style={{ background: "none", border: "1px solid #1a2530", color: "#4a6a8a", fontFamily: mono, fontSize: 10, padding: "8px 16px", borderRadius: 2, cursor: "pointer", letterSpacing: "0.06em" }}>
              ← Back to Library
            </button>
          )}
          {nextLesson ? (
            <button onClick={()=> onNavigate(`/learn/${nextLesson.id}`)}
            //<button onClick={() => onBack(nextLesson.id)}
              style={{ background: "#00c97a", color: "#030f08", border: "none", fontFamily: mono, fontSize: 10, fontWeight: 600, padding: "8px 18px", borderRadius: 2, cursor: "pointer", letterSpacing: "0.08em" }}>
              {nextLesson.title} →
            </button>
          ) : (
            
            <button onClick={() => onNavigate("/learn")}
              style={{ background: "#00c97a", color: "#030f08", border: "none", fontFamily: mono, fontSize: 10, fontWeight: 600, padding: "8px 18px", borderRadius: 2, cursor: "pointer", letterSpacing: "0.08em" }}>
              Complete Module ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}