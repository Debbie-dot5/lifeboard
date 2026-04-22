"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  useInView hook — triggers once on scroll into view                 */
/* ------------------------------------------------------------------ */
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ------------------------------------------------------------------ */
/*  Keyframe animations                                                */
/* ------------------------------------------------------------------ */
const keyframes = `
  /* Ambient orb drifts */
  @keyframes orbDrift1 {
    0%   { transform: translate(0, 0) scale(1); }
    50%  { transform: translate(40px, -30px) scale(1.05); }
    100% { transform: translate(0, 0) scale(1); }
  }
  @keyframes orbDrift2 {
    0%   { transform: translate(0, 0) scale(1); }
    50%  { transform: translate(-30px, 40px) scale(1.08); }
    100% { transform: translate(0, 0) scale(1); }
  }
  @keyframes orbDrift3 {
    0%   { transform: translate(0, 0) scale(1); }
    50%  { transform: translate(20px, 20px) scale(0.95); }
    100% { transform: translate(0, 0) scale(1); }
  }

  /* Floating card animations */
  @keyframes float1 {
    0%   { transform: translateY(-10px) rotate(-8deg); }
    100% { transform: translateY(10px) rotate(-8deg); }
  }
  @keyframes float2 {
    0%   { transform: translateY(8px) rotate(6deg); }
    100% { transform: translateY(-8px) rotate(6deg); }
  }
  @keyframes float3 {
    0%   { transform: translateY(-6px) rotate(-4deg); }
    100% { transform: translateY(14px) rotate(-4deg); }
  }
  @keyframes float4 {
    0%   { transform: translateY(12px) rotate(8deg); }
    100% { transform: translateY(-6px) rotate(8deg); }
  }
  @keyframes float5 {
    0%   { transform: translateY(-8px) rotate(-6deg); }
    100% { transform: translateY(8px) rotate(-6deg); }
  }

  /* Hero word reveal */
  @keyframes wordReveal {
    0%   { opacity: 0; transform: translateY(18px); filter: blur(4px); }
    100% { opacity: 1; transform: translateY(0); filter: blur(0); }
  }

  /* Fade up */
  @keyframes fadeUp {
    0%   { opacity: 0; transform: translateY(14px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  /* Slide in from left */
  @keyframes slideInLeft {
    0%   { opacity: 0; transform: translateX(-60px); }
    100% { opacity: 1; transform: translateX(0); }
  }

  /* Slide in from right */
  @keyframes slideInRight {
    0%   { opacity: 0; transform: translateX(60px); }
    100% { opacity: 1; transform: translateX(0); }
  }

  /* CTA pulsing glow */
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 40px rgba(108,71,255,0.4), 0 0 80px rgba(108,71,255,0.2); }
    50%      { box-shadow: 0 0 60px rgba(108,71,255,0.6), 0 0 120px rgba(108,71,255,0.3); }
  }

  /* Scroll indicator bounce */
  @keyframes scrollBounce {
    0%, 100% { transform: translateY(0); opacity: 0.5; }
    50%      { transform: translateY(6px); opacity: 1; }
  }

  /* Module card entrance */
  @keyframes moduleSlideIn {
    0%   { opacity: 0; transform: translateY(40px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Grain overlay flicker */
  @keyframes grainShift {
    0%, 100% { transform: translate(0, 0); }
    10%  { transform: translate(-2%, -2%); }
    20%  { transform: translate(1%, 3%); }
    30%  { transform: translate(-3%, 1%); }
    40%  { transform: translate(3%, -1%); }
    50%  { transform: translate(-1%, 2%); }
    60%  { transform: translate(2%, -3%); }
    70%  { transform: translate(-2%, 1%); }
    80%  { transform: translate(1%, -2%); }
    90%  { transform: translate(-1%, 3%); }
  }

  /* Star twinkle */
  @keyframes twinkle {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50%      { opacity: 1; transform: scale(1.2); }
  }

  /* Checkbox self-check animation */
  @keyframes checkSelf {
    0%, 60%  { stroke-dashoffset: 24; }
    80%, 100% { stroke-dashoffset: 0; }
  }

  /* Flame flicker */
  @keyframes flameFlicker {
    0%, 100% { transform: scale(1) rotate(-2deg); }
    25% { transform: scale(1.15) rotate(2deg); }
    50% { transform: scale(1.05) rotate(-1deg); }
    75% { transform: scale(1.12) rotate(3deg); }
  }

  /* Bell ring */
  @keyframes bellRing {
    0%, 100% { transform: rotate(0deg); }
    15% { transform: rotate(14deg); }
    30% { transform: rotate(-14deg); }
    45% { transform: rotate(8deg); }
    60% { transform: rotate(-8deg); }
    75% { transform: rotate(4deg); }
    90% { transform: rotate(-2deg); }
  }

  /* Book open */
  @keyframes bookOpen {
    0%, 100% { transform: perspective(200px) rotateY(0deg); }
    50% { transform: perspective(200px) rotateY(-25deg); }
  }

  /* Pen writing */
  @keyframes penWrite {
    0%, 100% { transform: translateX(0) rotate(-35deg); }
    25% { transform: translateX(3px) rotate(-35deg); }
    50% { transform: translateX(1px) rotate(-30deg); }
    75% { transform: translateX(4px) rotate(-35deg); }
  }

  /* Kanban slide */
  @keyframes kanbanSlide {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  /* Section 2 chaos floats */
  @keyframes chaosFloat1 {
    0%   { transform: translate(0, 0) rotate(0deg); }
    25%  { transform: translate(8px, -12px) rotate(5deg); }
    50%  { transform: translate(-5px, 6px) rotate(-3deg); }
    75%  { transform: translate(10px, 3px) rotate(8deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }
  @keyframes chaosFloat2 {
    0%   { transform: translate(0, 0) rotate(0deg); }
    25%  { transform: translate(-10px, 8px) rotate(-6deg); }
    50%  { transform: translate(6px, -10px) rotate(4deg); }
    75%  { transform: translate(-3px, 5px) rotate(-8deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }
  @keyframes chaosFloat3 {
    0%   { transform: translate(0, 0) rotate(0deg); }
    25%  { transform: translate(5px, 10px) rotate(7deg); }
    50%  { transform: translate(-8px, -5px) rotate(-5deg); }
    75%  { transform: translate(12px, -8px) rotate(3deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }

  /* Card glow pulse */
  @keyframes cardGlowPulse {
    0%, 100% { box-shadow: 0 0 30px rgba(108,71,255,0.15), 0 0 60px rgba(108,71,255,0.08); }
    50%      { box-shadow: 0 0 40px rgba(108,71,255,0.25), 0 0 80px rgba(108,71,255,0.12); }
  }

  /* Dot pulse */
  @keyframes dotPulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.3); }
  }

  /* Ring pulse for section 4 */
  @keyframes ringPulse {
    0%   { transform: translate(-50%, -50%) scale(0.8); opacity: 0.15; }
    50%  { transform: translate(-50%, -50%) scale(1.1); opacity: 0.05; }
    100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.15; }
  }

  /* Arrow glow */
  @keyframes arrowGlow {
    0%, 100% { filter: drop-shadow(0 0 6px rgba(108,71,255,0.6)); }
    50% { filter: drop-shadow(0 0 14px rgba(108,71,255,0.9)); }
  }

  /* Scroll snap container - hide scrollbar */
  .snap-container::-webkit-scrollbar { display: none; }
  .snap-container { -ms-overflow-style: none; scrollbar-width: none; }
`;

