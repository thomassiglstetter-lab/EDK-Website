"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const OFFICIAL_DARK_WAPPEN_SVG = "<?xml version='1.0' encoding='utf-8'?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" x=\"0px\" y=\"0px\" viewBox=\"150 110 1130 785\" style=\"enable-background:new 0 0 1429.94 1013.14;\" xml:space=\"preserve\">\n<defs><linearGradient id=\"darkShieldBase\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\"><stop offset=\"0%\" stop-color=\"#131A26\" /><stop offset=\"50%\" stop-color=\"#0C111A\" /><stop offset=\"100%\" stop-color=\"#070A0F\" /></linearGradient><linearGradient id=\"darkShieldRim\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\"><stop offset=\"0%\" stop-color=\"#E2E8F0\" /><stop offset=\"35%\" stop-color=\"#64748B\" /><stop offset=\"70%\" stop-color=\"#334155\" /><stop offset=\"100%\" stop-color=\"#94A3B8\" /></linearGradient></defs><style type=\"text/css\">\n\t.st0{display:none;fill:none;stroke:#1D1D1B;stroke-width:20;stroke-miterlimit:10;}\n\t.st1{display:none;}\n\t.st2{display:inline;fill:none;stroke:#1D1D1B;stroke-width:20;stroke-miterlimit:10;}\n\t.st3{display:inline;}\n\t.st4{fill:none;}\n\t.st5{fill:#1D1D1B;stroke:#1D1D1B;}\n\t.st6{display:none;opacity:0.29;fill:#009EE2;}\n\t.st7{fill:#FFFFFF;}\n\t.st8{display:none;opacity:0.17;fill:#009EE2;}\n\t.st9{fill:none;stroke:#1D1D1B;stroke-width:60;}\n\t.st10{fill:none;stroke:#1D1D1B;stroke-width:60;stroke-miterlimit:10;}\n\t.st11{display:inline;fill:none;}\n\t.st12{display:inline;fill:#1D1D1B;}\n\t.st13{fill:#1D1D1B;}\n\t.st14{display:none;fill:none;stroke:#1D1D1B;stroke-width:40;stroke-miterlimit:10;}\n\t.st15{fill:none;stroke:#991636;stroke-width:50;stroke-miterlimit:10;}\n\t.st16{fill:#1D1D1B;stroke:#1D1D1B;stroke-width:5;}\n\t.st17{fill:none;stroke:#59A5DB;stroke-width:50;stroke-miterlimit:10;}\n\t.st18{fill:none;stroke:#1D1D1B;stroke-width:50;stroke-miterlimit:10;}\n\t.st19{fill:#991636;stroke:#991636;stroke-width:10;}\n\t.st20{stroke:#FFFFFF;stroke-miterlimit:10;}\n\t.st21{fill:#FFFFFF;stroke:#FFFFFF;stroke-miterlimit:10;}\n\t.st22{fill:#FFFFFF;stroke:#FFFFFF;stroke-width:5;}\n\t.st23{fill:#FFFFFF;stroke:#FFFFFF;}\n</style>\n<g id=\"Ebene_1\">\n</g>\n<g id=\"Ebene_2\">\n\t<path d=\"M 180,110 L 1250,110 A 30,30 0 0 1 1280,140 L 1280,330 A 565,565 0 0 1 150,330 L 150,140 A 30,30 0 0 1 180,110 Z\" fill=\"url(#darkShieldBase)\" stroke=\"url(#darkShieldRim)\" stroke-width=\"7\" /><path d=\"M 183,116 L 1247,116 A 25,25 0 0 1 1274,141 L 1274,330 A 559,559 0 0 1 156,330 L 156,141 A 25,25 0 0 1 183,116 Z\" fill=\"none\" stroke=\"#475569\" stroke-width=\"1.5\" stroke-opacity=\"0.7\" /><g>\n\t\t<g>\n\t\t\t<path class=\"st15\" d=\"M1129.63,320.03c0,229.01-185.65,414.66-414.66,414.66S300.31,549.04,300.31,320.03\" />\n\t\t\t<g>\n\t\t\t\t<path class=\"st4\" d=\"M175.05,327.85c0,289.37,253.01,533.95,542.92,533.95s536.92-244.58,536.92-533.95\" />\n\t\t\t\t<path class=\"st21\" d=\"M227.67,357.2l2.71,22.78c2.06,17.26-8.01,28.23-21.86,29.88c-16.62,1.98-28.27-8.85-30.07-23.92      l-2.69-22.55L227.67,357.2z M185.64,373.27l1.2,10.05c1.35,11.31,8.7,16.37,20.01,15.02c10.38-1.24,16.04-7.9,14.83-18.88      l-1.23-10.34L185.64,373.27z\" />\n\t\t\t\t<path class=\"st21\" d=\"M217.02,493.25l-14.16-0.17l-4.08-10.56l56.51,1.23l5.01,12.98l-40.63,39.86l-4.28-11.09l10.25-9.92      L217.02,493.25z M232.81,509.38c9.98-9.6,14.97-14.28,18.11-16.82l-0.03-0.07c-3.91,0.29-12.72,0.44-24.49,0.32L232.81,509.38z\" />\n\t\t\t\t<path class=\"st21\" d=\"M296.74,633.68c-8.98,3.03-19.71,1.87-28.75-11.23c-10.36-15.02-5.13-29.75,6.81-37.98      s28.22-7.2,38.37,7.52c8.92,12.93,6.17,24.18-0.02,30.51l-6.33-9.17c2.29-3.35,4.46-8.82-0.85-16.52      c-5.96-8.63-15.74-8.91-24.26-3.03c-8.51,5.87-12.52,15.27-6.34,24.23c4.66,6.76,9.37,7.74,15.09,6.58L296.74,633.68z\" />\n\t\t\t\t<path class=\"st21\" d=\"M371.13,663.61l8.14,7.36l-13.5,14.93l19.61,17.73l13.5-14.93l8.14,7.36l-35.06,38.77l-8.14-7.36      l15.61-17.26l-19.61-17.74l-15.61,17.26l-8.14-7.36L371.13,663.61z\" />\n\t\t\t\t<path class=\"st21\" d=\"M454.46,776.18l-10.98,8.93l-9.9-5.5l44.17-35.25l12.16,6.75l-5.67,56.63l-10.39-5.77l1.52-14.19      L454.46,776.18z M476.92,778.45c1.52-13.76,2.34-20.55,3.13-24.52l-0.07-0.04c-2.82,2.73-9.48,8.49-18.6,15.93L476.92,778.45z\" />\n\t\t\t\t<path class=\"st21\" d=\"M576.8,787.94l-8.09,28.47c-3.26,11.49,2.18,16.28,8.82,18.17c7.43,2.11,13.14,0.14,16.31-11.03      l8.09-28.47l10.56,3l-8.16,28.71c-4.43,15.61-14.99,20.2-29.49,16.08c-14.14-4.02-21.3-13.23-16.86-28.85l8.26-29.08      L576.8,787.94z\" />\n\t\t\t\t<path class=\"st22\" d=\"M751.31,835.18l-0.26,15.39l-72.29-1.22l0.26-15.39L751.31,835.18z\" />\n\t\t\t\t<path class=\"st21\" d=\"M815.2,799.73l10.62-2.78l6.03,23.01c5.68-8.64,12.42-18.54,19.75-29.77l13.16-3.45l-18.67,28.12      l33.32,22.07l-13.34,3.5l-26.13-17.75l-5.41,7.48l4.55,17.35l-10.62,2.79L815.2,799.73z\" />\n\t\t\t\t<path class=\"st21\" d=\"M913.71,809.38l0.52,14.15l-10.35,4.6l-1.56-56.5l12.71-5.65l41.81,38.62l-10.86,4.83l-10.42-9.75      L913.71,809.38z M929.04,792.81c-10.08-9.49-15-14.24-17.7-17.26l-0.07,0.03c0.48,3.89,1.07,12.68,1.53,24.44L929.04,792.81z\" />\n\t\t\t\t<path class=\"st21\" d=\"M985.18,763.87l11.36,17.55l-9.13,5.91l-28.41-43.87l22.95-14.86c9.75-6.32,18.67-5.4,23.6,2.22      c3.59,5.55,2.76,11.02-1.02,15.43c2.63-0.65,8.31-1.67,13.37,6.14l1.36,2.11c2.02,3.12,4.23,6.63,6.11,8.25l-9.45,6.12      c-1.96-1.47-3.82-4.28-6.63-8.62l-0.94-1.45c-3.3-5.09-6.45-5.76-13.26-1.35L985.18,763.87z M980.62,756.82l11.7-7.58      c5.71-3.7,6.99-7.42,4.28-11.61c-2.52-3.89-6.53-4.29-12.06-0.7l-11.83,7.66L980.62,756.82z\" />\n\t\t\t\t<path class=\"st21\" d=\"M1022.05,699.34l8.24-7.22l28.58,32.6l22.55-19.77l4.76,7.69l-29.67,26.01L1022.05,699.34z\" />\n\t\t\t\t<path class=\"st21\" d=\"M1105.43,670.31c4.88,2.03,9.99,1.27,15.96-5.73c5.72-6.71,5.32-10.81,2.39-13.31      c-3.12-2.66-6.6-2.27-15.78,5.42c-13.52,11.29-20,10.29-25.36,5.72c-7.64-6.51-5.43-17.28,2.38-26.44      c11.44-13.42,21.36-10.99,26.17-7.67l-7.15,8.39c-2.75-1.24-6.92-2.31-13.02,4.84c-4.23,4.96-4.97,9.11-1.94,11.69      c2.6,2.22,5.44,1.82,13.64-4.96c15.3-12.63,21.83-11.11,27.51-6.27c6.71,5.72,7.72,15.73-3.28,28.62      c-10.24,12.01-20.42,13.02-28.69,8.1L1105.43,670.31z\" />\n\t\t\t\t<path class=\"st21\" d=\"M1119.71,593.03l22.32-35.54l7.49,4.7l-16.48,26.24l11.47,7.2l15.37-24.47l7.55,4.74l-15.37,24.47      l17.76,11.15l-5.84,9.3L1119.71,593.03z\" />\n\t\t\t\t<path class=\"st21\" d=\"M1198.81,506.13l-11.98,27.36l12.73,5.57l13.29-30.34l7.62,4.77l-17.16,39.19l-47.87-20.96l17.02-38.88      l8.15,3.57l-12.62,28.82l10.71,4.69l11.98-27.36L1198.81,506.13z\" />\n\t\t\t\t<path class=\"st21\" d=\"M1182.43,463.29l2.83-10.58l41.88,11.22l7.76-28.97l8.23,3.75l-10.21,38.11L1182.43,463.29z\" />\n\t\t\t\t<path class=\"st21\" d=\"M1197.89,397.35l2.33-22.82c1.76-17.29,13.98-25.79,27.86-24.38c16.65,1.7,25.66,14.82,24.12,29.91      l-2.3,22.59L1197.89,397.35z M1242.41,390.85l1.03-10.06c1.16-11.33-4.91-17.88-16.24-19.03c-10.4-1.06-17.38,4.2-18.6,15.18      l-1.06,10.36L1242.41,390.85z\" />\n\t\t\t</g>\n\t\t\t<polyline class=\"st17\" points=\"525.17,594.75 711.96,442.89 904.77,594.75    \" />\n\t\t\t<line class=\"st17\" x1=\"493.93\" y1=\"364.38\" x2=\"936.01\" y2=\"364.38\" />\n\t\t</g>\n\t\t<g>\n\t\t\t<rect x=\"215.09\" y=\"151.33\" class=\"st4\" width=\"1011.77\" height=\"224.05\" />\n\t\t\t<path class=\"st23\" d=\"M349.47,158.47v27.39h-53.45v18.76h41.67v26.56h-41.67v19.59h52.79v27.22h-87.65V158.47H349.47z\" />\n\t\t\t<path class=\"st23\" d=\"M361.95,158.47h34.86v119.52h-34.86V158.47z\" />\n\t\t\t<path class=\"st23\" d=\"M447.12,213.08v64.91h-34.36V158.47h36.85l38.35,67.23v-67.23h34.03v119.52H485.8L447.12,213.08z\" />\n\t\t\t<path class=\"st23\" d=\"M633.31,186.03h-34.69v91.96h-34.86v-92.13h-34.69v-27.39h104.25V186.03z\" />\n\t\t\t<path class=\"st23\" d=\"M682.62,158.47c35.36,0,55.44,10.96,55.44,43.16c0,8.47-3.32,22.91-15.94,32.54l19.75,43.82h-38.18     L689.1,242.3h-13.94v35.69h-34.86V158.47H682.62z M675.15,216.9h12.62c11.95,0,14.77-8.8,14.77-16.1     c0-6.97-3.82-15.27-14.77-15.27h-12.62V216.9z\" />\n\t\t\t<path class=\"st23\" d=\"M781.97,158.3h46.31l38.18,119.69h-36.35l-5.81-21.41h-38.18l-5.81,21.41h-36.35L781.97,158.3z      M793.26,229.52h23.41l-10.96-43.82h-1.49L793.26,229.52z\" />\n\t\t\t<path class=\"st23\" d=\"M920.63,156.48c11.29,0,22.58,1,34.36,4.15v28.05c-5.81-1.83-17.6-4.65-27.22-4.65     c-17.6,0-29.55,8.3-29.55,33.37c0,27.06,12.78,35.36,27.72,35.36c9.46,0,20.92-2.49,29.38-6.14v27.72     c-9.79,3.98-24.4,5.64-34.36,5.64c-40.34,0-58.43-22.08-58.43-61.92C862.53,179.88,884.61,156.48,920.63,156.48z\" />\n\t\t\t<path class=\"st23\" d=\"M1002.73,158.47v46.81h39.67v-46.81h35.03v119.52h-35.03v-45.32h-39.67v45.32h-34.86V158.47H1002.73z\" />\n\t\t\t<path class=\"st23\" d=\"M1188.75,186.03h-34.69v91.96h-34.86v-92.13h-34.7v-27.39h104.25V186.03z\" />\n\t\t</g>\n\t</g>\n</g>\n</svg>";

