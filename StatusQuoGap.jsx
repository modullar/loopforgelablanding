const { useState, useEffect, useRef } = React;

const C = {
  bg: "#faf9f7",
  white: "#ffffff",
  forestGreen: "#2d5a3d",
  forestGreenLight: "#4a7c59",
  forestGreenDark: "#1e3d2b",
  warmGray: "#6b6b6b",
  warmGrayLight: "#9a9a9a",
  warmGrayLighter: "#f5f5f4",
  cream: "#faf9f7",
  orange: "#d97706",
  orangeLight: "#f59e0b",
  orangeDim: "rgba(217,119,6,0.08)",
  orangeGlow: "rgba(217,119,6,0.25)",
  greenDim: "rgba(45,90,61,0.08)",
  greenGlow: "rgba(45,90,61,0.25)",
  border: "rgba(45,90,61,0.1)",
};

const BEFORE = [
  { time: "Day 1", type: "neutral", label: "New Brief", short: "Design brief lands. Target: −8% unit cost, meet updated EU compliance." },
  { time: "Day 1–4", type: "pain", tag: "Data Stitching", label: "The Data Desert", short: "ERP, CAD, Excel — days of gathering instead of designing.", waste: 72, wasteLabel: "time lost" },
  { time: "Day 5", type: "neutral", label: "Rough Estimate", short: "Finally has a cost picture. Starts exploring alternatives." },
  { time: "Day 5–9", type: "pain", tag: "Tribal Knowledge", label: "The Expertise Drain", short: "Senior expert on leave. No one else knows the manufacturing limits.", waste: 58, wasteLabel: "unguided decisions" },
  { time: "Day 10", type: "neutral", label: "Design Review", short: "Presents new assembly. Costing was based on outdated vendor quotes." },
  { time: "Day 10–14", type: "pain", tag: "Redesign Trap", label: "Back to Square One", short: "Too expensive. Too dirty. Found out too late. Costly rework begins.", waste: 85, wasteLabel: "rework probability" },
  { time: "Day 15+", type: "neutral", label: "Cycle Repeats", short: "Cost target unvalidated. Compliance unknown. Start over." },
];

const AFTER = [
  { time: "0 min", type: "neutral", label: "Same Brief", short: "Same brief. Same targets. Forge Engine is connected." },
  { time: "2 min", type: "solved", tag: "Data Stitching", ref: "Data Desert", label: "Instant Cost Picture", short: "BOM auto-parsed. ERP, vendor, and cost data unified in seconds." },
  { time: "5 min", type: "neutral", label: "Exploring Alternatives", short: "Engineer explores design variants with live cost and carbon feedback." },
  { time: "8 min", type: "solved", tag: "Tribal Knowledge", ref: "Expertise Drain", label: "Guided Decisions", short: "Manufacturing constraints and tribal know-how surfaced automatically." },
  { time: "12 min", type: "neutral", label: "Design Review", short: "Presents validated design. Numbers are current. Confidence is high." },
  { time: "15 min", type: "solved", tag: "Redesign Trap", ref: "Redesign Trap", label: "First-Time Right", short: "Cost, carbon, and compliance validated before any prototype." },
  { time: "20 min", type: "neutral", label: "Done", short: "Design approved. Targets met. No rework. Move to next project." },
];

const STATS = [
  { value: "41–194%", label: "more engineering hours over 20 years" },
  { value: "80%", label: "of cost & impact locked at design" },
  { value: "0", label: "tools bridging design to outcomes" },
];

function Ring({ percent, active, delay, variant }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * (active ? percent : 0)) / 100;
  const color = variant === "green" ? C.forestGreen : C.orange;
  const dimColor = variant === "green" ? C.greenDim : C.orangeDim;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
      <circle cx="32" cy="32" r={r} fill="none" stroke={dimColor} strokeWidth="3.5" />
      <circle cx="32" cy="32" r={r} fill="none"
        stroke={color} strokeWidth="3.5"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 32 32)"
        style={{ transition: `stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1) ${delay}s` }} />
      <text x="32" y="34" textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="13" fontWeight="700"
        fontFamily="'DM Sans',sans-serif"
        style={{ opacity: active ? 1 : 0, transition: "opacity 0.6s ease" }}>
        {percent}%
      </text>
    </svg>
  );
}

