import React, { useEffect, useState, useRef } from "react";

// ── Morphing mesh background ─────────────────────────────────
function MeshBackground() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Primary warm blob */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: 560,
          height: 560,
          background:
            "radial-gradient(circle at 40% 40%, rgba(200,169,110,.1) 0%, rgba(160,120,70,.05) 40%, transparent 70%)",
          animation: "morphBlob1 20s ease-in-out infinite",
          filter: "blur(30px)",
          willChange: "transform",
        }}
      />
      {/* Violet accent blob */}
      <div
        style={{
          position: "absolute",
          bottom: "-8%",
          right: "-5%",
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle, rgba(100,70,130,.08) 0%, transparent 68%)",
          animation: "morphBlob2 26s ease-in-out infinite",
          filter: "blur(25px)",
        }}
      />
      {/* Terracotta accent */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          right: "20%",
          width: 280,
          height: 280,
          background:
            "radial-gradient(circle, rgba(160,90,60,.07) 0%, transparent 65%)",
          animation: "morphBlob3 18s ease-in-out infinite",
          filter: "blur(20px)",
        }}
      />
      {/* Horizontal hairline */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "8%",
          right: "8%",
          height: 1,
          background:
            "linear-gradient(90deg,transparent,rgba(200,169,110,.12),transparent)",
        }}
      />
    </div>
  );
}

// ── Animated shield visual ───────────────────────────────────
function ShieldVisual() {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    let id;
    const tick = () => {
      setAngle((a) => a + 0.2);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  // Floating data cards
  const CARDS = [
    {
      top: "4%",
      right: "-6%",
      label: "Scam Detected",
      val: "98.4%",
      col: "#c25a5a",
      delay: "0s",
    },
    {
      top: "38%",
      right: "-12%",
      label: "URL Scanned",
      val: "0.3s",
      col: "#c8a96e",
      delay: ".15s",
    },
    {
      bottom: "8%",
      left: "-10%",
      label: "Voice AI",
      val: "Safe",
      col: "#4a9e6b",
      delay: ".3s",
    },
  ];

  return (
    <div
      style={{ position: "relative", width: 220, height: 280, flexShrink: 0 }}
    >
      {/* Floating metric cards */}
      {CARDS.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...c,
            padding: "8px 14px",
            borderRadius: 10,
            background: "rgba(14,12,24,.8)",
            border: "1px solid rgba(255,255,255,.09)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 8px 28px rgba(0,0,0,.4)",
            animation: `orbFloat ${4 + i * 1.2}s ${c.delay} ease-in-out infinite`,
            zIndex: 2,
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ fontSize: 10, color: "#6b6560", marginBottom: 2 }}>
            {c.label}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: c.col }}>
            {c.val}
          </div>
        </div>
      ))}

      {/* Central orb */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 140,
          height: 140,
          animation:
            "orbFloat 6s ease-in-out infinite, orbGlow 4s ease-in-out infinite",
        }}
      >
        {/* Outer rings — slow rotating */}
        {[1, 0.78].map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `1px solid rgba(200,169,110,${0.18 - i * 0.06})`,
              transform: `scale(${s + 0.55}) rotate(${angle * (i % 2 ? 1 : -1) * 0.8}deg)`,
            }}
          >
            {/* Ring dot */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: `rgba(200,169,110,${0.6 - i * 0.2})`,
              }}
            />
          </div>
        ))}
        {/* Core */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "linear-gradient(145deg,rgba(200,169,110,.18),rgba(140,100,60,.1),rgba(80,60,100,.08))",
            border: "1px solid rgba(200,169,110,.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 52,
            boxShadow:
              "0 0 60px rgba(200,169,110,.12), inset 0 1px 0 rgba(255,255,255,.08)",
          }}
        >
          🛡️
        </div>
      </div>
    </div>
  );
}

// ── Staggered chip ───────────────────────────────────────────
function Chip({ icon, label, delay }) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setV(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 20,
        background: "rgba(200,169,110,.06)",
        border: "1px solid rgba(200,169,110,.14)",
        fontSize: 12,
        fontWeight: 500,
        color: "#9a9490",
        opacity: v ? 1 : 0,
        transform: v ? "translateY(0)" : "translateY(8px)",
        transition: "opacity .4s ease, transform .4s ease",
      }}
    >
      <span style={{ fontSize: 13 }}>{icon}</span>
      {label}
    </div>
  );
}

