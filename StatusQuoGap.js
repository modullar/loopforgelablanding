(() => {
  const { useState, useEffect, useRef } = React;
  const C = {
    bgLight: "#faf9f7",
    bgDark: "#172a1e",
    // Subdued dark forest green per user request
    white: "#ffffff",
    forestGreen: "#2d5a3d",
    forestGreenLight: "#4a7c59",
    forestGreenDark: "#1e3d2b",
    warmGray: "#6b6b6b",
    warmGrayLight: "#9a9a9a",
    warmGrayLighter: "#f5f5f4",
    orange: "#f97316",
    orangeLight: "#fdba74",
    orangeDim: "rgba(249,115,22,0.12)",
    orangeGlow: "rgba(249,115,22,0.3)",
    greenDim: "rgba(45,90,61,0.08)",
    greenGlow: "rgba(45,90,61,0.25)",
    borderLight: "rgba(45,90,61,0.1)",
    borderDark: "rgba(255,255,255,0.08)",
    cardDark: "#1e3828",
    // Slightly lighter subdued green
    textDark: "#f5f5f5",
    textDarkMuted: "#a3bcae"
    // Pale green-gray
  };
  const BEFORE = [
    { time: "Day 1", type: "neutral", label: "New Brief", short: "Design brief lands. Target: \u22128% unit cost." },
    { time: "Day 1\u20134", type: "pain", tag: "Data Stitching", label: "Data Desert", short: "ERP, CAD, Excel \u2014 days of gathering.", waste: 72, wasteLabel: "time lost" },
    { time: "Day 5", type: "neutral", label: "Estimate", short: "Finally has a cost picture." },
    { time: "Day 5\u20139", type: "pain", tag: "Brain Drain", label: "Expertise Gap", short: "Senior expert on leave.", waste: 58, wasteLabel: "blind spots" },
    { time: "Day 10", type: "neutral", label: "Review", short: "Presents new assembly." },
    { time: "Day 10\u201314", type: "pain", tag: "Redesign", label: "Square One", short: "Too expensive. Discovered too late.", waste: 85, wasteLabel: "rework prob." },
    { time: "Day 15+", type: "neutral", label: "Repeats", short: "Cost target unvalidated. Start over." }
  ];
  const AFTER = [
    { time: "0 min", type: "neutral", label: "Same Brief", short: "Same targets. Engine connected." },
    { time: "2 min", type: "solved", tag: "Data Stitching", ref: "Data Desert", label: "Instant Cost", short: "BOM auto-parsed and unified." },
    { time: "5 min", type: "neutral", label: "Exploring", short: "Engineer explores design variants." },
    { time: "8 min", type: "solved", tag: "Tribal Know.", ref: "Expertise Gap", label: "Guided Moves", short: "Manufacturing constraints surfaced." },
    { time: "12 min", type: "neutral", label: "Review", short: "Presents validated design." },
    { time: "15 min", type: "solved", tag: "Redesign", ref: "Square One", label: "1st-Time Right", short: "Everything validated before prototype." },
    { time: "20 min", type: "neutral", label: "Done", short: "Design approved. Targets met." }
  ];
  const STATS = [
    { value: "41\u2013194%", label: "more hours over 20 years" },
    { value: "80%", label: "of impact locked at design" }
  ];
  function Ring({ percent, active, delay, variant }) {
    const r = 26;
    const circ = 2 * Math.PI * r;
    const offset = circ - circ * (active ? percent : 0) / 100;
    const color = variant === "green" ? C.forestGreen : C.orange;
    const dimColor = variant === "green" ? C.greenDim : C.orangeDim;
    return /* @__PURE__ */ React.createElement("svg", { width: "64", height: "64", viewBox: "0 0 64 64", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("circle", { cx: "32", cy: "32", r, fill: "none", stroke: dimColor, strokeWidth: "3.5" }), /* @__PURE__ */ React.createElement(
      "circle",
      {
        cx: "32",
        cy: "32",
        r,
        fill: "none",
        stroke: color,
        strokeWidth: "3.5",
        strokeDasharray: circ,
        strokeDashoffset: offset,
        strokeLinecap: "round",
        transform: "rotate(-90 32 32)",
        style: { transition: `stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1) ${delay}s` }
      }
    ), /* @__PURE__ */ React.createElement(
      "text",
      {
        x: "32",
        y: "34",
        textAnchor: "middle",
        dominantBaseline: "middle",
        fill: color,
        fontSize: "13",
        fontWeight: "700",
        fontFamily: "'DM Sans',sans-serif",
        style: { opacity: active ? 1 : 0, transition: "opacity 0.6s ease" }
      },
      percent,
      "%"
    ));
  }
  function Pulse({ color }) {
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: -6, borderRadius: "50%", pointerEvents: "none" } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      background: color,
      animation: "pulse 2s ease-in-out infinite"
    } }), /* @__PURE__ */ React.createElement("style", null, `@keyframes pulse { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(2.5);opacity:0}}`));
  }
  function CheckIcon() {
    return /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M2.5 7.5L5.5 10.5L11.5 3.5", stroke: C.forestGreen, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("animate", { attributeName: "stroke-dashoffset", from: "20", to: "0", dur: "0.5s", fill: "freeze" }), /* @__PURE__ */ React.createElement("animate", { attributeName: "stroke-dasharray", from: "0 20", to: "20 0", dur: "0.5s", fill: "freeze" })));
  }
  function TimelineSection({ title, subtitle, accent, steps, autoDelay, isPain }) {
    const [active, setActive] = useState(-1);
    const [revealed, setRevealed] = useState(/* @__PURE__ */ new Set());
    const [autoplay, setAutoplay] = useState(true);
    const [visible, setVisible] = useState(false);
    const ref = useRef(null);
    const timerRef = useRef(null);
    useEffect(() => {
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      }, { threshold: 0.2 });
      if (ref.current) obs.observe(ref.current);
      return () => obs.disconnect();
    }, []);
    useEffect(() => {
      if (!visible || !autoplay) return;
      let step = 0;
      const run = () => {
        setActive(step);
        setRevealed((p) => /* @__PURE__ */ new Set([...p, step]));
        step++;
        if (step < steps.length) timerRef.current = setTimeout(run, 1200);
        else setAutoplay(false);
      };
      timerRef.current = setTimeout(run, autoDelay);
      return () => clearTimeout(timerRef.current);
    }, [visible, autoplay, autoDelay, steps.length]);
    const handleClick = (i) => {
      setAutoplay(false);
      clearTimeout(timerRef.current);
      setActive(i);
      setRevealed((p) => /* @__PURE__ */ new Set([...p, i]));
    };
    const d = active >= 0 ? steps[active] : null;
    const isDark = isPain;
    const painType = isPain ? "pain" : "solved";
    const dotColor = isPain ? C.orange : C.forestGreen;
    const glowColor = isPain ? C.orangeGlow : C.greenGlow;
    return /* @__PURE__ */ React.createElement("div", { ref, style: {
      width: "100%",
      maxWidth: 1e3,
      margin: "0 auto",
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(40px)",
      transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
      display: "flex",
      flexDirection: "column"
    } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginBottom: 64 } }, /* @__PURE__ */ React.createElement("h3", { style: {
      fontFamily: "'DM Serif Display',serif",
      fontSize: "clamp(1.4rem,2.5vw,2.2rem)",
      fontWeight: 600,
      color: isDark ? C.white : C.forestGreenDark,
      margin: 0
    } }, title, " ", /* @__PURE__ */ React.createElement("span", { style: { color: accent, fontStyle: "italic" } }, subtitle))), /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "flex-start",
      width: "100%",
      position: "relative",
      justifyContent: "space-between",
      padding: "0 4vw"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: 30,
      left: "7%",
      right: "7%",
      height: 3,
      background: `linear-gradient(to right, transparent, ${isDark ? C.borderDark : C.forestGreenLight + "40"}, ${isDark ? C.borderDark : C.forestGreenLight + "40"}, transparent)`
    } }), steps.map((step, i) => {
      const isActive = active === i;
      const isRevealed = revealed.has(i);
      const isHighlight = step.type === painType;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: i,
          style: {
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            position: "relative",
            zIndex: isActive ? 10 : 1
          },
          onClick: () => handleClick(i),
          onMouseEnter: () => {
            if (!autoplay) setActive(i);
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: {
          fontSize: "0.6rem",
          color: isActive ? accent : isDark ? C.textDarkMuted : C.warmGrayLight,
          marginBottom: 10,
          letterSpacing: "0.08em",
          fontWeight: isActive ? 700 : 500,
          transition: "color 0.3s",
          whiteSpace: "nowrap",
          fontFamily: "'DM Sans',sans-serif"
        } }, step.time),
        /* @__PURE__ */ React.createElement("div", { style: {
          width: isActive ? 24 : isHighlight ? 16 : 12,
          height: isActive ? 24 : isHighlight ? 16 : 12,
          borderRadius: "50%",
          background: isActive ? isHighlight ? dotColor : isDark ? "#525252" : C.warmGray : isRevealed && isHighlight ? dotColor : isDark ? C.bgDark : "transparent",
          border: `3px solid ${isHighlight ? dotColor : isActive ? isDark ? "#888" : C.warmGray : isDark ? "#446655" : C.warmGrayLight + "80"}`,
          transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: isActive ? `0 0 24px ${isHighlight ? glowColor : isDark ? "rgba(255,255,255,0.05)" : "rgba(107,107,107,0.15)"}` : "none",
          position: "relative",
          zIndex: 2
        } }, isActive && isHighlight && /* @__PURE__ */ React.createElement(Pulse, { color: dotColor })),
        /* @__PURE__ */ React.createElement("div", { style: {
          marginTop: 14,
          fontSize: "0.55rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          textAlign: "center",
          fontWeight: 700,
          fontFamily: "'DM Sans',sans-serif",
          color: isActive ? isHighlight ? dotColor : isDark ? C.white : C.warmGray : isDark ? C.textDarkMuted : C.warmGrayLight,
          opacity: isRevealed ? 1 : 0,
          transform: isRevealed ? "none" : "translateY(8px)",
          transition: "all 0.4s ease",
          maxWidth: 80,
          lineHeight: 1.3
        } }, isHighlight ? step.tag : step.label)
      );
    })), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 50, width: "100%", maxWidth: 640, minHeight: 160, margin: "50px auto 0", display: "flex", flexDirection: "column" } }, d ? /* @__PURE__ */ React.createElement("div", { key: `${isPain}-${active}`, style: {
      background: isDark ? C.cardDark : C.white,
      border: `1px solid ${d.type === painType ? isPain ? C.orange + "50" : C.forestGreen + "30" : isDark ? C.borderDark : C.borderLight}`,
      borderRadius: 16,
      padding: "32px",
      borderLeft: d.type === painType ? `4px solid ${isPain ? C.orange : C.forestGreen}` : void 0,
      animation: "cardIn 0.4s cubic-bezier(0.4,0,0.2,1) forwards",
      display: "flex",
      gap: 24,
      alignItems: "center",
      boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.4)" : "0 8px 32px rgba(45,90,61,0.08)",
      flex: 1,
      justifyContent: "center"
    } }, /* @__PURE__ */ React.createElement("style", null, `@keyframes cardIn { from{opacity:0;transform:translateY(14px) scale(0.97)} to{opacity:1;transform:none}}`), d.type === "pain" && /* @__PURE__ */ React.createElement(Ring, { percent: d.waste, active: revealed.has(active), delay: 0.15, variant: "orange" }), d.type === "solved" && /* @__PURE__ */ React.createElement("div", { style: {
      width: 72,
      height: 72,
      borderRadius: "50%",
      flexShrink: 0,
      background: C.greenDim,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: `2px solid ${C.forestGreen}30`
    } }, /* @__PURE__ */ React.createElement("svg", { width: "32", height: "32", viewBox: "0 0 28 28", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M5 15L11 21L23 7", stroke: C.forestGreen, strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("animate", { attributeName: "stroke-dashoffset", from: "40", to: "0", dur: "0.6s", fill: "freeze" }), /* @__PURE__ */ React.createElement("animate", { attributeName: "stroke-dasharray", from: "0 40", to: "40 0", dur: "0.6s", fill: "freeze" })))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, d.type === "pain" && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.orange, marginBottom: 8, fontFamily: "'DM Sans',sans-serif" } }, d.wasteLabel), d.type === "solved" && d.ref && /* @__PURE__ */ React.createElement("div", { style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: "0.62rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      color: C.forestGreen,
      marginBottom: 8,
      fontFamily: "'DM Sans',sans-serif"
    } }, /* @__PURE__ */ React.createElement(CheckIcon, null), " ", d.ref, " \u2192 resolved"), /* @__PURE__ */ React.createElement("div", { style: {
      fontFamily: "'DM Serif Display',serif",
      fontSize: d.type === "neutral" ? "1.15rem" : "1.35rem",
      fontWeight: 600,
      color: isDark ? C.white : C.forestGreenDark,
      marginBottom: 8
    } }, d.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.9rem", color: isDark ? C.textDarkMuted : C.warmGray, lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" } }, d.short))) : /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: isDark ? "#668877" : C.warmGrayLight, fontSize: "0.85rem", fontStyle: "italic", fontFamily: "'DM Sans',sans-serif" } }, "Interact with the timeline to explore")));
  }
  function StatusQuoGap() {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef(null);
    const [headerVis, setHeaderVis] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    useEffect(() => {
      setTimeout(() => setHeaderVis(true), 200);
    }, []);
    useEffect(() => {
      const handleMove = (e) => {
        if (!isDragging) return;
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        let x = e.clientX ?? (e.touches && e.touches.length > 0 ? e.touches[0].clientX : 0);
        let pos = (x - rect.left) / rect.width * 100;
        setSliderPos(Math.max(0, Math.min(100, pos)));
      };
      const handleUp = () => setIsDragging(false);
      if (isDragging) {
        window.addEventListener("pointermove", handleMove);
        window.addEventListener("touchmove", handleMove, { passive: false });
        window.addEventListener("pointerup", handleUp);
        window.addEventListener("touchend", handleUp);
      }
      return () => {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("touchmove", handleMove);
        window.removeEventListener("pointerup", handleUp);
        window.removeEventListener("touchend", handleUp);
      };
    }, [isDragging]);
    const handleDragStart = (e) => {
      if (e.type === "pointerdown" && e.button !== 0) return;
      setIsDragging(true);
    };
    return /* @__PURE__ */ React.createElement("div", { style: {
      fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      width: "100%"
    } }, /* @__PURE__ */ React.createElement("style", null, `
        .sqg-slider-layer {
          grid-area: 1 / 1;
          width: 100vw;
          min-height: 100vh;
          padding: 80px 24px 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          isolation: isolate;
        }
        .sqg-drag-handle {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .sqg-drag-handle:hover {
          transform: scale(1.1);
          box-shadow: 0 0 30px rgba(249,115,22,0.5);
        }
        .sqg-drag-handle:active {
          transform: scale(0.95);
        }
      `), /* @__PURE__ */ React.createElement(
      "div",
      {
        ref: containerRef,
        style: {
          display: "grid",
          width: "100vw",
          position: "relative",
          overflow: "hidden"
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "sqg-slider-layer", style: {
        background: C.bgLight
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        textAlign: "center",
        marginBottom: 72,
        maxWidth: 620,
        margin: "0 auto 72px",
        opacity: headerVis ? 1 : 0,
        transform: headerVis ? "none" : "translateY(20px)",
        transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)"
      } }, /* @__PURE__ */ React.createElement("h2", { style: {
        fontFamily: "'DM Serif Display',serif",
        fontSize: "clamp(2rem,4vw,2.75rem)",
        fontWeight: 600,
        color: C.forestGreenDark,
        lineHeight: 1.3,
        margin: 0
      } }, /* @__PURE__ */ React.createElement("span", { style: { color: C.forestGreen, fontStyle: "italic" } }, "Forge Engine"), " Clarity"), /* @__PURE__ */ React.createElement("p", { style: { color: C.warmGray, fontSize: "1.05rem", marginTop: 16, lineHeight: 1.7 } }, "Embed market, cost, and carbon data directly into the workflow. Stop the redesign trap before it starts.")), /* @__PURE__ */ React.createElement(
        TimelineSection,
        {
          title: "With Forge Engine:",
          subtitle: "20 minutes",
          accent: C.forestGreen,
          steps: AFTER,
          autoDelay: 1800,
          isPain: false
        }
      ), /* @__PURE__ */ React.createElement("div", { style: {
        marginTop: 80,
        textAlign: "center",
        maxWidth: 480,
        margin: "80px auto 0"
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        fontFamily: "'DM Serif Display',serif",
        fontSize: "clamp(1.4rem,2.5vw,1.8rem)",
        fontWeight: 600,
        color: C.forestGreenDark,
        lineHeight: 1.4,
        marginBottom: 8
      } }, "Weeks \u2192 ", /* @__PURE__ */ React.createElement("span", { style: { color: C.forestGreen } }, "Minutes.")), /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: "0.95rem",
        color: C.warmGray,
        lineHeight: 1.6
      } }, "The economic brain for mechanical product innovation."))),
      /* @__PURE__ */ React.createElement("div", { className: "sqg-slider-layer", style: {
        background: C.bgDark,
        clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        textAlign: "center",
        marginBottom: 72,
        maxWidth: 620,
        margin: "0 auto 72px",
        opacity: headerVis ? 1 : 0,
        transform: headerVis ? "none" : "translateY(20px)",
        transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)"
      } }, /* @__PURE__ */ React.createElement("h2", { style: {
        fontFamily: "'DM Serif Display',serif",
        fontSize: "clamp(2rem,4vw,2.75rem)",
        fontWeight: 600,
        color: C.white,
        lineHeight: 1.3,
        margin: 0
      } }, "The ", /* @__PURE__ */ React.createElement("span", { style: { color: C.orange, fontStyle: "italic" } }, '"Status Quo"'), " Gap"), /* @__PURE__ */ React.createElement("p", { style: { color: C.textDarkMuted, fontSize: "1.05rem", marginTop: 16, lineHeight: 1.7 } }, /* @__PURE__ */ React.createElement("span", { style: { color: C.orange, fontWeight: 700 } }, "80%"), " of environmental impact is decided at the design stage, yet engineers are designing in the dark.")), /* @__PURE__ */ React.createElement(
        TimelineSection,
        {
          title: "Today:",
          subtitle: "2\u20133 weeks of friction",
          accent: C.orange,
          steps: BEFORE,
          autoDelay: 600,
          isPain: true
        }
      ), /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        gap: 16,
        marginTop: 72,
        maxWidth: 600,
        width: "100%",
        justifyContent: "center",
        flexWrap: "wrap",
        margin: "72px auto 0"
      } }, STATS.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
        flex: "auto",
        minWidth: 200,
        textAlign: "center",
        padding: "24px 16px",
        background: C.cardDark,
        border: `1px solid ${C.borderDark}`,
        borderRadius: 14,
        borderTop: `3px solid ${C.orange}`,
        boxShadow: "0 12px 40px rgba(0,0,0,0.3)"
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        fontFamily: "'DM Serif Display',serif",
        fontSize: "1.8rem",
        fontWeight: 700,
        color: C.orangeLight,
        lineHeight: 1
      } }, s.value), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.75rem", color: C.textDarkMuted, marginTop: 8, lineHeight: 1.5 } }, s.label))))),
      /* @__PURE__ */ React.createElement("div", { style: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: `${sliderPos}%`,
        width: 4,
        marginLeft: -2,
        background: C.orange,
        zIndex: 50
      } }, /* @__PURE__ */ React.createElement(
        "div",
        {
          onPointerDown: handleDragStart,
          onTouchStart: handleDragStart,
          style: {
            position: "absolute",
            top: 0,
            bottom: 0,
            left: -20,
            right: -20,
            cursor: "col-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }
        },
        /* @__PURE__ */ React.createElement("div", { className: "sqg-drag-handle", style: {
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: C.orange,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 24px ${C.orangeGlow}`,
          cursor: "col-resize"
        } }, /* @__PURE__ */ React.createElement("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M14 18l-6-6 6-6", transform: "translate(-4,0)" }), /* @__PURE__ */ React.createElement("path", { d: "M10 18l6-6-6-6", transform: "translate(4,0)" })))
      ))
    ));
  }
  const rootElement = document.getElementById("status-quo-container");
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(React.createElement(StatusQuoGap, null));
  }
})();
