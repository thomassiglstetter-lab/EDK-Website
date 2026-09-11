"use client";

import React, { useEffect, useRef } from "react";

// Standard smoothstep (cubic Hermite interpolation)
function smoothstep(min: number, max: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

export default function ScrollBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const redLayerRef = useRef<HTMLDivElement>(null);
  const blueLayerRef = useRef<HTMLDivElement>(null);
  const midBridgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let targetProgress = 0;
    let currentProgress = 0;
    let isRunning = false;

    const updateScrollProgress = () => {
      targetProgress = window.scrollY;

      if (!isRunning) {
        isRunning = true;
        renderLoop();
      }
    };

    const renderLoop = () => {
      // Smooth lerp interpolation for silky motion
      currentProgress += (targetProgress - currentProgress) * 0.10;

      // When close enough, snap to target
      if (Math.abs(targetProgress - currentProgress) < 0.5) {
        currentProgress = targetProgress;
      }

      const scrollY = currentProgress;

      // Silky, gentle transition curve based on scroll position:
      // - 0px - 700px: Pure Red (Hero)
      // - 700px - 2500px: Gentle, gradual blend from Red to Blue across News and Verein
      // - 2500px+: Pure Blue (Teams, Spielplan, Kontakt, Sponsoren, Footer)
      const t = smoothstep(700, 2500, scrollY);
      const p = Math.min(Math.max(scrollY / 3000, 0), 1);

      // 1. Red layer: fully visible at top (1.0) until p = 0.35, then fades out
      const redOpacity = 1 - t;
      if (redLayerRef.current) {
        redLayerRef.current.style.opacity = redOpacity.toFixed(3);
        redLayerRef.current.style.transform = `translate3d(0, ${(-p * 70).toFixed(1)}px, 0)`;
      }

      // 2. Blue layer: 0.0 until p = 0.35, then rises to 1.0
      const blueOpacity = t;
      if (blueLayerRef.current) {
        blueLayerRef.current.style.opacity = blueOpacity.toFixed(3);
        blueLayerRef.current.style.transform = `translate3d(0, ${((1 - p) * 70).toFixed(1)}px, 0)`;
      }

      // 3. Middle twilight harmonic bridge: peaks at t = 0.5 (around p = 0.55)
      const midFactor = Math.sin(t * Math.PI);
      if (midBridgeRef.current) {
        midBridgeRef.current.style.opacity = (midFactor * 0.35).toFixed(3);
      }

      // 4. Base void interpolation: Deep dark crimson void to deep dark azure void
      // Top: rgb(15, 7, 10) -> Bottom: rgb(6, 12, 20)
      const r = Math.round(15 + (6 - 15) * t);
      const g = Math.round(7 + (12 - 7) * t);
      const b = Math.round(10 + (20 - 10) * t);
      if (containerRef.current) {
        containerRef.current.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      }

      document.documentElement.style.setProperty(
        "--scroll-gradient-progress",
        p.toFixed(3)
      );

      if (currentProgress !== targetProgress) {
        animationFrameId = requestAnimationFrame(renderLoop);
      } else {
        isRunning = false;
      }
    };

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress, { passive: true });

    // Initial trigger
    updateScrollProgress();

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="scroll-bg-root"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgb(15, 7, 10)",
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        transition: "background-color 0.1s linear",
      }}
      aria-hidden="true"
    >
      {/* ============================================================ */}
      {/* RED ATMOSPHERIC LAYER (Dominant at Hero & Upper Sections)     */}
      {/* ============================================================ */}
      <div
        ref={redLayerRef}
        className="scroll-bg-red-layer"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 1,
          willChange: "opacity, transform",
        }}
      >
        {/* Soft linear gradient from top */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(143, 24, 56, 0.26) 0%, rgba(95, 15, 36, 0.14) 40%, rgba(15, 7, 10, 0) 75%)",
          }}
        />

        {/* Hero center primary crimson radial aura */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "25%",
            width: "55%",
            height: "65%",
            background:
              "radial-gradient(ellipse at center, rgba(166, 29, 67, 0.32) 0%, rgba(143, 24, 56, 0.14) 45%, transparent 75%)",
            filter: "blur(60px)",
          }}
        />

        {/* Hero right accent aura (behind 3D crest) */}
        <div
          style={{
            position: "absolute",
            top: "5%",
            right: "5%",
            width: "45%",
            height: "55%",
            background:
              "radial-gradient(circle at center, rgba(180, 30, 75, 0.22) 0%, rgba(120, 16, 42, 0.08) 50%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />

        {/* Subtle left-side crimson warmth */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "-5%",
            width: "40%",
            height: "50%",
            background:
              "radial-gradient(circle at center, rgba(143, 24, 56, 0.16) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* MID-WAY HARMONIC BRIDGE (Smooth transition around p = 0.55)  */}
      {/* ============================================================ */}
      <div
        ref={midBridgeRef}
        className="scroll-bg-mid-layer"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          willChange: "opacity",
          background:
            "radial-gradient(circle at 50% 50%, rgba(90, 35, 95, 0.18) 0%, transparent 75%)",
          filter: "blur(90px)",
        }}
      />

      {/* ============================================================ */}
      {/* BLUE ATMOSPHERIC LAYER (Dominant in lower sections: Teams)   */}
      {/* ============================================================ */}
      <div
        ref={blueLayerRef}
        className="scroll-bg-blue-layer"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          willChange: "opacity, transform",
        }}
      >
        {/* Soft linear gradient rising from bottom */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(0deg, rgba(72, 156, 216, 0.26) 0%, rgba(24, 78, 126, 0.14) 40%, rgba(6, 12, 20, 0) 75%)",
          }}
        />

        {/* Lower center primary azure/sapphire radial aura */}
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "20%",
            width: "60%",
            height: "70%",
            background:
              "radial-gradient(ellipse at center, rgba(72, 156, 216, 0.32) 0%, rgba(35, 95, 155, 0.15) 45%, transparent 75%)",
            filter: "blur(60px)",
          }}
        />

        {/* Lower-left azure accent aura */}
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "-5%",
            width: "45%",
            height: "55%",
            background:
              "radial-gradient(circle at center, rgba(72, 156, 216, 0.24) 0%, rgba(20, 65, 110, 0.10) 50%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />

        {/* Mid-lower right azure depth glow */}
        <div
          style={{
            position: "absolute",
            bottom: "25%",
            right: "-5%",
            width: "45%",
            height: "50%",
            background:
              "radial-gradient(circle at center, rgba(50, 130, 195, 0.20) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
      </div>
    </div>
  );
}