function Pulse({ color }) {
  return (
    <div style={{ position: "absolute", inset: -6, borderRadius: "50%", pointerEvents: "none" }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%",
        background: color, animation: "pulse 2s ease-in-out infinite",
      }} />
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(2.5);opacity:0}}`}</style>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke={C.forestGreen} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.5s" fill="freeze" />
        <animate attributeName="stroke-dasharray" from="0 20" to="20 0" dur="0.5s" fill="freeze" />
      </path>
    </svg>
  );
}

function TimelineSection({ title, subtitle, accent, steps, autoDelay, isPain }) {
  const [active, setActive] = useState(-1);
  const [revealed, setRevealed] = useState(new Set());
  const [autoplay, setAutoplay] = useState(true);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !autoplay) return;
    let step = 0;
    const run = () => {
      setActive(step);
      setRevealed(p => new Set([...p, step]));
      step++;
      if (step < steps.length) timerRef.current = setTimeout(run, 1200);
      else setAutoplay(false);
    };
    timerRef.current = setTimeout(run, autoDelay);
    return () => clearTimeout(timerRef.current);
  }, [visible]);

  const handleClick = (i) => {
    setAutoplay(false);
    clearTimeout(timerRef.current);
    setActive(i);
    setRevealed(p => new Set([...p, i]));
  };

  const d = active >= 0 ? steps[active] : null;
  const painType = isPain ? "pain" : "solved";
  const dotColor = isPain ? C.orange : C.forestGreen;
  const glowColor = isPain ? C.orangeGlow : C.greenGlow;

  return (
    <div ref={ref} style={{
      width: "100%", maxWidth: 960, margin: "0 auto",
      opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(40px)",
      transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
    }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <h3 style={{
          fontFamily: "'DM Serif Display',serif", fontSize: "clamp(1.4rem,3vw,2rem)",
          fontWeight: 600, color: C.forestGreenDark, margin: 0,
        }}>
          {title} <span style={{ color: accent, fontStyle: "italic" }}>{subtitle}</span>
        </h3>
      </div>

      <div style={{
        display: "flex", alignItems: "flex-start", width: "100%",
        position: "relative", justifyContent: "center", padding: "0 8px",
      }}>
        <div style={{
          position: "absolute", top: 30, left: "7%", right: "7%", height: 2,
          background: `linear-gradient(to right, transparent, ${isPain ? C.warmGrayLight + "60" : C.forestGreenLight + "40"}, ${isPain ? C.warmGrayLight + "60" : C.forestGreenLight + "40"}, transparent)`,
        }} />

        {steps.map((step, i) => {
          const isActive = active === i;
          const isRevealed = revealed.has(i);
          const isHighlight = step.type === painType;
          return (
            <div key={i} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              cursor: "pointer", position: "relative", zIndex: isActive ? 10 : 1,
            }} onClick={() => handleClick(i)}
               onMouseEnter={() => { if (!autoplay) setActive(i); }}>

              <div style={{
                fontSize: "0.58rem", color: isActive ? accent : C.warmGrayLight,
                marginBottom: 8, letterSpacing: "0.08em", fontWeight: isActive ? 700 : 400,
                transition: "color 0.3s", whiteSpace: "nowrap",
                fontFamily: "'DM Sans',sans-serif",
              }}>{step.time}</div>

              <div style={{
                width: isActive ? 20 : isHighlight ? 14 : 10,
                height: isActive ? 20 : isHighlight ? 14 : 10,
                borderRadius: "50%",
                background: isActive ? (isHighlight ? dotColor : C.warmGray) : (isRevealed && isHighlight ? dotColor : "transparent"),
                border: `2px solid ${isHighlight ? dotColor : (isActive ? C.warmGray : C.warmGrayLight + "80")}`,
                transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                boxShadow: isActive ? `0 0 20px ${isHighlight ? glowColor : "rgba(107,107,107,0.15)"}` : "none",
                position: "relative", zIndex: 2,
              }}>
                {isActive && isHighlight && <Pulse color={dotColor} />}
              </div>

              <div style={{
                marginTop: 10, fontSize: "0.55rem", textTransform: "uppercase",
                letterSpacing: "0.08em", textAlign: "center", fontWeight: 700,
                fontFamily: "'DM Sans',sans-serif",
                color: isActive ? (isHighlight ? dotColor : C.warmGray) : C.warmGrayLight,
                opacity: isRevealed ? 1 : 0, transform: isRevealed ? "none" : "translateY(8px)",
                transition: "all 0.4s ease", maxWidth: 80, lineHeight: 1.3,
              }}>
                {isHighlight ? step.tag : step.label}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 40, width: "100%", maxWidth: 540, minHeight: 140, margin: "40px auto 0" }}>
        {d ? (
          <div key={`${isPain}-${active}`} style={{
            background: C.white,
            border: `1px solid ${d.type === painType ? (isPain ? C.orange + "30" : C.forestGreen + "30") : C.border}`,
            borderRadius: 14, padding: "28px 32px",
            borderLeft: d.type === painType ? `3px solid ${isPain ? C.orange : C.forestGreen}` : undefined,
            animation: "cardIn 0.4s cubic-bezier(0.4,0,0.2,1) forwards",
            display: "flex", gap: 20, alignItems: "center",
            boxShadow: "0 4px 24px rgba(45,90,61,0.06)",
          }}>
            <style>{`@keyframes cardIn { from{opacity:0;transform:translateY(14px) scale(0.97)} to{opacity:1;transform:none}}`}</style>

            {d.type === "pain" && <Ring percent={d.waste} active={revealed.has(active)} delay={0.15} variant="orange" />}
            {d.type === "solved" && (
              <div style={{
                width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
                background: C.greenDim, display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px solid ${C.forestGreen}30`,
              }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M5 15L11 21L23 7" stroke={C.forestGreen} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.6s" fill="freeze" />
                    <animate attributeName="stroke-dasharray" from="0 40" to="40 0" dur="0.6s" fill="freeze" />
                  </path>
                </svg>
              </div>
            )}

            <div style={{ flex: 1 }}>
              {d.type === "pain" && (
                <div style={{ fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.orange, marginBottom: 5, fontFamily: "'DM Sans',sans-serif" }}>
                  {d.wasteLabel}
                </div>
              )}
              {d.type === "solved" && d.ref && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.1em", color: C.forestGreen, marginBottom: 5,
                  fontFamily: "'DM Sans',sans-serif",
                }}>
                  <CheckIcon /> {d.ref} → resolved
                </div>
              )}
              <div style={{
                fontFamily: "'DM Serif Display',serif",
                fontSize: d.type === "neutral" ? "1.05rem" : "1.2rem",
                fontWeight: 600, color: C.forestGreenDark, marginBottom: 6,
              }}>{d.label}</div>
              <div style={{ fontSize: "0.82rem", color: C.warmGray, lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" }}>{d.short}</div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", color: C.warmGrayLight, fontSize: "0.8rem", paddingTop: 32, fontStyle: "italic", fontFamily: "'DM Sans',sans-serif" }}>
            Click any point on the timeline
          </div>
        )}
      </div>
    </div>
  );
}

