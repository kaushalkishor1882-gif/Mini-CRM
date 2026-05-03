import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

/* ═══════════════════════════════════════════════
   AXIOS SETUP — always attach latest token
═══════════════════════════════════════════════ */
const API = axios.create({ baseURL: "http://localhost:5000/api" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("crm_token");
  if (token) config.headers["Authorization"] = token;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("crm_token");
      localStorage.removeItem("crm_user");
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

/* ═══════════════════════════════════════════════
   FONTS & GLOBAL CSS
═══════════════════════════════════════════════ */
if (!document.getElementById("crm-fonts")) {
  const link = document.createElement("link");
  link.id = "crm-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap";
  document.head.appendChild(link);
}

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:      #03030a;
  --bg2:     #07071a;
  --bg3:     #0d0d24;
  --card:    #0a0a20;
  --card2:   #0f0f2e;
  --border:  rgba(255,255,255,0.06);
  --border2: rgba(255,255,255,0.12);
  --accent:  #5b6fff;
  --accent2: #8b5cf6;
  --cyan:    #22d3ee;
  --green:   #10b981;
  --amber:   #f59e0b;
  --red:     #ef4444;
  --rose:    #fb7185;
  --text:    #e2e8f0;
  --text2:   #7c8db5;
  --text3:   #3a4468;
  --font:    'DM Sans', sans-serif;
  --display: 'Syne', sans-serif;
  --mono:    'DM Mono', monospace;
}

html { scroll-behavior: smooth; }

body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── Animated starfield bg ── */
body::before {
  content: '';
  position: fixed; inset: 0;
  background:
    radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 100%),
    radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.1) 0%, transparent 100%),
    radial-gradient(1px 1px at 50% 70%, rgba(255,255,255,0.12) 0%, transparent 100%),
    radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 100%),
    radial-gradient(1px 1px at 90% 60%, rgba(255,255,255,0.1) 0%, transparent 100%),
    linear-gradient(rgba(91,111,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(91,111,255,0.03) 1px, transparent 1px);
  background-size: auto, auto, auto, auto, auto, 52px 52px, 52px 52px;
  pointer-events: none; z-index: 0;
  animation: gridDrift 30s linear infinite;
}

@keyframes gridDrift {
  0% { background-position: 0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0; }
  100% { background-position: 0 0, 0 0, 0 0, 0 0, 0 0, 52px 52px, 52px 52px; }
}

/* ── Glow orbs ── */
body::after {
  content: '';
  position: fixed; top: -20vh; left: 50%;
  transform: translateX(-50%);
  width: 100vw; height: 70vh;
  background:
    radial-gradient(ellipse at 25% 50%, rgba(91,111,255,0.10) 0%, transparent 60%),
    radial-gradient(ellipse at 75% 50%, rgba(139,92,246,0.07) 0%, transparent 60%),
    radial-gradient(ellipse at 50% 80%, rgba(34,211,238,0.04) 0%, transparent 50%);
  pointer-events: none; z-index: 0;
  animation: orbFloat 12s ease-in-out infinite alternate;
}

@keyframes orbFloat {
  0%   { opacity: 0.6; transform: translateX(-50%) scale(1)   translateY(0); }
  100% { opacity: 1;   transform: translateX(-50%) scale(1.1) translateY(-20px); }
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

/* ── Flip card ── */
.flip-scene { perspective: 1200px; width: 100%; height: 100%; }
.flip-inner {
  position: relative; width: 100%; height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.4,0.2,0.2,1);
}
.flip-scene.flipped .flip-inner { transform: rotateY(180deg); }
.flip-front, .flip-back {
  position: absolute; inset: 0;
  backface-visibility: hidden; -webkit-backface-visibility: hidden;
  border-radius: 20px; padding: 22px;
  background: var(--card); border: 1px solid var(--border);
}
.flip-back {
  transform: rotateY(180deg);
  background: var(--card2); border-color: rgba(91,111,255,0.2);
}

/* ── Animations ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes fadeIn {
  from { opacity: 0; } to { opacity: 1; }
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.6; transform: scale(0.95); }
}
@keyframes toastIn {
  from { opacity: 0; transform: translateX(20px) scale(0.95); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes toastOut {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to   { opacity: 0; transform: translateX(20px) scale(0.95); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes waterRise {
  from { height: 0%; }
  to   { height: var(--fill); }
}
@keyframes shimmerMove {
  0%   { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(300%) skewX(-15deg); }
}
@keyframes floatBob {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33%       { transform: translateY(-8px) rotate(1deg); }
  66%       { transform: translateY(-4px) rotate(-1deg); }
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(91,111,255,0.3); }
  50%       { box-shadow: 0 0 40px rgba(91,111,255,0.6), 0 0 80px rgba(91,111,255,0.2); }
}
@keyframes borderFlow {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

/* ── Modal ── */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(16px);
  z-index: 300;
  display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.2s ease;
  padding: 20px;
}
.modal-box { animation: fadeUp 0.4s cubic-bezier(0.34,1.3,0.64,1); }