export default function HeroCrest3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const initialWidth = container.clientWidth || 500;
    const initialHeight = container.clientHeight || 480;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      34,
      initialWidth / initialHeight,
      0.1,
      50
    );
    camera.position.set(0, 0, 4.35);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 2. Dynamic Lighting Rig for Dark Obsidian Enamel & Metallic Facets
    // Dynamic Key Light: Follows mouse cursor, casting a gleaming specular highlight
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.0);
    keyLight.position.set(0, 2.2, 3.8);
    scene.add(keyLight);

    // Ambient Fill: Keeps the Bordeaux Crimson (#991636) & Azure (#59A5DB) rich and deep
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    // Bavarian Azure Rim Accent (Top-Right chamfer specular glint)
    const azureEdge = new THREE.PointLight(0x59a5db, 3.8, 8);
    azureEdge.position.set(2.4, 1.4, 1.5);
    scene.add(azureEdge);

    // Bordeaux Crimson Rim Accent (Bottom-Left chamfer specular glint)
    const crimsonEdge = new THREE.PointLight(0x991636, 3.5, 8);
    crimsonEdge.position.set(-2.4, -1.4, 1.5);
    scene.add(crimsonEdge);

    // 3. The 3D Wappen Root Group
    const emblemGroup = new THREE.Group();
    scene.add(emblemGroup);

    // 4. Construct Heraldic Shield Contour (Wappenform)
    // Proportioned to exact official logo bounds (Aspect Ratio 1.44 : 1)
    const shape = new THREE.Shape();
    const w2 = 1.18;
    const hTop = 0.82;
    const cornerR = 0.07;
    const yArcCenter = 0.36;
    const rArc = 1.18;

    // Outer contour path
    shape.moveTo(-w2 + cornerR, hTop);
    shape.lineTo(w2 - cornerR, hTop);
    shape.quadraticCurveTo(w2, hTop, w2, hTop - cornerR);
    shape.lineTo(w2, yArcCenter);
    shape.absarc(0, yArcCenter, rArc, 0, Math.PI, true);
    shape.lineTo(-w2, hTop - cornerR);
    shape.quadraticCurveTo(-w2, hTop, -w2 + cornerR, hTop);

    // 5. Extruded Solid 3D Chassis with Chamfered Metallic Bevel
    const extrudeSettings = {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.035,
      bevelThickness: 0.035,
    };

    const chassisGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    chassisGeo.center();

    // High-grade dark titanium steel with brushed metallic sheen
    const chassisMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x20293a),
      metalness: 0.94,
      roughness: 0.18,
    });

    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    emblemGroup.add(chassisMesh);

    // 6. Solid Obsidian Black Enamel Front Face
    const faceGeo = new THREE.ShapeGeometry(shape);
    faceGeo.center();

    // Map UVs precisely to the bounding box of the heraldic shield
    const pos = faceGeo.attributes.position;
    const uvs = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      uvs[i * 2] = (x + 1.18) / 2.36;
      uvs[i * 2 + 1] = (y + 0.82) / 1.64;
    }
    faceGeo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    // High-Resolution Texture Rasterization (Offscreen Canvas 2048x1424)
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1424;
    const ctx = canvas.getContext("2d");

    const faceMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.14, // Glossy piano-black lacquer / obsidian enamel finish
      metalness: 0.18,
      depthWrite: true,
    });

    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    // Positioned flush at front bevel crest
    faceMesh.position.z = 0.12 / 2 + 0.035 + 0.002;
    emblemGroup.add(faceMesh);

    // Load the official dark SVG vector into canvas texture
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        tex.needsUpdate = true;

        faceMat.map = tex;
        faceMat.needsUpdate = true;
        setIsLoaded(true);
      }
    };

    // Encode SVG to safe data URI
    const svgDataUri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(OFFICIAL_DARK_WAPPEN_SVG);
    img.src = svgDataUri;

    // 7. Dynamic Ground Contact Shadow
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sctx = shadowCanvas.getContext("2d")!;
    const sgrad = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    sgrad.addColorStop(0, "rgba(0, 0, 0, 0.65)");
    sgrad.addColorStop(0.5, "rgba(0, 0, 0, 0.20)");
    sgrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    sctx.fillStyle = sgrad;
    sctx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(2.8, 0.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(0, -1.22, 0);
    scene.add(shadowMesh);

    // 8. Mouse Interaction (Perspective 3D Spring Physics)
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      mouse.targetX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth * 0.38)));
      mouse.targetY = Math.max(-1, Math.min(1, -(e.clientY - centerY) / (window.innerHeight * 0.38)));
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const ro = new ResizeObserver(() => handleResize());
    ro.observe(container);
    handleResize();

    // 10. Animation Loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Damped spring physics
      mouse.x += (mouse.targetX - mouse.x) * 0.085;
      mouse.y += (mouse.targetY - mouse.y) * 0.085;

      // Gentle floating idle breath
      const idleY = Math.sin(elapsed * 1.5) * 0.035;
      const idleRotZ = Math.cos(elapsed * 1.1) * 0.012;

      // 3D Perspective Rotation
      emblemGroup.rotation.y = mouse.x * 0.42;
      emblemGroup.rotation.x = -mouse.y * 0.32;
      emblemGroup.rotation.z = idleRotZ - mouse.x * 0.035;

      emblemGroup.position.y = idleY + mouse.y * 0.06;
      emblemGroup.position.x = mouse.x * 0.08;

      // Dynamic key light moves with cursor for shifting specular sheen
      keyLight.position.x = mouse.x * 2.6;
      keyLight.position.y = 2.2 + mouse.y * 2.0;

      // Shadow parallax
      shadowMesh.position.x = -mouse.x * 0.05;
      shadowMesh.scale.x = 1.0 - Math.abs(mouse.x) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      ro.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      chassisGeo.dispose();
      chassisMat.dispose();
      faceGeo.dispose();
      faceMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "540px",
        height: "480px",
        minHeight: "480px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
      }}
    >
      <div
        ref={mountRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          opacity: isLoaded ? 1 : 0.9,
          transition: "opacity 0.4s ease",
        }}
      />
    </div>
  );
}