/* ------------------------------------------------------------------ */
/*  Grain SVG filter                                                   */
/* ------------------------------------------------------------------ */
const grainSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

/* ------------------------------------------------------------------ */
/*  Shared floating card styles                                        */
/* ------------------------------------------------------------------ */
const floatingCardBase: React.CSSProperties = {
  position: "absolute",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 16,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  pointerEvents: "none",
  zIndex: 1,
};

/* ------------------------------------------------------------------ */
/*  Module data for section 3                                          */
/* ------------------------------------------------------------------ */
const modules = [
  {
    title: "Weekly Tasks",
    desc: "Plan your week, day by day.",
    accent: "#6C47FF",
    gradPos: "top left",
  },
  {
    title: "Journal",
    desc: "Your thoughts, beautifully kept.",
    accent: "#10B981",
    gradPos: "top right",
  },
  {
    title: "Habit Tracker",
    desc: "Build streaks. Break patterns.",
    accent: "#F59E0B",
    gradPos: "bottom left",
  },
  {
    title: "Planner",
    desc: "From idea to done.",
    accent: "#3B82F6",
    gradPos: "center",
  },
  {
    title: "Personal Library",
    desc: "Read more. Remember more.",
    accent: "#D97706",
    gradPos: "bottom right",
  },
  {
    title: "Reminders",
    desc: "Never forget what matters.",
    accent: "#EC4899",
    gradPos: "top center",
  },
];

