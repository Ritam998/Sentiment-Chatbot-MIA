import { useState, useRef, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:8000";

const SENTIMENT_CONFIG = {
  Positive: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
    glow: "rgba(16,185,129,0.15)",
    icon: "↑",
    label: "Positive"
  },
  Negative: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    glow: "rgba(239,68,68,0.15)",
    icon: "↓",
    label: "Negative"
  },
  Neutral: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    glow: "rgba(245,158,11,0.15)",
    icon: "→",
    label: "Neutral"
  },
  Mixed: {
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.25)",
    glow: "rgba(139,92,246,0.15)",
    icon: "~",
    label: "Mixed"
  }
};

const EMOTION_ICONS = {
  joy: "◆", anger: "▲", sadness: "▼", fear: "◈",
  surprise: "◉", disgust: "✕", anticipation: "▷", trust: "○"
};

const EXAMPLES = [
  "I absolutely love how this product exceeded all my expectations!",
  "The customer service was mediocre at best, not worth the wait.",
  "I'm not sure how I feel about this update — some parts are better, others worse.",
  "This is hands down the worst purchase I've ever made.",
  "Today was an ordinary day, nothing particularly good or bad happened.",
];

function ConfidenceBar({ label, value, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.round(value * 100)), 100);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <span style={{ fontSize: 11, color: "#e5e7eb", fontFamily: "'JetBrains Mono', monospace" }}>{width}%</span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${width}%`,
          background: color, borderRadius: 3,
          transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)"
        }} />
      </div>
    </div>
  );
}

function SentimentCard({ data }) {
  const cfg = SENTIMENT_CONFIG[data.sentiment] || SENTIMENT_CONFIG.Neutral;
  return (
    <div style={{
      background: "rgba(17,17,23,0.95)",
      border: `1px solid ${cfg.border}`,
      borderRadius: 16,
      padding: "18px 20px",
      boxShadow: `0 0 30px ${cfg.glow}`,
      animation: "slideIn 0.4s cubic-bezier(0.4,0,0.2,1)"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: cfg.color, fontWeight: 700
        }}>{cfg.icon}</div>
        <div>
          <div style={{ fontSize: 13, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Sentiment</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: cfg.color, letterSpacing: "-0.02em" }}>{data.sentiment}</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace" }}>Confidence</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#f9fafb", fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(data.confidence * 100)}%</div>
        </div>
      </div>

      {/* Explanation */}
      <p style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.65, marginBottom: 16, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, borderLeft: `2px solid ${cfg.color}` }}>
        {data.explanation}
      </p>

      {/* Scores */}
      <div style={{ marginBottom: 14 }}>
        <ConfidenceBar label="Positive" value={data.scores.positive} color="#10b981" />
        <ConfidenceBar label="Negative" value={data.scores.negative} color="#ef4444" />
        <ConfidenceBar label="Neutral" value={data.scores.neutral} color="#f59e0b" />
      </div>

      {/* Tags Row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {data.tone && (
          <span style={{
            background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
            color: "#a78bfa", padding: "3px 10px", borderRadius: 20,
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace"
          }}>tone: {data.tone}</span>
        )}
        {data.emotions?.map(e => (
          <span key={e} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#9ca3af", padding: "3px 10px", borderRadius: 20,
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace"
          }}>{EMOTION_ICONS[e] || "•"} {e}</span>
        ))}
        {data.keywords?.map(k => (
          <span key={k} style={{
            background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)",
            color: "#6ee7b7", padding: "3px 10px", borderRadius: 20,
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace"
          }}>"{k}"</span>
        ))}
      </div>

      {/* Model badge */}
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 10, color: "#4b5563", fontFamily: "'JetBrains Mono', monospace", display: "flex", justifyContent: "space-between" }}>
        <span>model: {data.model_used}</span>
        <span>{new Date(data.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      gap: 10,
      animation: "fadeUp 0.3s ease"
    }}>
      {/* Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        background: isUser ? "linear-gradient(135deg,#8b5cf6,#6d28d9)" : "rgba(255,255,255,0.06)",
        border: isUser ? "none" : "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 600, color: isUser ? "white" : "#9ca3af",
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        {isUser ? "Y" : "AI"}
      </div>

      <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", gap: 8, alignItems: isUser ? "flex-end" : "flex-start" }}>
        {/* User bubble */}
        {isUser && (
          <div style={{
            background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
            padding: "10px 15px", borderRadius: "14px 4px 14px 14px",
            fontSize: 14, color: "white", lineHeight: 1.6
          }}>{msg.content}</div>
        )}

        {/* Bot text reply */}
        {!isUser && msg.content && (
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "10px 15px", borderRadius: "4px 14px 14px 14px",
            fontSize: 14, color: "#d1d5db", lineHeight: 1.6
          }}>{msg.content}</div>
        )}

        {/* Sentiment data card */}
        {!isUser && msg.sentimentData && (
          <div style={{ width: "100%" }}>
            <SentimentCard data={msg.sentimentData} />
          </div>
        )}

        {/* Error */}
        {!isUser && msg.error && (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            padding: "10px 14px", borderRadius: 10, fontSize: 13, color: "#f87171"
          }}>⚠ {msg.error}</div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, color: "#9ca3af", fontFamily: "'JetBrains Mono', monospace"
      }}>AI</div>
      <div style={{
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        padding: "12px 16px", borderRadius: "4px 14px 14px 14px",
        display: "flex", gap: 5, alignItems: "center"
      }}>
        {[0, 0.2, 0.4].map((d, i) => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: "50%", background: "#6b7280",
            animation: `bounce 1.2s ${d}s ease-in-out infinite`
          }} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");
  const chatRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/`)
      .then(r => r.json())
      .then(d => setApiStatus(d.model || "online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    const txt = (text || input).trim();
    if (!txt || loading) return;

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg = { role: "user", content: txt, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: txt, use_ml: true })
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages(prev => [...prev, {
          role: "assistant", id: Date.now() + 1,
          error: err.detail || "API error"
        }]);
        return;
      }

      const data = await res.json();
      const cfg = SENTIMENT_CONFIG[data.sentiment] || SENTIMENT_CONFIG.Neutral;

      setMessages(prev => [...prev, {
        role: "assistant", id: Date.now() + 1,
        content: `Analysis complete — detected ${data.sentiment.toLowerCase()} sentiment with ${Math.round(data.confidence * 100)}% confidence.`,
        sentimentData: data
      }]);

    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant", id: Date.now() + 1,
        error: `Connection failed. Is the backend running at ${API_BASE}?`
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&family=Instrument+Sans:ital,wght@0,400;0,500;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810; font-family: 'Instrument Sans', sans-serif; color: #f9fafb; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes glow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        textarea { scrollbar-width: thin; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", background: "#080810", overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <div style={{
          width: 260, flexShrink: 0,
          background: "rgba(12,12,18,0.98)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column",
          padding: "20px 0"
        }}>
          {/* Logo */}
          <div style={{ padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 34, height: 34,
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                borderRadius: 10, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 16
              }}>◈</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}>SentiAI</div>
                <div style={{ fontSize: 10, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace" }}>v1.0 · ML Powered</div>
              </div>
            </div>
          </div>

          {/* API Status */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 10, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Backend Status</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: apiStatus === "offline" ? "#ef4444" : "#10b981",
                boxShadow: `0 0 6px ${apiStatus === "offline" ? "#ef4444" : "#10b981"}`,
                animation: "glow 2s ease-in-out infinite"
              }} />
              <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'JetBrains Mono', monospace" }}>
                {apiStatus === "checking" ? "connecting..." : apiStatus === "offline" ? "offline" : "online"}
              </span>
            </div>
            {apiStatus !== "offline" && apiStatus !== "checking" && (
              <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                {apiStatus}
              </div>
            )}
          </div>

          {/* Examples */}
          <div style={{ padding: "14px 20px", flex: 1, overflow: "auto" }}>
            <div style={{ fontSize: 10, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Quick Examples</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => sendMessage(ex)}
                  style={{
                    background: "transparent", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 8, padding: "8px 10px",
                    color: "#6b7280", fontSize: 11, lineHeight: 1.5,
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s", fontFamily: "'Instrument Sans', sans-serif"
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = "rgba(139,92,246,0.4)"; e.target.style.color = "#d1d5db"; e.target.style.background = "rgba(139,92,246,0.06)"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; e.target.style.color = "#6b7280"; e.target.style.background = "transparent"; }}
                >
                  {ex.length > 60 ? ex.slice(0, 60) + "…" : ex}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 10, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Sentiment Key</div>
            {Object.entries(SENTIMENT_CONFIG).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: v.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'JetBrains Mono', monospace" }}>{k}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Area ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Header */}
          <div style={{
            padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(10,10,16,0.98)", display: "flex", alignItems: "center",
            justifyContent: "space-between", flexShrink: 0
          }}>
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 2 }}>Sentiment Analysis Chat</h1>
              <p style={{ fontSize: 11, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace" }}>
                Type any text — ML model detects emotion, tone & sentiment
              </p>
            </div>
            {messages.length > 0 && (
              <button onClick={() => setMessages([])}
                style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#9ca3af", padding: "6px 12px", borderRadius: 8,
                  fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                  transition: "all 0.15s"
                }}
                onMouseEnter={e => { e.target.style.borderColor = "rgba(239,68,68,0.3)"; e.target.style.color = "#f87171"; }}
                onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.color = "#9ca3af"; }}
              >Clear</button>
            )}
          </div>

          {/* Chat */}
          <div ref={chatRef} style={{
            flex: 1, overflowY: "auto",
            padding: "24px", display: "flex",
            flexDirection: "column", gap: 20
          }}>
            {isEmpty && (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 16, color: "#4b5563", textAlign: "center",
                minHeight: 400
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: "rgba(139,92,246,0.08)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 32
                }}>◈</div>
                <div>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#d1d5db", marginBottom: 8, letterSpacing: "-0.02em" }}>
                    Analyze any text
                  </h2>
                  <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 360, lineHeight: 1.65 }}>
                    Enter a sentence, review, tweet, or message. The ML model will detect sentiment, confidence scores, emotions, tone, and key words.
                  </p>
                </div>
                <div style={{
                  marginTop: 8, padding: "10px 16px",
                  background: "rgba(255,255,255,0.02)", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: 12, color: "#4b5563", fontFamily: "'JetBrains Mono', monospace"
                }}>
                  {apiStatus === "offline"
                    ? "⚠ Backend offline — start it with: uvicorn main:app --reload"
                    : `✓ Backend connected · ${apiStatus}`
                  }
                </div>
              </div>
            )}

            {messages.map(msg => <Message key={msg.id} msg={msg} />)}
            {loading && <TypingIndicator />}
          </div>

          {/* Input */}
          <div style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(10,10,16,0.98)", flexShrink: 0
          }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", maxWidth: 900 }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); autoResize(e); }}
                onKeyDown={handleKey}
                placeholder="Type or paste text to analyze sentiment…"
                rows={1}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, color: "#f9fafb",
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: 14, padding: "11px 16px",
                  resize: "none", outline: "none",
                  minHeight: 44, maxHeight: 120, lineHeight: 1.5,
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                style={{
                  width: 44, height: 44, borderRadius: 12, border: "none",
                  background: input.trim() && !loading
                    ? "linear-gradient(135deg,#7c3aed,#4f46e5)"
                    : "rgba(255,255,255,0.05)",
                  color: input.trim() && !loading ? "white" : "#4b5563",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.15s", fontSize: 16
                }}
                onMouseEnter={e => { if (input.trim() && !loading) e.target.style.transform = "scale(1.06)"; }}
                onMouseLeave={e => e.target.style.transform = "scale(1)"}
              >
                {loading ? (
                  <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                ) : "→"}
              </button>
            </div>
            <div style={{ marginTop: 7, fontSize: 10, color: "#374151", fontFamily: "'JetBrains Mono', monospace" }}>
              Enter to send · Shift+Enter for newline · Backend: {API_BASE}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}