function StatusQuoGap() {
  const [headerVis, setHeaderVis] = useState(false);
  const [dividerVis, setDividerVis] = useState(false);
  const divRef = useRef(null);

  useEffect(() => { setTimeout(() => setHeaderVis(true), 200); }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setDividerVis(true); obs.disconnect(); }
    }, { threshold: 0.5 });
    if (divRef.current) obs.observe(divRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{
      background: C.bg, minHeight: "100vh",
      fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ padding: "80px 24px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        <div style={{
          textAlign: "center", marginBottom: 64, maxWidth: 620,
          opacity: headerVis ? 1 : 0, transform: headerVis ? "none" : "translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <h2 style={{
            fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2rem,5vw,3rem)",
            fontWeight: 600, color: C.forestGreenDark, lineHeight: 1.3, margin: 0,
          }}>
            The <span style={{ color: C.orange, fontStyle: "italic" }}>"Status Quo"</span> Gap
          </h2>
          <p style={{ color: C.warmGray, fontSize: "0.95rem", marginTop: 16, lineHeight: 1.7 }}>
            <span style={{ color: C.forestGreen, fontWeight: 700 }}>80%</span> of environmental impact
            is decided at the design stage, yet engineers are designing in the dark.
          </p>
        </div>

        <TimelineSection
          title="Today:"
          subtitle="2–3 weeks of friction"
          accent={C.orange}
          steps={BEFORE}
          autoDelay={600}
          isPain={true}
        />

        <div style={{
          display: "flex", gap: 14, marginTop: 48, maxWidth: 720, width: "100%",
          justifyContent: "center", flexWrap: "wrap", padding: "0 12px",
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              flex: "1 1 190px", textAlign: "center", padding: "20px 14px",
              background: C.white, border: `1px solid ${C.border}`,
              borderRadius: 12, borderTop: `2px solid ${C.orange}`,
              boxShadow: "0 2px 12px rgba(45,90,61,0.04)",
            }}>
              <div style={{
                fontFamily: "'DM Serif Display',serif", fontSize: "1.6rem",
                fontWeight: 700, color: C.orange, lineHeight: 1,
              }}>{s.value}</div>
              <div style={{ fontSize: "0.68rem", color: C.warmGray, marginTop: 6, lineHeight: 1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div ref={divRef} style={{
          margin: "72px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          opacity: dividerVis ? 1 : 0, transition: "opacity 1s ease",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.forestGreen}, ${C.forestGreenLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 30px ${C.greenGlow}`,
            animation: dividerVis ? "divPulse 2.5s ease-in-out infinite" : "none",
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 4V18M11 18L6 13M11 18L16 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <style>{`@keyframes divPulse { 0%,100%{box-shadow:0 0 20px ${C.greenGlow}} 50%{box-shadow:0 0 50px ${C.greenGlow}}}`}</style>
          <div style={{
            fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.18em",
            color: C.forestGreen, fontWeight: 700,
          }}>
            What if it didn't have to be this way?
          </div>
        </div>

        <TimelineSection
          title="With Forge Engine:"
          subtitle="20 minutes"
          accent={C.forestGreen}
          steps={AFTER}
          autoDelay={600}
          isPain={false}
        />

        <div style={{
          marginTop: 64, textAlign: "center", maxWidth: 480,
          animation: "fadeUp 0.6s ease forwards",
        }}>
          <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none}}`}</style>
          <div style={{
            fontFamily: "'DM Serif Display',serif", fontSize: "clamp(1.2rem,2.5vw,1.6rem)",
            fontWeight: 600, color: C.forestGreenDark, lineHeight: 1.4, marginBottom: 8,
          }}>
            Weeks → Minutes.
          </div>
          <div style={{
            fontSize: "0.88rem", color: C.warmGray, lineHeight: 1.6,
          }}>
            The economic brain for mechanical product innovation.
          </div>
        </div>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("status-quo-container");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(React.createElement(StatusQuoGap, null));
}