/* ------------------------------------------------------------------ */
/*  Chaos app icons for section 2                                      */
/* ------------------------------------------------------------------ */
const chaosApps = [
  { emoji: "📝", label: "Notes App", x: "5%", y: "10%", anim: "chaosFloat1", dur: "5s" },
  { emoji: "✅", label: "Task App", x: "55%", y: "5%", anim: "chaosFloat2", dur: "4.5s" },
  { emoji: "📅", label: "Calendar", x: "15%", y: "55%", anim: "chaosFloat3", dur: "6s" },
  { emoji: "📚", label: "Books App", x: "60%", y: "50%", anim: "chaosFloat1", dur: "5.5s" },
  { emoji: "💪", label: "Fitness", x: "35%", y: "30%", anim: "chaosFloat2", dur: "4s" },
];

/* ------------------------------------------------------------------ */
/*  Star field generator                                               */
/* ------------------------------------------------------------------ */
const stars = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 2 + 1,
  delay: `${Math.random() * 5}s`,
  duration: `${2 + Math.random() * 3}s`,
}));

/* ------------------------------------------------------------------ */
/*  Animated icon sub-components                                       */
/* ------------------------------------------------------------------ */
function CheckboxIcon() {
  return (
    <div style={{ width: 32, height: 32, position: "relative" }}>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          border: "2px solid #6C47FF",
          position: "absolute",
          top: 4,
          left: 4,
        }}
      />
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <path
          d="M11 16l4 4 6-8"
          stroke="#6C47FF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 24,
            strokeDashoffset: 24,
            animation: "checkSelf 2.5s ease-in-out infinite",
          }}
        />
      </svg>
    </div>
  );
}

function PenIcon() {
  return (
    <div
      style={{
        fontSize: 22,
        animation: "penWrite 2s ease-in-out infinite",
        display: "inline-block",
      }}
    >
      ✍️
    </div>
  );
}

function FlameIcon() {
  return (
    <div
      style={{
        fontSize: 22,
        animation: "flameFlicker 1.5s ease-in-out infinite",
        display: "inline-block",
      }}
    >
      🔥
    </div>
  );
}

