"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Handball3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Three.js Scene, Camera & Transparent Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.1, 4.5);
    camera.lookAt(0.6, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 2. Ultra-Subtle Particle Atmosphere (Very faint, non-intrusive)
    const cols = 100;
    const rows = 50;
    const count = cols * rows;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const basePositionsY = new Float32Array(count);

    const colorAzure = new THREE.Color(0x489cd8);
    const colorCrimson = new THREE.Color(0x8f1838);
    const colorMid = new THREE.Color(0x1e2738);

    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const u = (c / (cols - 1)) * 2 - 1;
        const v = (r / (rows - 1)) * 2 - 1;

        const x = u * 7.5 + 1.2;
        const z = v * 5.0 - 0.5;

        const waveTerrain =
          Math.sin(u * Math.PI * 1.6) * Math.cos(v * Math.PI * 1.2) * 0.42 +
          Math.sin(u * 3.2 + v * 2.1) * 0.18 +
          Math.cos(u * 1.5 - v * 2.8) * 0.12;

        const y = -0.9 + waveTerrain * 0.65;
        basePositionsY[idx] = y;

        const i3 = idx * 3;
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;

        const tX = (u + 1) * 0.5;
        const ptColor = new THREE.Color();
        if (tX < 0.48) {
          ptColor.copy(colorCrimson).lerp(colorMid, tX / 0.48);
        } else {
          ptColor.copy(colorMid).lerp(colorAzure, (tX - 0.48) / 0.52);
        }

        const depthFade = Math.max(0.08, 1.0 - Math.abs(v) * 0.7);
        ptColor.multiplyScalar(depthFade);

        colors[i3] = ptColor.r;
        colors[i3 + 1] = ptColor.g;
        colors[i3 + 2] = ptColor.b;

        idx++;
      }
    }

    const waveGeometry = new THREE.BufferGeometry();
    waveGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    waveGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255,255,255,0.8)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.2)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const particleTexture = new THREE.CanvasTexture(canvas);

    // Whisper-subtle point opacity so it does not compete with geometric triangles
    const waveMaterial = new THREE.PointsMaterial({
      size: 0.016,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const wavePoints = new THREE.Points(waveGeometry, waveMaterial);
    scene.add(wavePoints);

    // 3. Elegant Subtle Splines
    const azureCurvePoints = [];
    for (let i = 0; i <= 80; i++) {
      const t = (i / 80) * Math.PI * 3;
      azureCurvePoints.push(
        new THREE.Vector3(
          Math.cos(t * 0.7) * 2.8 + 2.0,
          Math.sin(t) * 0.6 - 0.2,
          Math.sin(t * 0.5) * 1.8 - 0.2
        )
      );
    }
    const azureCurve = new THREE.CatmullRomCurve3(azureCurvePoints);
    const azureTubeGeo = new THREE.TubeGeometry(azureCurve, 140, 0.005, 8, false);
    const azureTubeMat = new THREE.MeshBasicMaterial({
      color: 0x489cd8,
      transparent: true,
      opacity: 0.3,
    });
    const azureRibbon = new THREE.Mesh(azureTubeGeo, azureTubeMat);
    scene.add(azureRibbon);

    const crimsonCurvePoints = [];
    for (let i = 0; i <= 80; i++) {
      const t = (i / 80) * Math.PI * 3;
      crimsonCurvePoints.push(
        new THREE.Vector3(
          Math.sin(t * 0.6) * 3.0 + 1.8,
          Math.cos(t * 0.8) * 0.5 - 0.5,
          Math.cos(t * 0.4) * 1.9 - 0.6
        )
      );
    }
    const crimsonCurve = new THREE.CatmullRomCurve3(crimsonCurvePoints);
    const crimsonTubeGeo = new THREE.TubeGeometry(crimsonCurve, 140, 0.005, 8, false);
    const crimsonTubeMat = new THREE.MeshBasicMaterial({
      color: 0x8f1838,
      transparent: true,
      opacity: 0.28,
    });
    const crimsonRibbon = new THREE.Mesh(crimsonTubeGeo, crimsonTubeMat);
    scene.add(crimsonRibbon);

    // 4. Mouse Interactive State
    let mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    let prevMouseX = 0;
    let prevMouseY = 0;
    let mouseActivity = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;

      const delta = Math.hypot(mouse.targetX - prevMouseX, mouse.targetY - prevMouseY);
      mouseActivity = Math.min(mouseActivity + delta * 2.5, 1.0);

      prevMouseX = mouse.targetX;
      prevMouseY = mouse.targetY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 5. Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);
    handleResize();

    // 6. Interactive Render Loop
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      mouseActivity *= 0.94;
      if (mouseActivity < 0.0005) mouseActivity = 0;

      camera.position.x = mouse.x * 0.28;
      camera.position.y = 1.1 + mouse.y * 0.22;
      camera.lookAt(0.6 + mouse.x * 0.08, mouse.y * 0.05, 0);

      azureRibbon.rotation.y = mouse.x * 0.05;
      crimsonRibbon.rotation.y = -mouse.x * 0.04;

      const posAttr = waveGeometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      const mouseWorldX = mouse.x * 3.8 + 1.5;
      const mouseWorldZ = -mouse.y * 2.8;

      let pIdx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i3 = pIdx * 3;
          const baseY = basePositionsY[pIdx];

          const dx = posArray[i3] - mouseWorldX;
          const dz = posArray[i3 + 2] - mouseWorldZ;
          const distSq = dx * dx + dz * dz;

          const interactiveDisplacement =
            Math.exp(-distSq * 0.65) * 0.48 * (0.35 + mouseActivity * 0.65);
          const targetY = baseY + interactiveDisplacement;
          posArray[i3 + 1] += (targetY - posArray[i3 + 1]) * 0.08;

          pIdx++;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      waveGeometry.dispose();
      waveMaterial.dispose();
      particleTexture.dispose();
      azureTubeGeo.dispose();
      azureTubeMat.dispose();
      crimsonTubeGeo.dispose();
      crimsonTubeMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