// ── Counter animation ─────────────────────────────────────────
function AnimCounter({ target, suffix = "", duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        let start, frame;
        const tick = (ts) => {
          if (!start) start = ts;
          const pct = Math.min((ts - start) / duration, 1);
          setVal(Math.round(pct * target));
          if (pct < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
      },
      { threshold: 0.3 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

// ── Main hero ─────────────────────────────────────────────────
export default function HeroSection({ onScanNow, onLearnMore }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  const ease = (delay = 0) => ({
    opacity: entered ? 1 : 0,
    transform: entered ? "translateY(0)" : "translateY(16px)",
    transition: `opacity .6s ${delay}s ease, transform .6s ${delay}s ease`,
  });

  return (
    <div
      style={{
        position: "relative",
        padding: "56px 0 52px",
        overflow: "hidden",
      }}
    >
      <MeshBackground />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 48,
          flexWrap: "wrap",
        }}
      >
        {/* LEFT — text */}
        <div style={{ flex: "1 1 340px", minWidth: 280 }}>
          {/* Eyebrow badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 22,
              padding: "5px 14px",
              borderRadius: 20,
              background: "rgba(200,169,110,.07)",
              border: "1px solid rgba(200,169,110,.2)",
              ...ease(0),
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#4a9e6b",
                boxShadow: "0 0 6px rgba(74,158,107,.5)",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#c8a96e",
                letterSpacing: ".08em",
                textTransform: "uppercase",
              }}
            >
              Real-Time AI Protection · India-Ready
            </span>
          </div>

          {/* Headline */}
          <h2
            className="hero-headline"
            style={{ marginBottom: 20, ...ease(0.08) }}
          >
            Guard Against
            <br />
            <em>Scams</em> &amp; <em>Deepfakes</em>
          </h2>

          {/* Sub */}
          <p
            style={{
              fontSize: "clamp(13px,1.5vw,15px)",
              color: "#6b6560",
              lineHeight: 1.75,
              maxWidth: 460,
              marginBottom: 32,
              ...ease(0.16),
            }}
          >
            Detect phishing messages, fake URLs, deepfake audio and video — in
            milliseconds. Fully private, explainable, and built for every
            Indian.
          </p>

          {/* CTA row */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              ...ease(0.22),
            }}
          >
            <button
              onClick={onScanNow}
              className="btn-gold"
              style={{ fontSize: 13 }}
            >
              Start Scanning →
            </button>
            <button
              onClick={onLearnMore}
              className="btn-ghost"
              style={{ fontSize: 13 }}
            >
              How it works
            </button>
          </div>

          {/* Trust chips */}
          <div
            style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 28 }}
          >
            <Chip icon="🔒" label="Zero Storage" delay={700} />
            <Chip icon="🇮🇳" label="India-First" delay={860} />
            <Chip icon="⚡" label="< 200ms" delay={1020} />
            <Chip icon="🧠" label="Explainable AI" delay={1180} />
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 36,
              flexWrap: "wrap",
              ...ease(0.32),
            }}
          >
            {[
              { n: 10, s: "K+", label: "Messages scanned" },
              { n: 98, s: "%", label: "Detection accuracy" },
              { n: 3, s: "langs", label: "Languages supported" },
            ].map(({ n, s, label }, i) => (
              <div key={i}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#c8a96e",
                    letterSpacing: "-.02em",
                  }}
                >
                  <AnimCounter
                    target={n}
                    suffix={s?.trim() || ""}
                    duration={1600 + i * 200}
                  />
                </div>
                <div style={{ fontSize: 11, color: "#4a4740", marginTop: 2 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — animated visual */}
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 32px",
            opacity: entered ? 1 : 0,
            transform: entered ? "scale(1)" : "scale(.92)",
            transition: "opacity .7s .12s ease, transform .7s .12s ease",
          }}
        >
          <ShieldVisual />
        </div>
      </div>
    </div>
  );
}
