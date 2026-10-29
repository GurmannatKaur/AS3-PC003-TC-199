import { useEffect, useState } from "react";
import { usePreferences } from "../../data/preferences";
import "./DecorativeCarAnimation.css";

// Smooth highway curve path across an expansive 840px scenic canvas
const ROAD_PATH =
  "M -100 82 C 140 28, 280 115, 430 72 C 580 30, 680 95, 940 54";

export default function DecorativeCarAnimation() {
  const { reduceMotion } = usePreferences();
  const [osReduceMotion, setOsReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setOsReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setOsReduceMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const isReducedMotion = reduceMotion || osReduceMotion;

  return (
    <div
      className="overview-car-showcase"
      aria-hidden="true"
      role="presentation"
    >
      <svg
        className="scenic-car-svg"
        viewBox="0 0 840 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Edge fade mask for seamless, flicker-free looping */}
          <linearGradient id="scenic-edge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="7%" stopColor="#fff" stopOpacity="1" />
            <stop offset="93%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </linearGradient>

          <mask id="scenic-edge-mask">
            <rect x="0" y="0" width="840" height="130" fill="url(#scenic-edge-grad)" />
          </mask>

          {/* Car 1 Paint: Modern pearl white with cool metallic hue */}
          <linearGradient id="car1-body-paint" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f3f8fc" />
            <stop offset="100%" stopColor="#e3ecf4" />
          </linearGradient>

          {/* Car 2 Paint: Electric cyan-blue metallic */}
          <linearGradient id="car2-body-paint" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Headlight beam projection gradient */}
          <linearGradient id="headlight-beam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>

          {/* Diffuse drop shadow under car */}
          <radialGradient id="under-car-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.5" />
            <stop offset="65%" stopColor="#0f172a" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Scenic Urban Canvas */}
        <g mask="url(#scenic-edge-mask)">
          {/* 1. Distant Minimalist City Skyline Silhouettes */}
          <g opacity="0.45">
            <rect x="80" y="24" width="38" height="42" rx="3" fill="#cfe3f3" />
            <rect x="124" y="32" width="28" height="34" rx="2" fill="#d9ecf9" />
            <rect x="210" y="16" width="36" height="52" rx="3" fill="#cfe3f3" />
            <rect x="320" y="28" width="32" height="48" rx="2" fill="#d9ecf9" />
            <rect x="520" y="18" width="44" height="48" rx="3" fill="#cfe3f3" />
            <rect x="570" y="26" width="30" height="40" rx="2" fill="#d9ecf9" />
            <rect x="730" y="22" width="42" height="46" rx="3" fill="#cfe3f3" />
          </g>

          {/* 2. Modern Landscape Foliage & Trees */}
          {/* Tree Cluster 1 (Left Hill) */}
          <g opacity="0.8">
            <line x1="160" y1="34" x2="160" y2="44" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
            <polygon points="150,38 160,22 170,38" fill="#2dd4bf" />
            <polygon points="152,29 160,17 168,29" fill="#5eead4" />
          </g>

          {/* Tree Cluster 2 (Mid-way Crest) */}
          <g opacity="0.8">
            <line x1="390" y1="62" x2="390" y2="76" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="390" cy="55" r="10" fill="#34d399" />
            <circle cx="387" cy="52" r="6.5" fill="#6ee7b7" />
          </g>

          {/* Highway Light Mast 1 */}
          <g opacity="0.75">
            <line x1="285" y1="52" x2="285" y2="92" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M 285 52 Q 285 45, 294 45" stroke="#94a3b8" strokeWidth="1.6" fill="none" />
            <circle cx="295" cy="46" r="2.2" fill="#38bdf8" />
          </g>

          {/* Tree Cluster 3 (Right Crest) */}
          <g opacity="0.8">
            <line x1="620" y1="36" x2="620" y2="48" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
            <polygon points="610,40 620,24 630,40" fill="#2dd4bf" />
            <polygon points="612,31 620,19 628,31" fill="#5eead4" />
          </g>

          {/* Highway Light Mast 2 */}
          <g opacity="0.75">
            <line x1="680" y1="50" x2="680" y2="88" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M 680 50 Q 680 43, 689 43" stroke="#94a3b8" strokeWidth="1.6" fill="none" />
            <circle cx="690" cy="44" r="2.2" fill="#38bdf8" />
          </g>

          {/* 3. ROAD STRUCTURE & HIGHWAY INFRASTRUCTURE */}
          {/* Road Under-Curb Soft Shadow */}
          <path
            d={ROAD_PATH}
            stroke="rgba(20, 80, 130, 0.08)"
            strokeWidth="36"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Outer Shoulder Curb */}
          <path
            d={ROAD_PATH}
            stroke="#dbebf7"
            strokeWidth="30"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Deep Charcoal Highway Asphalt */}
          <path
            d={ROAD_PATH}
            stroke="#1f3044"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Outer Road Edge Guidelines */}
          <path
            d={ROAD_PATH}
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="19"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d={ROAD_PATH}
            stroke="#1f3044"
            strokeWidth="17.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Center Dashed Road Markings */}
          <path
            d={ROAD_PATH}
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeDasharray="14 16"
            strokeLinecap="butt"
            strokeLinejoin="round"
            opacity="0.92"
            fill="none"
          />

          {/* 4. SMART INTERSECTION STOP LINE & CROSSWALK */}
          {/* Intersection Stop Bar across road lane at x = 365 */}
          <line
            x1="363"
            y1="71"
            x2="367"
            y2="94"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.95"
          />

          {/* Zebra Crosswalk Stripes across the road */}
          <g opacity="0.75">
            <line x1="376" y1="71" x2="379" y2="92" stroke="#ffffff" strokeWidth="2.4" strokeDasharray="4 3" />
            <line x1="388" y1="69" x2="391" y2="89" stroke="#ffffff" strokeWidth="2.4" strokeDasharray="4 3" />
            <line x1="400" y1="66" x2="403" y2="86" stroke="#ffffff" strokeWidth="2.4" strokeDasharray="4 3" />
          </g>

          {/* 5. BEAUTIFUL ANIMATED TRAFFIC SIGNAL */}
          {/* Erected on the road verge beside the intersection at x = 428 */}
          <g id="smart-traffic-signal">
            {/* Concrete foundation base on verge */}
            <rect x="424" y="55" width="8" height="4" rx="1" fill="#94a3b8" />
            
            {/* Upright Mast Pole */}
            <line x1="428" y1="14" x2="428" y2="56" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Cantilever Bracket Arm holding housing */}
            <path d="M 428 16 L 434 16" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <line x1="428" y1="46" x2="434" y2="46" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />

            {/* Backplate / Shield with retro-reflective border */}
            <rect
              x="429"
              y="11"
              width="19"
              height="43"
              rx="5"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="0.8"
            />

            {/* Signal Main Housing */}
            <rect
              x="431"
              y="13"
              width="15"
              height="39"
              rx="3.5"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="0.7"
            />

            {/* Lamp Sockets / Bevel Rings */}
            <circle cx="438.5" cy="19.5" r="4.6" fill="#0f172a" />
            <circle cx="438.5" cy="32.5" r="4.6" fill="#0f172a" />
            <circle cx="438.5" cy="45.5" r="4.6" fill="#0f172a" />

            {/* Three Signal Lamps: Red (top), Amber (middle), Green (bottom) */}
            {/* 1. Red Lamp */}
            <circle
              className="signal-lamp-red"
              cx="438.5"
              cy="19.5"
              r="3.6"
              fill="#ef4444"
            />
            {/* Inner Red Fresnel Highlight */}
            <circle cx="437.5" cy="18.5" r="1.3" fill="#ffffff" opacity="0.35" />

            {/* 2. Amber Lamp */}
            <circle
              className="signal-lamp-amber"
              cx="438.5"
              cy="32.5"
              r="3.6"
              fill="#38250f"
              opacity="0.28"
            />
            {/* Inner Amber Fresnel Highlight */}
            <circle cx="437.5" cy="31.5" r="1.3" fill="#ffffff" opacity="0.25" />

            {/* 3. Green Lamp */}
            <circle
              className="signal-lamp-green"
              cx="438.5"
              cy="45.5"
              r="3.6"
              fill="#112d22"
              opacity="0.28"
            />
            {/* Inner Green Fresnel Highlight */}
            <circle cx="437.5" cy="44.5" r="1.3" fill="#ffffff" opacity="0.25" />

            {/* Protective Glare Hoods / Visors above each lamp */}
            <path d="M 434.5 16 Q 438.5 13 442.5 16" stroke="#090d16" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M 434.5 29 Q 438.5 26 442.5 29" stroke="#090d16" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M 434.5 42 Q 438.5 39 442.5 42" stroke="#090d16" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </g>

          {/* Foreground Roadside Greenery */}
          <g opacity="0.85">
            <circle cx="210" cy="112" r="5" fill="#2dd4bf" />
            <circle cx="217" cy="110" r="6" fill="#5eead4" />
          </g>
          <g opacity="0.85">
            <circle cx="495" cy="104" r="5.5" fill="#34d399" />
            <circle cx="503" cy="102" r="6.8" fill="#6ee7b7" />
          </g>

          {/* 6. PRIMARY VEHICLE 1 (White Modern Fastback Sedan) */}
          {/* Approaches during Red, decelerates to stop at s=0.41 (x=365), waits, proceeds when Green at t=4.56s */}
          <g
            className={`scenic-car-vehicle car-primary ${isReducedMotion ? "reduced-motion" : "animated"}`}
            transform={isReducedMotion ? "translate(430, 72) rotate(-16)" : undefined}
          >
            {!isReducedMotion && (
              <animateMotion
                path={ROAD_PATH}
                dur="12s"
                repeatCount="indefinite"
                rotate="auto"
                keyTimes="0; 0.18; 0.38; 1"
                keyPoints="0; 0.41; 0.41; 1"
                calcMode="spline"
                keySplines="0.4 0 0.6 1; 0 0 1 1; 0.3 0 0.2 1"
              />
            )}

            {/* Vehicle 1 Body (Length 88px, Height 26px) */}
            <g id="car1-illustration">
              {/* Headlight Beam */}
              <polygon
                points="42,-5 115,-16 115,8 42,0"
                fill="url(#headlight-beam)"
              />

              {/* Ground Shadow */}
              <ellipse
                cx="0"
                cy="3.2"
                rx="42"
                ry="5.5"
                fill="url(#under-car-shadow)"
              />

              {/* Lower Rocker Aero Panel */}
              <path d="M -41,-1 L 41,-1 L 43,1 L -42,1 Z" fill="#0f172a" />

              {/* Main Body Shell */}
              <path
                d="M -42,-4
                   C -42,-9 -38,-12 -33,-12
                   L -23,-12
                   L -17,-20.5
                   C -15,-22 -11,-22.5 -7,-22.5
                   L 10,-22.5
                   C 14,-22.5 18,-21 21,-18.5
                   L 29,-11
                   L 39,-7
                   C 42,-5.5 44,-3.5 44,-1
                   L 44,0.5
                   C 44,1.5 43,2 41.5,2
                   L 34.5,2
                   C 34.5,-2.5 31,-6 26,-6
                   C 21,-6 17.5,-2.5 17.5,2
                   L -17.5,2
                   C -17.5,-2.5 -21,-6 -26,-6
                   C -31,-6 -34.5,-2.5 -34.5,2
                   L -39.5,2
                   C -41,2 -42,1.2 -42,0
                   Z"
                fill="url(#car1-body-paint)"
                stroke="#cbd5e1"
                strokeWidth="0.8"
              />

              {/* Tinted Panoramic Glasshouse */}
              <path
                d="M -21,-12.5
                   L -15.5,-20
                   C -14.2,-21 -10.5,-21.5 -7,-21.5
                   L 9,-21.5
                   C 12.5,-21.5 16,-20.2 18.5,-18
                   L 26.5,-12.5
                   Z"
                fill="#112233"
              />

              {/* Glass Reflection Highlight */}
              <path
                d="M -13,-19.5
                   L -3,-20.5
                   L 6,-20.5
                   L 2,-13
                   L -9,-13
                   Z"
                fill="#93c5fd"
                opacity="0.5"
              />

              {/* Precision Flush Pillars */}
              <rect x="2" y="-21.5" width="2.4" height="9" fill="#ffffff" opacity="0.9" />
              <rect x="-14" y="-20" width="1.8" height="7.5" fill="#ffffff" opacity="0.85" />

              {/* Side Mirror */}
              <path
                d="M 18,-13.5 L 22,-13.5 L 23,-11.5 L 18,-11.5 Z"
                fill="#f8fafc"
                stroke="#94a3b8"
                strokeWidth="0.5"
              />

              {/* Cyan Accent Line */}
              <path
                d="M -34,-4.5 L 36,-4.5"
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeLinecap="round"
              />

              {/* Flush Handles */}
              <rect x="7" y="-7.5" width="4.5" height="1.2" rx="0.5" fill="#94a3b8" />
              <rect x="-8" y="-7.5" width="4.5" height="1.2" rx="0.5" fill="#94a3b8" />

              {/* LED Matrix Headlight */}
              <rect x="40" y="-5" width="3.5" height="2.5" rx="0.8" fill="#38bdf8" />
              <circle cx="42" cy="-3.8" r="1.2" fill="#ffffff" />

              {/* Rear Lightbar */}
              <rect x="-42" y="-6" width="2.5" height="2.5" rx="0.6" fill="#ef4444" />

              {/* Rear Aero Wheel */}
              <g transform="translate(-26, 1.2)">
                <circle cx="0" cy="0" r="8.2" fill="#090d16" />
                <circle cx="0" cy="0" r="6.2" fill="#475569" />
                <circle cx="0" cy="0" r="5" fill="#94a3b8" />
                <path d="M 0,-4.5 L 0,4.5" stroke="#090d16" strokeWidth="1" />
                <path d="M -4.2,-1.5 L 4.2,1.5" stroke="#090d16" strokeWidth="1" />
                <path d="M -4.2,1.5 L 4.2,-1.5" stroke="#090d16" strokeWidth="1" />
                <circle cx="0" cy="0" r="2" fill="#0f172a" />
                <circle cx="0" cy="0" r="0.8" fill="#38bdf8" />
              </g>

              {/* Front Aero Wheel */}
              <g transform="translate(26, 1.2)">
                <circle cx="0" cy="0" r="8.2" fill="#090d16" />
                <circle cx="0" cy="0" r="6.2" fill="#475569" />
                <circle cx="0" cy="0" r="5" fill="#94a3b8" />
                <path d="M 0,-4.5 L 0,4.5" stroke="#090d16" strokeWidth="1" />
                <path d="M -4.2,-1.5 L 4.2,1.5" stroke="#090d16" strokeWidth="1" />
                <path d="M -4.2,1.5 L 4.2,-1.5" stroke="#090d16" strokeWidth="1" />
                <circle cx="0" cy="0" r="2" fill="#0f172a" />
                <circle cx="0" cy="0" r="0.8" fill="#38bdf8" />
              </g>
            </g>
          </g>

          {/* 7. SECONDARY VEHICLE 2 (Electric Cyan Crossover) */}
          {/* Enters during Green phase (t=5.28s) and smoothly follows Vehicle 1 through the open corridor */}
          <g
            className={`scenic-car-vehicle car-secondary ${isReducedMotion ? "reduced-motion" : "animated"}`}
            style={isReducedMotion ? { display: "none" } : undefined}
          >
            {!isReducedMotion && (
              <animateMotion
                path={ROAD_PATH}
                dur="12s"
                repeatCount="indefinite"
                rotate="auto"
                keyTimes="0; 0.44; 1"
                keyPoints="0; 0.0; 1"
                calcMode="spline"
                keySplines="0 0 1 1; 0.25 0 0.2 1"
              />
            )}

            {/* Vehicle 2 Body (Length 68px, Height 23px) */}
            <g id="car2-illustration">
              {/* Headlight Beam */}
              <polygon
                points="32,-4 90,-12 90,6 32,0"
                fill="url(#headlight-beam)"
                opacity="0.85"
              />

              {/* Ground Shadow */}
              <ellipse
                cx="0"
                cy="2.8"
                rx="33"
                ry="4.5"
                fill="url(#under-car-shadow)"
              />

              {/* Lower Dark Trim */}
              <path d="M -32,-0.5 L 32,-0.5 L 33,1 L -33,1 Z" fill="#090d16" />

              {/* Main Body Shell (Electric Crossover SUV) */}
              <path
                d="M -33,-3
                   C -33,-8 -30,-11 -25,-11
                   L -16,-11
                   L -11,-18
                   C -9.5,-19.5 -6.5,-20 -3,-20
                   L 9,-20
                   C 13,-20 16,-19 18,-16.5
                   L 24,-10
                   L 30,-6
                   C 33,-4.5 34,-3 34,-0.5
                   L 34,1
                   L 27,1
                   C 27,-2.5 24,-5 20,-5
                   C 16,-5 13,-2.5 13,1
                   L -13,1
                   C -13,-2.5 -16,-5 -20,-5
                   C -24,-5 -27,-2.5 -27,1
                   L -31,1
                   C -32,1 -33,0.5 -33,-0.5
                   Z"
                fill="url(#car2-body-paint)"
                stroke="#0369a1"
                strokeWidth="0.7"
              />

              {/* Tinted Cabin Glass */}
              <path
                d="M -15,-11
                   L -10,-17.5
                   C -8.8,-18.5 -5.8,-19 -2.5,-19
                   L 8,-19
                   C 11.5,-19 14.5,-18 16,-16
                   L 22,-11
                   Z"
                fill="#0f172a"
              />

              {/* Glass Reflection Highlight */}
              <path
                d="M -8,-17
                   L 1,-18
                   L 6,-18
                   L 3,-11.5
                   L -5,-11.5
                   Z"
                fill="#bae6fd"
                opacity="0.45"
              />

              {/* B-Pillar */}
              <rect x="2" y="-19" width="2" height="8" fill="#0f172a" />

              {/* Modern LED Headlight */}
              <rect x="31" y="-4" width="2.8" height="2.2" rx="0.6" fill="#ffffff" />

              {/* Rear Light */}
              <rect x="-33" y="-5" width="2" height="2.2" rx="0.5" fill="#f87171" />

              {/* Rear Alloy Wheel */}
              <g transform="translate(-20, 1)">
                <circle cx="0" cy="0" r="6.8" fill="#090d16" />
                <circle cx="0" cy="0" r="5" fill="#64748b" />
                <circle cx="0" cy="0" r="4" fill="#cbd5e1" />
                <circle cx="0" cy="0" r="1.5" fill="#0f172a" />
              </g>

              {/* Front Alloy Wheel */}
              <g transform="translate(20, 1)">
                <circle cx="0" cy="0" r="6.8" fill="#090d16" />
                <circle cx="0" cy="0" r="5" fill="#64748b" />
                <circle cx="0" cy="0" r="4" fill="#cbd5e1" />
                <circle cx="0" cy="0" r="1.5" fill="#0f172a" />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