function KanbanIcon() {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 28 }}>
      {[16, 22, 12].map((h, i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: h,
            borderRadius: 2,
            background: `rgba(59,130,246,${0.4 + i * 0.2})`,
            animation: `kanbanSlide ${1.5 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function BookIcon() {
  return (
    <div
      style={{
        fontSize: 22,
        animation: "bookOpen 3s ease-in-out infinite",
        display: "inline-block",
        transformOrigin: "left center",
      }}
    >
      📖
    </div>
  );
}

function BellIcon() {
  return (
    <div
      style={{
        fontSize: 22,
        animation: "bellRing 2s ease-in-out infinite",
        display: "inline-block",
        transformOrigin: "top center",
      }}
    >
      🔔
    </div>
  );
}

const moduleIcons = [
  <CheckboxIcon key="check" />,
  <PenIcon key="pen" />,
  <FlameIcon key="flame" />,
  <KanbanIcon key="kanban" />,
  <BookIcon key="book" />,
  <BellIcon key="bell" />,
];

/* ================================================================== */
/*  PAGE COMPONENT                                                     */
/* ================================================================== */
export default function LandingPage() {
  const s2 = useInView(0.25);
  const s3 = useInView(0.2);
  const s4 = useInView(0.3);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />

      {/* Grain overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
          opacity: 0.04,
          backgroundImage: grainSvg,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
          animation: "grainShift 0.5s steps(6) infinite",
        }}
      />

      {/* ============================================================ */}
      {/*  SNAP-SCROLL CONTAINER                                        */}
      {/* ============================================================ */}
      <div
        className="snap-container"
        style={{
          height: "100vh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          background: "#050510",
        }}
      >
        {/* Star field */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {stars.map((s) => (
            <div
              key={s.id}
              style={{
                position: "absolute",
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                borderRadius: "50%",
                background: "white",
                animation: `twinkle ${s.duration} ease-in-out ${s.delay} infinite`,
              }}
            />
          ))}
        </div>

        {/* ======================================================== */}
        {/*  SECTION 1 — HERO                                         */}
        {/* ======================================================== */}
        <section
          style={{
            height: "100vh",
            scrollSnapAlign: "start",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Ambient orbs */}
          <div
            style={{
              position: "absolute",
              width: 800,
              height: 800,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(108,71,255,0.25) 0%, transparent 70%)",
              top: "-15%",
              left: "-10%",
              animation: "orbDrift1 20s ease-in-out infinite",
              filter: "blur(80px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 600,
              height: 600,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(151,71,255,0.2) 0%, transparent 70%)",
              bottom: "-10%",
              right: "-5%",
              animation: "orbDrift2 25s ease-in-out infinite",
              filter: "blur(60px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
              top: "30%",
              right: "15%",
              animation: "orbDrift3 18s ease-in-out infinite",
              filter: "blur(50px)",
            }}
          />

          {/* Dot grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "radial-gradient(circle, #6C47FF 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              opacity: 0.3,
              pointerEvents: "none",
            }}
          />

          {/* Floating UI cards */}
          {!isMobile && (
            <>
              <div
                style={{ ...floatingCardBase, top: "12%", left: "8%", width: 200, animation: "float1 4s ease-in-out infinite alternate" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: "2px solid #6C47FF", flexShrink: 0 }} />
                  <span className="" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Learn Design</span>
                </div>
                <div className="" style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 6, paddingLeft: 24 }}>2hrs · Focus block</div>
              </div>

              <div style={{ ...floatingCardBase, top: "14%", right: "10%", animation: "float2 5s ease-in-out infinite alternate" }}>
                <div className="" style={{ fontSize: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  🔥 <span className="font-mono" style={{ color: "#F59E0B", fontWeight: 600, fontSize: 14 }}>12 day streak</span>
                </div>
                <div className="" style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 4 }}>Reading · 30 min/day</div>
              </div>

              {!isTablet && (
                <div style={{ ...floatingCardBase, bottom: "16%", left: "6%", width: 220, animation: "float3 6s ease-in-out infinite alternate" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="" style={{ color: "#10B981", fontSize: 11, fontWeight: 600 }}>Mar 21, 2026</span>
                    <span style={{ fontSize: 16 }}>😊</span>
                  </div>
                  <div className="" style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
                    Today was a good day. I finally finished the project I&apos;ve been...
                  </div>
                </div>
              )}

              {!isTablet && (
                <div style={{ ...floatingCardBase, bottom: "14%", right: "8%", width: 200, animation: "float4 7s ease-in-out infinite alternate" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 48, borderRadius: 4, background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", flexShrink: 0 }} />
                    <div>
                      <div className="" style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600 }}>Chapter 4</div>
                      <div className="font-mono" style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>34% complete</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{ width: "34%", height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #F59E0B, #D97706)" }} />
                  </div>
                </div>
              )}

              {!isTablet && (
                <div style={{ ...floatingCardBase, top: "50%", right: "4%", transform: "translateY(-50%)", animation: "float5 5.5s ease-in-out infinite alternate" }}>
                  <div className="" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    🎂 <span style={{ color: "#EC4899", fontWeight: 600 }}>Mom&apos;s Birthday</span>
                  </div>
                  <div className="" style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 4 }}>in 3 days</div>
                </div>
              )}
            </>
          )}

          {/* Central content */}
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 720, padding: "0 24px" }}>
            {/* Label */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 28, animation: "fadeUp 0.6s ease-out both" }}>
              <div style={{ width: 24, height: 1, background: "#6C47FF" }} />
              <span className="" style={{ fontSize: 11, letterSpacing: "0.3em", color: "#6C47FF", textTransform: "uppercase", fontWeight: 600 }}>
                Your Personal Life OS
              </span>
              <div style={{ width: 24, height: 1, background: "#6C47FF" }} />
            </div>

            {/* Main headline */}
            <h1 className="font-display" style={{ fontSize: isMobile ? "clamp(32px, 8vw, 40px)" : isTablet ? "clamp(40px, 5vw, 52px)" : "clamp(40px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.1, color: "white", margin: 0 }}>
              {["Everything", "you", "are."].map((word, i) => (
                <span key={word} style={{ display: "inline-block", animation: `wordReveal 0.6s ease-out ${i * 0.15}s both`, marginRight: i < 2 ? "0.3em" : 0 }}>{word}</span>
              ))}
              <br />
              {["In", "one"].map((word, i) => (
                <span key={word} style={{ display: "inline-block", animation: `wordReveal 0.6s ease-out ${(i + 3) * 0.15}s both`, marginRight: "0.3em" }}>{word}</span>
              ))}
              <span style={{ display: "inline-block", background: "linear-gradient(135deg, #6C47FF, #9747FF, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: `wordReveal 0.6s ease-out ${5 * 0.15}s both` }}>
                place.
              </span>
            </h1>

            {/* Subtext */}
            <p className="" style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginTop: 24, animation: "fadeUp 0.6s ease-out 0.8s both", letterSpacing: "0.02em" }}>
              Tasks &nbsp;·&nbsp; Journal &nbsp;·&nbsp; Habits &nbsp;·&nbsp; Plans &nbsp;·&nbsp; Books &nbsp;·&nbsp; Reminders
            </p>

            {/* CTA */}
            <div style={{ marginTop: 40, animation: "fadeUp 0.6s ease-out 1.2s both" }}>
              <Link
                href="/signup"
                className=""
                style={{
                  display: isMobile ? "block" : "inline-block",
                  width: isMobile ? "100%" : "auto",
                  background: "linear-gradient(135deg, #6C47FF, #4F2FE0)",
                  border: "1px solid rgba(108,71,255,0.5)",
                  padding: "14px 36px",
                  borderRadius: 100,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "white",
                  textDecoration: "none",
                  textAlign: "center",
                  animation: "pulseGlow 2s ease-in-out infinite",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 0 60px rgba(108,71,255,0.6), 0 0 120px rgba(108,71,255,0.3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = ""; }}
              >
                Start for free
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 2, animation: "scrollBounce 2s ease-in-out infinite" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.4 }}>
              <path d="M4 7l6 6 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase" }}>scroll</span>
          </div>
        </section>

        {/* ======================================================== */}
        {/*  SECTION 2 — THE WHY                                       */}
        {/* ======================================================== */}
        <section
          ref={s2.ref}
          style={{
            height: "100vh",
            scrollSnapAlign: "start",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 clamp(24px, 5vw, 80px)",
          }}
        >
          {/* Large violet orb center */}
          <div
            style={{
              position: "absolute",
              width: 900,
              height: 900,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(108,71,255,0.15) 0%, transparent 70%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              filter: "blur(120px)",
              animation: "orbDrift1 30s ease-in-out infinite",
            }}
          />

          {/* Rotated dot grid */}
          <div
            style={{
              position: "absolute",
              inset: -100,
              backgroundImage: "radial-gradient(circle, #6C47FF 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              opacity: 0.15,
              pointerEvents: "none",
              transform: "rotate(45deg)",
            }}
          />

          {/* Two columns */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: "clamp(40px, 5vw, 80px)",
              maxWidth: 1100,
              width: "100%",
              alignItems: "center",
            }}
          >
            {/* LEFT — Text */}
            <div
              style={{
                opacity: s2.inView ? 1 : 0,
                animation: s2.inView ? "slideInLeft 0.8s ease-out both" : "none",
              }}
            >
              {/* Eyebrow */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 24, height: 1, background: "#6C47FF" }} />
                <span
                  className=""
                  style={{ fontSize: 11, letterSpacing: "0.3em", color: "#6C47FF", textTransform: "uppercase", fontWeight: 600 }}
                >
                  The Problem
                </span>
              </div>

              {/* Statement */}
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(32px, 4vw, 52px)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: "white",
                  margin: "0 0 36px 0",
                }}
              >
                You&apos;re not unproductive.
                <br />
                <span style={{ color: "rgba(255,255,255,0.7)" }}>
                  You&apos;re just{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #6C47FF, #9747FF)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    scattered.
                  </span>
                </span>
              </h2>

              {/* Pain points */}
              {[
                { icon: "😤", text: "5 different apps for 5 different parts of your life" },
                { icon: "🔄", text: "Switching context kills your focus" },
                { icon: "📱", text: "Your goals live in your notes app. Forgotten." },
              ].map((p, i) => (
                <div
                  key={i}
                  className=""
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontSize: 17,
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: 16,
                    opacity: s2.inView ? 1 : 0,
                    animation: s2.inView ? `fadeUp 0.5s ease-out ${0.4 + i * 0.2}s both` : "none",
                  }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{p.icon}</span>
                  {p.text}
                </div>
              ))}
            </div>

            {/* RIGHT — Chaos → Order illustration */}
            <div
              style={{
                opacity: s2.inView ? 1 : 0,
                animation: s2.inView ? "slideInRight 0.8s ease-out 0.3s both" : "none",
                display: "flex",
                alignItems: "center",
                gap: 20,
              }}
            >
              {/* Before: Chaos */}
              <div style={{ position: "relative", width: "42%", height: 320 }}>
                <div
                  className=""
                  style={{
                    position: "absolute",
                    top: -24,
                    left: 0,
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    color: "rgba(255,255,255,0.25)",
                    textTransform: "uppercase",
                  }}
                >
                  Before
                </div>
                {chaosApps.map((app, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: app.x,
                      top: app.y,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      animation: `${app.anim} ${app.dur} ease-in-out infinite`,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                      }}
                    >
                      {app.emoji}
                    </div>
                    <span
                      className=""
                      style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}
                    >
                      {app.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  style={{ animation: "arrowGlow 2s ease-in-out infinite" }}
                >
                  <path
                    d="M6 16h20M20 10l6 6-6 6"
                    stroke="#6C47FF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className=""
                  style={{
                    fontSize: 10,
                    color: "#6C47FF",
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                  }}
                >
                  Lifeboard
                </span>
              </div>

              {/* After: Order */}
              <div style={{ position: "relative", width: "42%", minHeight: 280 }}>
                <div
                  className=""
                  style={{
                    position: "absolute",
                    top: -24,
                    left: 0,
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    color: "rgba(255,255,255,0.25)",
                    textTransform: "uppercase",
                  }}
                >
                  After
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(108,71,255,0.25)",
                    borderRadius: 20,
                    padding: "24px 20px",
                    animation: "cardGlowPulse 3s ease-in-out infinite",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  {chaosApps.map((app, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: "rgba(108,71,255,0.08)",
                          border: "1px solid rgba(108,71,255,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                        }}
                      >
                        {app.emoji}
                      </div>
                      <span
                        className=""
                        style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}
                      >
                        {app.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/*  SECTION 3 — THE MODULES                                   */}
        {/* ======================================================== */}
        <section
          ref={s3.ref}
          style={{
            height: "100vh",
            scrollSnapAlign: "start",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 clamp(24px, 5vw, 80px)",
          }}
        >
          {/* Per-module accent orbs */}
          {modules.map((m, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 250 + i * 30,
                height: 250 + i * 30,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${m.accent}18 0%, transparent 70%)`,
                top: `${15 + (i % 3) * 30}%`,
                left: `${10 + (i % 2) * 60}%`,
                filter: "blur(80px)",
                pointerEvents: "none",
              }}
            />
          ))}

          <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 1000, width: "100%" }}>
            {/* Section title */}
            <div
              style={{
                marginBottom: "clamp(36px, 4vh, 56px)",
                opacity: s3.inView ? 1 : 0,
                animation: s3.inView ? "fadeUp 0.6s ease-out both" : "none",
              }}
            >
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(32px, 4.5vw, 48px)",
                  fontWeight: 800,
                  color: "white",
                  lineHeight: 1.15,
                  margin: "0 0 12px 0",
                }}
              >
                <span
                  style={{
                    background: "linear-gradient(135deg, #6C47FF, #9747FF, #3B82F6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Six tools.
                </span>{" "}
                One home.
              </h2>
              <p
                className=""
                style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", margin: 0 }}
              >
                Everything you need to run your life.
              </p>
            </div>

            {/* Module grid — 3x2 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
                gap: 18,
              }}
            >
              {modules.map((m, i) => (
                <div
                  key={m.title}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 20,
                    padding: isMobile ? "20px 16px" : "28px 24px",
                    textAlign: "left",
                    position: "relative",
                    overflow: "hidden",
                    opacity: s3.inView ? 1 : 0,
                    animation: s3.inView ? `moduleSlideIn 0.5s ease-out ${i * 0.1}s both` : "none",
                    transition: "border-color 0.3s ease, transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${m.accent}66`;
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.background = `${m.accent}0D`;
                    e.currentTarget.style.boxShadow = `0 8px 40px ${m.accent}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Corner gradient */}
                  <div
                    style={{
                      position: "absolute",
                      width: 200,
                      height: 200,
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${m.accent}10 0%, transparent 70%)`,
                      top: -60,
                      ...( m.gradPos.includes("right") ? { right: -60 } : { left: -60 }),
                      pointerEvents: "none",
                    }}
                  />

                  {/* Icon */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: `${m.accent}12`,
                      border: `1px solid ${m.accent}25`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    {moduleIcons[i]}
                  </div>

                  <h3
                    className="font-display"
                    style={{ fontSize: 17, fontWeight: 700, color: "white", margin: "0 0 6px 0" }}
                  >
                    {m.title}
                  </h3>
                  <p
                    className=""
                    style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, margin: 0 }}
                  >
                    {m.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/*  SECTION 4 — THE CTA                                       */}
        {/* ======================================================== */}
        <section
          ref={s4.ref}
          style={{
            height: "100vh",
            scrollSnapAlign: "start",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            background: "#030308",
          }}
        >
          {/* Spotlight orb */}
          <div
            style={{
              position: "absolute",
              width: 1000,
              height: 1000,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(108,71,255,0.18) 0%, transparent 60%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              filter: "blur(100px)",
              animation: "orbDrift1 25s ease-in-out infinite",
            }}
          />

          {/* Radial gradient spotlight */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at center, rgba(108,71,255,0.06) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          {/* Animated ring pulses */}
          {[1, 2, 3].map((ring) => (
            <div
              key={ring}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 300 + ring * 200,
                height: 300 + ring * 200,
                borderRadius: "50%",
                border: "1px solid rgba(108,71,255,0.06)",
                animation: `ringPulse ${6 + ring * 2}s ease-in-out ${ring * 0.5}s infinite`,
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Content */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              textAlign: "center",
              maxWidth: 640,
              opacity: s4.inView ? 1 : 0,
              animation: s4.inView ? "fadeUp 0.8s ease-out both" : "none",
            }}
          >
            {/* Decorative dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
              {[0, 1, 2].map((d) => (
                <div
                  key={d}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#6C47FF",
                    animation: `dotPulse 2s ease-in-out ${d * 0.3}s infinite`,
                  }}
                />
              ))}
            </div>

            {/* Headline */}
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(36px, 5.5vw, 64px)",
                fontWeight: 800,
                color: "white",
                lineHeight: 1.1,
                margin: "0 0 4px 0",
              }}
            >
              Your life, organized.
            </h2>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(36px, 5.5vw, 64px)",
                fontWeight: 800,
                lineHeight: 1.1,
                margin: "0 0 24px 0",
                fontStyle: "italic",
                background: "linear-gradient(135deg, #6C47FF, #9747FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Finally.
            </h2>

            {/* Subtext */}
            <p
              className=""
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.6,
                margin: "0 0 40px 0",
                opacity: s4.inView ? 1 : 0,
                animation: s4.inView ? "fadeUp 0.6s ease-out 0.4s both" : "none",
              }}
            >
              Join the people building their life on purpose.
            </p>

            {/* Two buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                opacity: s4.inView ? 1 : 0,
                animation: s4.inView ? "fadeUp 0.6s ease-out 0.6s both" : "none",
              }}
            >
              {/* Primary CTA */}
              <Link
                href="/signup"
                className=""
                style={{
                  display: isMobile ? "block" : "inline-block",
                  width: isMobile ? "100%" : "auto",
                  background: "linear-gradient(135deg, #6C47FF, #4F2FE0)",
                  border: "1px solid rgba(108,71,255,0.5)",
                  padding: "16px 40px",
                  borderRadius: 100,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "white",
                  textDecoration: "none",
                  textAlign: "center",
                  animation: "pulseGlow 2s ease-in-out infinite",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 0 60px rgba(108,71,255,0.6), 0 0 120px rgba(108,71,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                Get started — it&apos;s free
              </Link>

              {/* Secondary — Ghost */}
              <Link
                href="/login"
                className=""
                style={{
                  display: isMobile ? "block" : "inline-block",
                  width: isMobile ? "100%" : "auto",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  padding: "16px 36px",
                  borderRadius: 100,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  textAlign: "center",
                  transition: "border-color 0.2s ease, color 0.2s ease, transform 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.transform = "scale(1.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: 32,
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
            }}
          >
            <span
              className=""
              style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}
            >
              Built for the ones building their life on purpose. — Lifeboard
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