/* ── Inputs ── */
.crm-input {
  font-family: var(--font);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.crm-input:focus {
  outline: none;
  border-color: rgba(91,111,255,0.6) !important;
  box-shadow: 0 0 0 3px rgba(91,111,255,0.15), 0 0 20px rgba(91,111,255,0.1) !important;
}
.crm-input::placeholder { color: var(--text3); }
option { background: #0f0f2e; color: var(--text); }
textarea { resize: none; }

/* ── Glow button ── */
.glow-btn { position: relative; overflow: hidden; }
.glow-btn::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
  transform: translateX(-100%) skewX(-15deg);
}
.glow-btn:hover::after { animation: shimmerMove 0.6s ease; }
.glow-btn:hover {
  box-shadow: 0 0 30px rgba(91,111,255,0.5), 0 0 60px rgba(91,111,255,0.2);
}
`;

if (!document.getElementById("crm-css")) {
  const el = document.createElement("style");
  el.id = "crm-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

/* ═══════════════════════════════════════════════
   CONSTANTS & HELPERS
═══════════════════════════════════════════════ */
const PALETTES = [
  { bg: "rgba(91,111,255,0.18)",  color: "#818cf8", glow: "rgba(91,111,255,0.5)" },
  { bg: "rgba(34,211,238,0.14)",  color: "#22d3ee", glow: "rgba(34,211,238,0.5)" },
  { bg: "rgba(16,185,129,0.14)",  color: "#10b981", glow: "rgba(16,185,129,0.5)" },
  { bg: "rgba(245,158,11,0.14)",  color: "#f59e0b", glow: "rgba(245,158,11,0.5)" },
  { bg: "rgba(139,92,246,0.18)",  color: "#c084fc", glow: "rgba(139,92,246,0.5)" },
  { bg: "rgba(251,113,133,0.14)", color: "#fb7185", glow: "rgba(251,113,133,0.5)" },
];

const hashPal = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return PALETTES[Math.abs(h) % PALETTES.length];
};

const initials = (name = "") => {
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
};

const STATUS = {
  new:       { label: "New",       color: "#22d3ee", bg: "rgba(34,211,238,0.1)",  border: "rgba(34,211,238,0.25)"  },
  contacted: { label: "Contacted", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)"  },
  converted: { label: "Converted", color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)"  },
};

const PRIORITY = {
  low:    { label: "Low",    color: "#7c8db5" },
  medium: { label: "Med",    color: "#f59e0b" },
  high:   { label: "High",   color: "#ef4444" },
};

/* ═══════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════ */
function Toast({ message, type = "success", visible }) {
  const colors = {
    success: { dot: "#10b981", border: "rgba(16,185,129,0.3)" },
    error:   { dot: "#ef4444", border: "rgba(239,68,68,0.3)" },
    info:    { dot: "#5b6fff", border: "rgba(91,111,255,0.3)" },
  };
  const c = colors[type] || colors.success;

  return (
    <div style={{
      position: "fixed", top: 24, right: 24,
      background: "var(--card2)",
      border: `1px solid ${c.border}`,
      borderRadius: 14, padding: "14px 20px",
      display: "flex", alignItems: "center", gap: 10,
      fontSize: 14, fontFamily: "var(--font)", color: "var(--text)",
      zIndex: 999, pointerEvents: "none",
      boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
      maxWidth: 340,
      animation: visible
        ? "toastIn 0.4s cubic-bezier(0.34,1.3,0.64,1) forwards"
        : "toastOut 0.3s ease forwards",
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: c.dot, boxShadow: `0 0 8px ${c.dot}`,
        flexShrink: 0, animation: "pulse 1.5s ease infinite",
      }} />
      {message}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   WATER STAT CARD
═══════════════════════════════════════════════ */
function WaterCard({ label, value, total, accentColor, glowColor, delay, icon }) {
  const cardRef = useRef(null);
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;

  const onMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${-y*12}deg) rotateY(${x*12}deg) translateZ(6px)`;
    el.style.boxShadow = `${x*-20}px ${y*-20}px 50px ${glowColor}25, 0 20px 60px rgba(0,0,0,0.4)`;
  }, [glowColor]);

  const onLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = "transform 0.7s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.7s ease";
    el.style.transform = "perspective(700px) rotateX(0) rotateY(0) translateZ(0)";
    el.style.boxShadow = "none";
  }, []);

  const onEnter = useCallback(() => {
    const el = cardRef.current;
    if (el) el.style.transition = "transform 0.1s linear, box-shadow 0.1s linear";
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={onEnter}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 20, padding: "22px",
        position: "relative", overflow: "hidden",
        cursor: "default",
        animation: `fadeUp 0.6s cubic-bezier(0.34,1.2,0.64,1) ${delay}s both`,
        willChange: "transform",
      }}
    >
      {/* Accent top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${accentColor}, transparent 70%)`,
      }} />

      {/* Water fill effect */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: `${pct}%`,
        background: `linear-gradient(180deg, ${accentColor}22 0%, ${accentColor}08 100%)`,
        transition: "height 1.2s cubic-bezier(0.34,1.1,0.64,1)",
        borderTop: `1px solid ${accentColor}30`,
      }}>
        {/* Wave shimmer */}
        <div style={{
          position: "absolute", top: -1, left: "-100%", width: "300%", height: 3,
          background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)`,
          animation: "shimmerMove 2.5s ease-in-out infinite",
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "1.4px",
            textTransform: "uppercase", color: "var(--text3)", fontFamily: "var(--mono)",
          }}>{label}</div>
          <span style={{ fontSize: 18 }}>{icon}</span>
        </div>

        <div style={{
          fontFamily: "var(--display)",
          fontSize: 44, fontWeight: 700, letterSpacing: -2,
          color: accentColor, lineHeight: 1,
          textShadow: `0 0 30px ${glowColor}50`,
        }}>{value}</div>

        {total > 0 && (
          <div style={{ marginTop: 10, fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>
            {pct.toFixed(0)}% of {total}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LEAD CARD
═══════════════════════════════════════════════ */
function LeadCard({ lead, onDelete, onStatusChange, onNoteAdd, delay }) {
  const [flipped, setFlipped] = useState(false);
  const [noteText, setNoteText] = useState("");
  const pal = hashPal(lead.name);
  const meta = STATUS[lead.status] || STATUS.new;
  const prio = PRIORITY[lead.priority] || PRIORITY.low;
  const latestNote = lead.notes?.[lead.notes.length - 1];

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await onNoteAdd(lead._id, noteText);
    setNoteText("");
  };

  return (
    <div style={{
      height: 280,
      animation: `fadeUp 0.55s cubic-bezier(0.34,1.2,0.64,1) ${delay}s both`,
    }}>
      <div className={`flip-scene${flipped ? " flipped" : ""}`}>
        <div className="flip-inner">

          {/* ── FRONT ── */}
          <div className="flip-front" style={{ display: "flex", flexDirection: "column" }}>
            {/* Priority indicator */}
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: 0, height: 0,
              borderStyle: "solid",
              borderWidth: `0 28px 28px 0`,
              borderColor: `transparent ${prio.color} transparent transparent`,
              borderRadius: "0 20px 0 0",
              opacity: 0.7,
            }} />

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
              {/* Avatar */}
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: pal.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: pal.color,
                fontFamily: "var(--display)",
                boxShadow: `0 0 20px ${pal.glow}30`,
                border: `1px solid ${pal.glow}25`,
                flexShrink: 0,
                animation: "floatBob 4s ease-in-out infinite",
              }}>
                {initials(lead.name)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 600, color: "var(--text)",
                  fontFamily: "var(--display)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  letterSpacing: -0.3,
                }}>{lead.name}</div>
                <div style={{
                  fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", marginTop: 2,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{lead.email}</div>
              </div>

              {/* Status badge */}
              <div style={{
                fontSize: 9, fontWeight: 700,
                letterSpacing: "0.8px", textTransform: "uppercase",
                padding: "4px 10px", borderRadius: 100,
                background: meta.bg, color: meta.color,
                border: `1px solid ${meta.border}`,
                fontFamily: "var(--mono)", flexShrink: 0,
              }}>{meta.label}</div>
            </div>

            {/* Source + Priority row */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {lead.source && (
                <span style={{
                  fontSize: 10, color: "var(--text3)",
                  background: "var(--bg3)", border: "1px solid var(--border)",
                  borderRadius: 6, padding: "3px 8px",
                  fontFamily: "var(--mono)",
                }}>{lead.source}</span>
              )}
              <span style={{
                fontSize: 10, color: prio.color,
                background: `${prio.color}15`,
                border: `1px solid ${prio.color}30`,
                borderRadius: 6, padding: "3px 8px",
                fontFamily: "var(--mono)",
              }}>⚡ {prio.label}</span>
            </div>

            {/* Follow-up date */}
            {lead.followUpDate && (
              <div style={{
                fontSize: 10, color: "var(--amber)", fontFamily: "var(--mono)",
                marginBottom: 10, display: "flex", alignItems: "center", gap: 5,
              }}>
                📅 {new Date(lead.followUpDate).toLocaleDateString()}
              </div>
            )}

            {/* Latest note preview */}
            {latestNote && (
              <div style={{
                flex: 1,
                fontSize: 11, color: "var(--text2)",
                background: "var(--bg3)", borderRadius: 8, padding: "7px 10px",
                border: "1px solid var(--border)",
                overflow: "hidden",
                display: "-webkit-box", WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                marginBottom: 10,
              }}>
                📝 {latestNote.text}
              </div>
            )}

            <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setFlipped(true)}
                style={{
                  background: "rgba(91,111,255,0.1)",
                  border: "1px solid rgba(91,111,255,0.25)",
                  borderRadius: 10, padding: "7px 16px",
                  fontFamily: "var(--font)", fontSize: 12, fontWeight: 500,
                  color: "var(--accent)", cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(91,111,255,0.2)";
                  e.currentTarget.style.boxShadow = "0 0 16px rgba(91,111,255,0.3)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(91,111,255,0.1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >Manage →</button>
            </div>
          </div>

          {/* ── BACK ── */}
          <div className="flip-back" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--display)", color: "var(--text)", letterSpacing: -0.3 }}>
                {lead.name}
              </div>
              <button
                onClick={() => setFlipped(false)}
                style={{
                  width: 28, height: 28, background: "var(--bg3)",
                  border: "1px solid var(--border)", borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--text2)", fontSize: 13,
                }}
              >←</button>
            </div>

            {/* Note input */}
            <div style={{ display: "flex", gap: 6, flex: 1 }}>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add a note…"
                rows={3}
                className="crm-input"
                style={{
                  flex: 1, background: "var(--bg2)",
                  border: "1px solid var(--border)", borderRadius: 9,
                  padding: "8px 10px", fontSize: 12, color: "var(--text)",
                }}
              />
              <button
                onClick={handleAddNote}
                disabled={!noteText.trim()}
                style={{
                  background: noteText.trim() ? "rgba(91,111,255,0.2)" : "var(--bg3)",
                  border: "1px solid rgba(91,111,255,0.3)",
                  borderRadius: 9, padding: "0 10px",
                  cursor: noteText.trim() ? "pointer" : "not-allowed",
                  color: "var(--accent)", fontSize: 16,
                }}
              >+</button>
            </div>

            {/* Notes count */}
            {lead.notes?.length > 0 && (
              <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--mono)" }}>
                📝 {lead.notes.length} note{lead.notes.length !== 1 ? "s" : ""}
              </div>
            )}

            {/* Status select */}
            <select
              value={lead.status}
              onChange={e => onStatusChange(lead._id, e.target.value)}
              className="crm-input"
              style={{
                background: "var(--bg2)", border: "1px solid var(--border)",
                borderRadius: 9, padding: "7px 10px",
                fontSize: 12, color: "var(--text2)", cursor: "pointer", appearance: "none",
              }}
            >
              <option value="new">🔵 New</option>
              <option value="contacted">🟡 Contacted</option>
              <option value="converted">🟢 Converted</option>
            </select>

            {/* Delete */}
            <button
              onClick={() => onDelete(lead._id)}
              style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 9, padding: "8px",
                fontFamily: "var(--font)", fontSize: 12, fontWeight: 500,
                color: "var(--red)", cursor: "pointer", transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
            >
              ✕ Delete Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ADD LEAD MODAL
═══════════════════════════════════════════════ */
function AddModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: "", email: "", source: "", status: "new", priority: "low", followUpDate: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.source)       e.source = "Required";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await onAdd(form);
    setLoading(false);
    onClose();
  };

  const inp = (err) => ({
    width: "100%", background: "var(--bg2)",
    border: `1px solid ${err ? "rgba(239,68,68,0.6)" : "var(--border)"}`,
    borderRadius: 10, padding: "11px 14px",
    fontSize: 14, color: "var(--text)",
  });

  const Label = ({ children }) => (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "1.2px",
      textTransform: "uppercase", color: "var(--text3)",
      fontFamily: "var(--mono)", marginBottom: 6,
    }}>{children}</div>
  );

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{
        background: "var(--card2)",
        border: "1px solid rgba(91,111,255,0.25)",
        borderRadius: 24, padding: "32px 28px",
        width: "100%", maxWidth: 480,
        boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(91,111,255,0.06)",
        position: "relative", overflow: "hidden",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Top shimmer line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(91,111,255,0.8), transparent)",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>
              New Lead
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}>Add to your pipeline</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, background: "var(--bg3)",
            border: "1px solid var(--border)", borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--text2)", fontSize: 15,
          }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Name */}
          <div style={{ gridColumn: "1 / -1" }}>
            <Label>Full Name *</Label>
            <input type="text" placeholder="Sarah Johnson" value={form.name}
              onChange={e => set("name", e.target.value)} className="crm-input" style={inp(errors.name)} />
            {errors.name && <div style={{ fontSize: 10, color: "var(--red)", marginTop: 3 }}>{errors.name}</div>}
          </div>

          {/* Email */}
          <div style={{ gridColumn: "1 / -1" }}>
            <Label>Email Address *</Label>
            <input type="email" placeholder="sarah@company.com" value={form.email}
              onChange={e => set("email", e.target.value)} className="crm-input" style={inp(errors.email)} />
            {errors.email && <div style={{ fontSize: 10, color: "var(--red)", marginTop: 3 }}>{errors.email}</div>}
          </div>

          {/* Source */}
          <div>
            <Label>Source *</Label>
            <select value={form.source} onChange={e => set("source", e.target.value)}
              className="crm-input" style={{ ...inp(errors.source), cursor: "pointer", appearance: "none" }}>
              <option value="">Select…</option>
              {["Website","LinkedIn","Referral","Cold Email","Event","Social Media","Other"].map(s =>
                <option key={s} value={s}>{s}</option>
              )}
            </select>
            {errors.source && <div style={{ fontSize: 10, color: "var(--red)", marginTop: 3 }}>{errors.source}</div>}
          </div>

          {/* Priority */}
          <div>
            <Label>Priority</Label>
            <select value={form.priority} onChange={e => set("priority", e.target.value)}
              className="crm-input" style={{ ...inp(false), cursor: "pointer", appearance: "none" }}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <select value={form.status} onChange={e => set("status", e.target.value)}
              className="crm-input" style={{ ...inp(false), cursor: "pointer", appearance: "none" }}>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
            </select>
          </div>

          {/* Follow-up */}
          <div>
            <Label>Follow-up Date</Label>
            <input type="date" value={form.followUpDate} onChange={e => set("followUpDate", e.target.value)}
              className="crm-input" style={{ ...inp(false), colorScheme: "dark" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{
            flex: 1, background: "transparent", border: "1px solid var(--border)",
            borderRadius: 12, padding: 13, fontFamily: "var(--font)",
            fontSize: 14, color: "var(--text2)", cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >Cancel</button>
          <button onClick={submit} disabled={loading} className="glow-btn" style={{
            flex: 2,
            background: loading ? "var(--card2)" : "linear-gradient(135deg, var(--accent), var(--accent2))",
            border: "none", borderRadius: 12, padding: 13,
            fontFamily: "var(--display)", fontSize: 14, fontWeight: 700,
            color: loading ? "var(--text3)" : "#fff",
            cursor: loading ? "not-allowed" : "pointer", transition: "all 0.25s",
            letterSpacing: -0.3,
          }}>
            {loading ? "Adding…" : "Add Lead →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LOGIN / REGISTER PAGE
═══════════════════════════════════════════════ */
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
    setServerErr("");
  };

  const validate = () => {
    const e = {};
    if (mode === "register" && !form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setServerErr("");
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await API.post(endpoint, payload);
      const { token, user } = res.data;

      localStorage.setItem("crm_token", token);
      localStorage.setItem("crm_user", JSON.stringify(user));
      onAuth(user);
    } catch (err) {
      setServerErr(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inp = (err) => ({
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: `1px solid ${err ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 12, padding: "14px 16px",
    fontSize: 15, color: "var(--text)",
    transition: "all 0.2s",
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", zIndex: 1, padding: 20,
    }}>
      {/* Floating decorative elements */}
      <div style={{
        position: "absolute", top: "15%", left: "10%",
        width: 200, height: 200,
        background: "radial-gradient(circle, rgba(91,111,255,0.15) 0%, transparent 70%)",
        borderRadius: "50%", animation: "orbFloat 8s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "20%", right: "8%",
        width: 160, height: 160,
        background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
        borderRadius: "50%", animation: "orbFloat 10s ease-in-out infinite reverse",
        pointerEvents: "none",
      }} />

      <div className="modal-box" style={{
        background: "var(--card)",
        border: "1px solid rgba(91,111,255,0.2)",
        borderRadius: 28, padding: "40px 36px",
        width: "100%", maxWidth: 420,
        boxShadow: "0 60px 120px rgba(0,0,0,0.8), 0 0 80px rgba(91,111,255,0.05)",
        position: "relative", overflow: "hidden",
        animation: "fadeUp 0.5s cubic-bezier(0.34,1.3,0.64,1) both",
      }}>
        {/* Animated border top */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, var(--accent), var(--accent2), var(--cyan), var(--accent))",
          backgroundSize: "200% 100%",
          animation: "borderFlow 3s linear infinite",
        }} />

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            borderRadius: 16, margin: "0 auto 14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 800, color: "#fff",
            fontFamily: "var(--display)",
            boxShadow: "0 12px 40px rgba(91,111,255,0.45)",
            animation: "glowPulse 3s ease-in-out infinite",
          }}>CR</div>
          <div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, letterSpacing: -1 }}>
            Mini{" "}
            <span style={{
              background: "linear-gradient(90deg, var(--accent), var(--cyan))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>CRM</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: "flex", background: "var(--bg3)",
          border: "1px solid var(--border)", borderRadius: 12,
          padding: 4, marginBottom: 28,
        }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setErrors({}); setServerErr(""); setForm({ name: "", email: "", password: "" }); }}
              style={{
                flex: 1, padding: "10px",
                background: mode === m ? "linear-gradient(135deg, var(--accent), var(--accent2))" : "transparent",
                border: "none", borderRadius: 9,
                fontFamily: "var(--display)", fontSize: 13, fontWeight: 600,
                color: mode === m ? "#fff" : "var(--text3)",
                cursor: "pointer", transition: "all 0.25s",
                letterSpacing: -0.2,
              }}>
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "register" && (
            <div>
              <input type="text" placeholder="Full name" value={form.name}
                onChange={e => set("name", e.target.value)} className="crm-input" style={inp(errors.name)}
                onKeyDown={e => e.key === "Enter" && submit()} />
              {errors.name && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 4 }}>{errors.name}</div>}
            </div>
          )}

          <div>
            <input type="email" placeholder="Email address" value={form.email}
              onChange={e => set("email", e.target.value)} className="crm-input" style={inp(errors.email)}
              onKeyDown={e => e.key === "Enter" && submit()} />
            {errors.email && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 4 }}>{errors.email}</div>}
          </div>

          <div>
            <input type="password" placeholder="Password (min 6 chars)" value={form.password}
              onChange={e => set("password", e.target.value)} className="crm-input" style={inp(errors.password)}
              onKeyDown={e => e.key === "Enter" && submit()} />
            {errors.password && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 4 }}>{errors.password}</div>}
          </div>

          {serverErr && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "var(--red)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              ⚠️ {serverErr}
            </div>
          )}

          <button onClick={submit} disabled={loading} className="glow-btn" style={{
            background: loading ? "var(--card2)" : "linear-gradient(135deg, var(--accent), var(--accent2))",
            border: "none", borderRadius: 12, padding: "15px",
            fontFamily: "var(--display)", fontSize: 15, fontWeight: 700,
            color: loading ? "var(--text3)" : "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.25s", letterSpacing: -0.3,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                {mode === "login" ? "Signing in…" : "Creating account…"}
              </>
            ) : (
              mode === "login" ? "Sign In →" : "Create Account →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════ */
function App() {
  const [user, setUser]               = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [leads, setLeads]             = useState([]);
  const [stats, setStats]             = useState({ total: 0, new: 0, contacted: 0, converted: 0, conversionRate: 0 });
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [showModal, setShowModal]     = useState(false);
  const [toast, setToast]             = useState({ msg: "", type: "success", visible: false });
  const [loading, setLoading]         = useState(false);
  const toastTimer = useRef(null);

  /* ── Check stored auth on mount ── */
  useEffect(() => {
    const token = localStorage.getItem("crm_token");
    const stored = localStorage.getItem("crm_user");
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setAuthChecked(true);
  }, []);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type, visible: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }, []);

  /* ── Fetch leads ── */
  const fetchLeads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await API.get("/leads", {
        params: { page, status: statusFilter, search, priority: priorityFilter, limit: 12 },
      });
      const { leads: data, total, totalPages: tp } = res.data;
      setLeads(Array.isArray(data) ? data : []);
      setTotalPages(tp || 1);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to fetch leads", "error");
    } finally {
      setLoading(false);
    }
  }, [user, page, statusFilter, search, priorityFilter, showToast]);

  /* ── Fetch stats ── */
  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await API.get("/leads/stats/summary");
      setStats(res.data);
    } catch { /* silently fail */ }
  }, [user]);

  /* ── Reset page on filter change ── */
  useEffect(() => { setPage(1); }, [statusFilter, search, priorityFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { fetchStats(); }, [fetchStats, leads]);

  /* ── Auth handler ── */
  const handleAuth = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    setUser(null);
    setLeads([]);
  };

  /* ── CRUD ── */
  const addLead = async (formData) => {
    try {
      await API.post("/leads", formData);
      await fetchLeads();
      showToast("Lead added successfully ✓");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to add lead", "error");
      throw err;
    }
  };

  const deleteLead = async (id) => {
    try {
      await API.delete(`/leads/${id}`);
      await fetchLeads();
      showToast("Lead removed");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to delete", "error");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/leads/${id}`, { status });
      setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
      showToast("Status updated ✓");
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  const addNote = async (id, text) => {
    try {
      const res = await API.post(`/leads/${id}/notes`, { text });
      setLeads(prev => prev.map(l => l._id === id ? res.data : l));
      showToast("Note added ✓");
    } catch (err) {
      showToast("Failed to add note", "error");
    }
  };

  /* ── Loading splash ── */
  if (!authChecked) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--border2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  /* ── Auth gate ── */
  if (!user) return <AuthPage onAuth={handleAuth} />;

  /* ── Dashboard ── */
  return (
    <div style={{ position: "relative", zIndex: 1, maxWidth: 1380, margin: "0 auto", padding: "0 24px 80px" }}>

      {/* ── HEADER ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "24px 0 32px",
        borderBottom: "1px solid var(--border)", marginBottom: 36,
        animation: "slideDown 0.5s cubic-bezier(0.34,1.2,0.64,1) both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44,
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 800, color: "#fff",
            fontFamily: "var(--display)",
            boxShadow: "0 8px 28px rgba(91,111,255,0.45)",
            transform: "perspective(200px) rotateX(10deg) rotateY(-6deg)",
            animation: "glowPulse 4s ease-in-out infinite",
          }}>CR</div>
          <div>
            <div style={{ fontFamily: "var(--display)", fontSize: 23, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>
              Mini{" "}
              <span style={{
                background: "linear-gradient(90deg, var(--accent), var(--cyan))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>CRM</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2, fontFamily: "var(--mono)" }}>
              Lead Management System
            </div>
          </div>
        </div>

        {/* Right side: user info + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {stats.followUpsToday > 0 && (
            <div style={{
              fontSize: 11, color: "var(--amber)",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: 100, padding: "5px 12px",
              fontFamily: "var(--mono)",
              animation: "pulse 2s ease-in-out infinite",
            }}>
              📅 {stats.followUpsToday} follow-up{stats.followUpsToday !== 1 ? "s" : ""} today
            </div>
          )}

          <div style={{
            fontFamily: "var(--mono)", fontSize: 11,
            padding: "6px 14px", borderRadius: 100,
            background: "rgba(91,111,255,0.1)",
            border: "1px solid rgba(91,111,255,0.2)",
            color: "var(--accent)",
          }}>
            👤 {user.name}
          </div>

          <button onClick={handleLogout} style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 10, padding: "7px 14px",
            fontFamily: "var(--font)", fontSize: 12,
            color: "var(--red)", cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
          >Sign Out</button>
        </div>
      </header>

      {/* ── STATS GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 32 }}>
        <WaterCard label="Total Leads"   value={stats.total}     total={stats.total}     accentColor="var(--accent)" glowColor="#5b6fff" delay={0.05} icon="📊" />
        <WaterCard label="New"           value={stats.new}       total={stats.total}     accentColor="var(--cyan)"   glowColor="#22d3ee" delay={0.10} icon="✨" />
        <WaterCard label="Contacted"     value={stats.contacted} total={stats.total}     accentColor="var(--amber)"  glowColor="#f59e0b" delay={0.15} icon="📞" />
        <WaterCard label="Converted"     value={stats.converted} total={stats.total}     accentColor="var(--green)"  glowColor="#10b981" delay={0.20} icon="🎯" />
      </div>

      {/* ── CONVERSION RATE BAR ── */}
      {stats.total > 0 && (
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 16, padding: "18px 22px", marginBottom: 28,
          animation: "fadeUp 0.5s 0.25s both",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)", whiteSpace: "nowrap" }}>
            CONVERSION RATE
          </div>
          <div style={{ flex: 1, background: "var(--bg3)", borderRadius: 100, height: 8, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${stats.conversionRate}%`,
              background: "linear-gradient(90deg, var(--accent), var(--green))",
              borderRadius: 100, transition: "width 1s ease",
              boxShadow: "0 0 10px rgba(16,185,129,0.5)",
            }} />
          </div>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 18, fontWeight: 500,
            color: "var(--green)", minWidth: 50, textAlign: "right",
          }}>{stats.conversionRate}%</div>
        </div>
      )}

      {/* ── TOOLBAR ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 24,
        animation: "slideDown 0.5s 0.1s both",
        flexWrap: "wrap",
      }}>
        {/* Search */}
        <div style={{ flex: "1 1 220px", position: "relative", minWidth: 200 }}>
          <span style={{
            position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
            color: "var(--text3)", fontSize: 14, pointerEvents: "none",
          }}>🔍</span>
          <input
            type="text" placeholder="Search name, email, source…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="crm-input"
            style={{
              width: "100%", background: "var(--card)",
              border: "1px solid var(--border)", borderRadius: 11,
              padding: "10px 14px 10px 38px", fontSize: 13, color: "var(--text)",
            }}
          />
        </div>

        {/* Status filter */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="crm-input"
          style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 11, padding: "10px 32px 10px 13px",
            fontSize: 13, color: "var(--text2)", cursor: "pointer", appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%233a4468' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat", backgroundPosition: "calc(100% - 10px) center",
          }}>
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
        </select>

        {/* Priority filter */}
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          className="crm-input"
          style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 11, padding: "10px 32px 10px 13px",
            fontSize: 13, color: "var(--text2)", cursor: "pointer", appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%233a4468' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat", backgroundPosition: "calc(100% - 10px) center",
          }}>
          <option value="">All Priority</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>

        {/* Add Lead */}
        <button onClick={() => setShowModal(true)} className="glow-btn" style={{
          display: "flex", alignItems: "center", gap: 7,
          background: "linear-gradient(135deg, var(--accent), var(--accent2))",
          color: "#fff", border: "none", borderRadius: 11,
          padding: "10px 20px",
          fontFamily: "var(--display)", fontSize: 13, fontWeight: 700,
          cursor: "pointer", whiteSpace: "nowrap",
          boxShadow: "0 4px 20px rgba(91,111,255,0.35)",
          transition: "all 0.25s", letterSpacing: -0.2,
        }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Lead
        </button>
      </div>

      {/* ── SECTION HEADER ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "1.5px", color: "var(--text3)", fontFamily: "var(--mono)",
        }}>
          {statusFilter ? `${statusFilter.toUpperCase()} LEADS` : "ALL LEADS"}
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>
          {leads.length} shown · page {page}/{totalPages}
        </div>
      </div>

      {/* ── LEADS GRID ── */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <div style={{
            width: 36, height: 36,
            border: "3px solid var(--border2)", borderTopColor: "var(--accent)",
            borderRadius: "50%", animation: "spin 0.8s linear infinite",
          }} />
        </div>
      ) : leads.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.2, animation: "floatBob 4s ease-in-out infinite" }}>📋</div>
          <div style={{ fontFamily: "var(--display)", fontSize: 18, color: "var(--text3)", marginBottom: 6, fontWeight: 600 }}>
            {search || statusFilter ? "No leads match your filters" : "No leads yet"}
          </div>
          <div style={{ fontSize: 13, color: "var(--text3)", opacity: 0.6 }}>
            {search || statusFilter ? "Try clearing filters" : 'Click "+ Add Lead" to get started'}
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gap: 16,
        }}>
          {leads.map((lead, i) => (
            <LeadCard
              key={lead._id} lead={lead} delay={i * 0.03}
              onDelete={deleteLead}
              onStatusChange={updateStatus}
              onNoteAdd={addNote}
            />
          ))}
        </div>
      )}

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, marginTop: 40,
        }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{
              background: page === 1 ? "var(--bg3)" : "rgba(91,111,255,0.12)",
              border: `1px solid ${page === 1 ? "var(--border)" : "rgba(91,111,255,0.25)"}`,
              borderRadius: 10, padding: "9px 18px",
              fontFamily: "var(--font)", fontSize: 13,
              color: page === 1 ? "var(--text3)" : "var(--accent)",
              cursor: page === 1 ? "not-allowed" : "pointer", transition: "all 0.2s",
            }}
          >← Prev</button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button key={p} onClick={() => setPage(p)} style={{
                width: 38, height: 38,
                background: page === p ? "linear-gradient(135deg, var(--accent), var(--accent2))" : "var(--card)",
                border: `1px solid ${page === p ? "transparent" : "var(--border)"}`,
                borderRadius: 10,
                fontFamily: "var(--mono)", fontSize: 12,
                color: page === p ? "#fff" : "var(--text3)",
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: page === p ? "0 4px 16px rgba(91,111,255,0.4)" : "none",
              }}>{p}</button>
            );
          })}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{
              background: page === totalPages ? "var(--bg3)" : "rgba(91,111,255,0.12)",
              border: `1px solid ${page === totalPages ? "var(--border)" : "rgba(91,111,255,0.25)"}`,
              borderRadius: 10, padding: "9px 18px",
              fontFamily: "var(--font)", fontSize: 13,
              color: page === totalPages ? "var(--text3)" : "var(--accent)",
              cursor: page === totalPages ? "not-allowed" : "pointer", transition: "all 0.2s",
            }}
          >Next →</button>
        </div>
      )}

      {/* ── MODAL ── */}
      {showModal && (
        <AddModal onClose={() => setShowModal(false)} onAdd={addLead} />
      )}

      {/* ── TOAST ── */}
      {(toast.visible || toast.msg) && (
        <Toast message={toast.msg} type={toast.type} visible={toast.visible} />
      )}
    </div>
  );
}

export default App;


