"use client";

import React, { useEffect, useRef } from "react";

// Curated harmonic facet shades matching the screenshot & club identity
const RED_FACETS = [
  "rgba(143, 24, 56, ",   // Official Club Crimson
  "rgba(166, 29, 67, ",   // Vibrant Ruby
  "rgba(192, 38, 82, ",   // Bright Crimson
  "rgba(212, 51, 98, ",   // Highlight Raspberry
  "rgba(107, 16, 40, ",   // Deep Bordeaux
  "rgba(78, 11, 29, ",    // Dark Garnet
  "rgba(128, 20, 50, ",   // Rich Wine
];

const BLUE_FACETS = [
  "rgba(72, 156, 216, ",  // Official Club Azure
  "rgba(94, 178, 238, ",  // Bright Sky Azure
  "rgba(114, 194, 248, ", // Highlight Ice Azure
  "rgba(65, 145, 210, ",  // Royal Azure
  "rgba(45, 120, 185, ",  // Medium Vibrant Azure
  "rgba(35, 105, 165, ",  // Deep Azure
  "rgba(80, 170, 240, ",  // Electric Accent
];

// Deterministic PRNG based on cell coordinate seed
function pseudoRandom(seed: number) {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export default function GeometricTriangles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    let isRendering = false;

    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;

    // Equilateral triangle side length s = 48px
    const s = 48;
    const h = s * (Math.sqrt(3) / 2); // ~41.57px
    const baseSeed = 73921;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      requestRender();
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY;
      requestRender();
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
      requestRender();
    };

    const handleMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
      requestRender();
    };

    const requestRender = () => {
      if (!isRendering) {
        isRendering = true;
        animId = requestAnimationFrame(render);
      }
    };

    const render = () => {
      currentScrollY += (targetScrollY - currentScrollY) * 0.15;
      mouseX += (targetMouseX - mouseX) * 0.15;
      mouseY += (targetMouseY - mouseY) * 0.15;

      const scrollDiff = Math.abs(targetScrollY - currentScrollY);
      const mouseDiff =
        Math.abs(targetMouseX - mouseX) + Math.abs(targetMouseY - mouseY);

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Subtle parallax drift: 25% of scroll speed
      const parallaxY = -currentScrollY * 0.25;

      // Only iterate through the rows and columns that are currently visible on screen
      const startRow = Math.floor((-parallaxY - h * 2) / h);
      const endRow = Math.ceil((-parallaxY + height + h * 2) / h);
      const cols = Math.ceil(width / (s / 2)) + 4;

      for (let r = startRow; r <= endRow; r++) {
        const cy = r * h;

        for (let c = -2; c <= cols; c++) {
          const cellSeed = baseSeed + r * 10007 + c * 37;
          const rand1 = pseudoRandom(cellSeed);
          const rand2 = pseudoRandom(cellSeed + 1);
          const rand3 = pseudoRandom(cellSeed + 2);
          const rand4 = pseudoRandom(cellSeed + 3);

          // Dispersed negative space cutout (~26% airy openings for a shattered crystal mosaic)
          if (rand3 > 0.74) {
            continue;
          }

          const cx = c * (s / 2);
          const screenX = cx + (rand1 - 0.5) * 1.5;
          const screenY = cy + parallaxY + (rand2 - 0.5) * 1.5;

          // Frustum culling
          if (screenY + h < -20 || screenY > height + 20 || screenX + s < -20 || screenX > width + 20) {
            continue;
          }

          // Compute page context: determines whether this facet is Red, Transition, or Blue
          // Corresponds directly with the actual scroll position of the page!
          const pageEffectiveY = currentScrollY + screenY;

          let colorFamily: "red" | "blue" = "red";
          if (pageEffectiveY < 700) {
            // Pure Hero Red Zone
            colorFamily = "red";
          } else if (pageEffectiveY >= 700 && pageEffectiveY < 2300) {
            // Harmonic transition zone across News and Verein
            const blueProb = (pageEffectiveY - 700) / 1600;
            colorFamily = rand4 < blueProb ? "blue" : "red";
          } else {
            // Pure Blue Zone across Teams, Spielplan, Kontakt, Partner & Footer
            // NEVER cuts off — spans infinitely across all matches and sections!
            colorFamily = "blue";
          }

          const palette = colorFamily === "red" ? RED_FACETS : BLUE_FACETS;
          const colorIdx = Math.floor(rand2 * palette.length);
          const baseColor = palette[colorIdx];

          // Calibrated Opacity:
          // Slightly boosted in the blue family so azure facets pop with crisp clarity against dark slate
          const isAccent = rand1 > 0.80;
          const baseOpacity = isAccent
            ? (colorFamily === "blue" ? 0.18 + rand2 * 0.08 : 0.14 + rand2 * 0.06)
            : (colorFamily === "blue" ? 0.075 + rand2 * 0.05 : 0.055 + rand2 * 0.045);

          // Hero headline text breathing room
          let textMaskFactor = 1.0;
          if (screenX < width * 0.50 && screenY < height * 0.65 && screenY > 80 && currentScrollY < 600) {
            textMaskFactor = 0.70;
          }

          // Interactive mouse proximity luminescence
          let mouseBoost = 0;
          if (mouseX > -500) {
            const triCenterX = screenX + s / 2;
            const triCenterY = screenY + h / 2;
            const dist = Math.hypot(triCenterX - mouseX, triCenterY - mouseY);
            if (dist < 160) {
              mouseBoost = (1 - dist / 160) * 0.06;
            }
          }

          const finalOpacity = Math.min((baseOpacity + mouseBoost) * textMaskFactor, 0.36);

          const isUp = (r + c) % 2 === 0;
          let p1x: number, p1y: number;
          let p2x: number, p2y: number;
          let p3x: number, p3y: number;

          if (isUp) {
            p1x = screenX + s / 2;
            p1y = screenY;
            p2x = screenX;
            p2y = screenY + h;
            p3x = screenX + s;
            p3y = screenY + h;
          } else {
            p1x = screenX;
            p1y = screenY;
            p2x = screenX + s;
            p2y = screenY;
            p3x = screenX + s / 2;
            p3y = screenY + h;
          }

          // Draw filled triangle facet
          ctx.beginPath();
          ctx.moveTo(p1x, p1y);
          ctx.lineTo(p2x, p2y);
          ctx.lineTo(p3x, p3y);
          ctx.closePath();

          ctx.fillStyle = baseColor + finalOpacity.toFixed(3) + ")";
          ctx.fill();

          // Crisp hairline border (gives the delicate faceted mosaic look)
          const strokeOpacity = Math.min(finalOpacity * 0.75, 0.26).toFixed(3);
          ctx.strokeStyle = baseColor + strokeOpacity + ")";
          ctx.lineWidth = 0.70;
          ctx.stroke();
        }
      }

      ctx.restore();

      if (scrollDiff > 0.1 || mouseDiff > 0.5) {
        animId = requestAnimationFrame(render);
      } else {
        isRendering = false;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
