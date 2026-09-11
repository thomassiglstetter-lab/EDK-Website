"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Move,
  Maximize2,
  Crop,
  Sparkles,
  Eye,
} from "lucide-react";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageName: string;
  targetFolder: string;
  aspectRatio?: number;
  title?: string;
  onSuccess: (url: string) => void | Promise<void>;
}

export default function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  imageName = "sponsor-logo",
  targetFolder = "sponsors",
  aspectRatio = 2.4, // e.g. 480 x 200
  title = "Logo zuschneiden & positionieren",
  onSuccess,
}: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [saving, setSaving] = useState<boolean>(false);
  const [bgMode, setBgMode] = useState<"checker" | "dark" | "light">("checker");

  // Load image element
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      setPan({ x: 0, y: 0 });
      // Auto-fit initial zoom: fit nicely inside viewport
      const targetW = 460;
      const targetH = targetW / aspectRatio;
      const scaleW = targetW / img.width;
      const scaleH = targetH / img.height;
      const initialScale = Math.min(scaleW, scaleH);
      setZoom(Math.max(0.2, Math.min(4.0, initialScale)));
    };
    img.src = imageSrc;
  }, [imageSrc, aspectRatio]);

  // Render on canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background
    if (bgMode === "dark") {
      ctx.fillStyle = "#0C111A";
      ctx.fillRect(0, 0, width, height);
    } else if (bgMode === "light") {
      ctx.fillStyle = "#F8FAFC";
      ctx.fillRect(0, 0, width, height);
    } else {
      // Checkerboard pattern
      const size = 12;
      for (let x = 0; x < width; x += size) {
        for (let y = 0; y < height; y += size) {
          ctx.fillStyle = (x / size + y / size) % 2 === 0 ? "#1E293B" : "#0F172A";
          ctx.fillRect(x, y, size, size);
        }
      }
    }

    // 2. Draw Image with Zoom & Pan
    ctx.save();
    const centerX = width / 2 + pan.x * 2; // account for DPR=2
    const centerY = height / 2 + pan.y * 2;
    const drawW = image.width * zoom * 2;
    const drawH = image.height * zoom * 2;

    ctx.drawImage(
      image,
      centerX - drawW / 2,
      centerY - drawH / 2,
      drawW,
      drawH
    );
    ctx.restore();

    // 3. Subtle inner border guide
    ctx.strokeStyle = "rgba(245, 158, 11, 0.45)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
  }, [image, zoom, pan, bgMode]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Mouse / Touch Drag Handlers with Window-level listeners
  const handleStartDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartRef.current = { x: clientX, y: clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStartDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const dx = touch.clientX - dragStartRef.current.x;
        const dy = touch.clientY - dragStartRef.current.y;
        setPan({
          x: panStartRef.current.x + dx,
          y: panStartRef.current.y + dy,
        });
      }
    };

    const onTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging]);

  // Wheel to zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setZoom((prev) => Math.max(0.2, Math.min(4.0, prev + delta)));
  };

  // Auto-fit function (Fit / Contain)
  const handleAutoFit = () => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const scaleW = canvas.width / 2 / image.width;
    const scaleH = canvas.height / 2 / image.height;
    const fit = Math.min(scaleW, scaleH);
    setZoom(fit);
    setPan({ x: 0, y: 0 });
  };

  // Auto-fill function (Fill / Cover - entire card is covered)
  const handleAutoFill = () => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const scaleW = canvas.width / 2 / image.width;
    const scaleH = canvas.height / 2 / image.height;
    const fill = Math.max(scaleW, scaleH);
    setZoom(fill);
    setPan({ x: 0, y: 0 });
  };

  // Auto-trim function (Detects bounding box of non-transparent/non-white pixels and scales to fill)
  const handleAutoTrim = () => {
    if (!image) return;
    try {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = image.width;
      tempCanvas.height = image.height;
      const ctx = tempCanvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(image, 0, 0);
      const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imgData.data;

      let minX = tempCanvas.width, minY = tempCanvas.height, maxX = 0, maxY = 0;
      let hasContent = false;

      for (let y = 0; y < tempCanvas.height; y++) {
        for (let x = 0; x < tempCanvas.width; x++) {
          const idx = (y * tempCanvas.width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          const isTransparent = a < 25;
          const isWhite = r > 240 && g > 240 && b > 240;

          if (!isTransparent && !isWhite) {
            hasContent = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (!hasContent || maxX <= minX || maxY <= minY) {
        handleAutoFill();
        return;
      }

      const contentW = maxX - minX;
      const contentH = maxY - minY;
      const contentCenterX = (minX + maxX) / 2;
      const contentCenterY = (minY + maxY) / 2;

      const targetW = 460;
      const targetH = targetW / aspectRatio;

      const scaleW = (targetW * 0.95) / contentW;
      const scaleH = (targetH * 0.95) / contentH;
      const newZoom = Math.min(scaleW, scaleH);

      const panX = (image.width / 2 - contentCenterX) * newZoom;
      const panY = (image.height / 2 - contentCenterY) * newZoom;

      setZoom(Math.max(0.2, Math.min(4.0, newZoom)));
      setPan({ x: panX, y: panY });
    } catch (e) {
      console.warn("Auto-trim failed, using auto-fit", e);
      handleAutoFit();
    }
  };

  // Export & Save
  const handleApplyCrop = async () => {
    if (!image) return;
    setSaving(true);

    try {
      // Create high-res export canvas (480px for sponsors is crisp 2x retina, 960px for news/teams)
      const exportW = targetFolder === "sponsors" ? 480 : 960;
      const exportH = Math.round(exportW / aspectRatio);
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = exportW;
      exportCanvas.height = exportH;
      const ctx = exportCanvas.getContext("2d");

      if (!ctx) throw new Error("Canvas context could not be created");

      // Transparent background
      ctx.clearRect(0, 0, exportW, exportH);

      // Scaling relative to editor canvas (editor width is ~460px)
      const editorW = 460;
      const multiplier = exportW / editorW;

      const centerX = exportW / 2 + pan.x * multiplier;
      const centerY = exportH / 2 + pan.y * multiplier;
      const drawW = image.width * zoom * multiplier;
      const drawH = image.height * zoom * multiplier;

      ctx.drawImage(
        image,
        centerX - drawW / 2,
        centerY - drawH / 2,
        drawW,
        drawH
      );

      // Convert to Blob
      exportCanvas.toBlob(async (blob) => {
        if (!blob) {
          alert("Fehler beim Generieren des Zuschnitts.");
          setSaving(false);
          return;
        }

        try {
          const fd = new FormData();
          const safeName = imageName.toLowerCase().replace(/[^a-z0-9]/g, "-") || "cropped";
          fd.append("file", blob, `${safeName}.png`);
          fd.append("folder", targetFolder);
          fd.append("slug", `${safeName}-cropped`);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: fd,
          });

          const json = await res.json();
          if (json.success && json.url) {
            try {
              await Promise.resolve(onSuccess(json.url));
            } catch (callbackErr) {
              console.error("onSuccess callback error:", callbackErr);
            }
            onClose();
            setSaving(false);
            return;
          }
        } catch (uploadNetErr) {
          console.warn("Upload fetch failed, using local canvas data URL fallback:", uploadNetErr);
        }

        // Client-side fallback if server upload failed or was rejected:
        // Use the generated canvas as a crisp Base64 data URL
        try {
          const fallbackDataUrl = exportCanvas.toDataURL("image/png");
          if (fallbackDataUrl && fallbackDataUrl.length > 50) {
            await Promise.resolve(onSuccess(fallbackDataUrl));
            onClose();
            setSaving(false);
            return;
          }
        } catch (canvasErr) {
          console.error("Canvas export failed:", canvasErr);
        }

        alert("Upload fehlgeschlagen. Bitte erneut versuchen.");
        setSaving(false);
      }, "image/png");
    } catch (err) {
      console.error("Crop save error:", err);
      alert("Fehler beim Zuschneiden des Logos.");
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const displayWidth = 460;
  const displayHeight = Math.round(displayWidth / aspectRatio);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(4, 7, 12, 0.88)",
        backdropFilter: "blur(16px)",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "rgba(13, 18, 28, 0.98)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          borderRadius: "20px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85)",
          padding: "26px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} style={{ color: "#FBBF24" }} />
              <span>{title}</span>
            </h3>
            <p style={{ fontSize: "0.78rem", color: "#94A3B8", marginTop: "2px" }}>
              Mit der Maus verschieben & per Schieberegler skalieren.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94A3B8",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Canvas Interactive Stage */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: `${displayWidth}px`,
              height: `${displayHeight}px`,
              maxWidth: "100%",
              borderRadius: "12px",
              overflow: "hidden",
              border: "2px solid rgba(245, 158, 11, 0.4)",
              position: "relative",
              cursor: isDragging ? "grabbing" : "grab",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.6)",
              userSelect: "none",
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onWheel={handleWheel}
          >
            <canvas
              ref={canvasRef}
              width={displayWidth * 2}
              height={displayHeight * 2}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />

            {/* Hint overlay badge */}
            <div
              style={{
                position: "absolute",
                bottom: "8px",
                right: "8px",
                background: "rgba(0, 0, 0, 0.65)",
                backdropFilter: "blur(6px)",
                padding: "3px 8px",
                borderRadius: "4px",
                color: "#CBD5E1",
                fontSize: "0.68rem",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Move size={11} />
              <span>Ziehen zum Verschieben</span>
            </div>
          </div>

          {/* Background Contrast Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
            <span style={{ fontSize: "0.74rem", color: "#64748B" }}>Kontrast-Vorschau:</span>
            <button
              type="button"
              onClick={() => setBgMode("checker")}
              style={{
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "0.72rem",
                border: "1px solid",
                borderColor: bgMode === "checker" ? "#F59E0B" : "rgba(255, 255, 255, 0.1)",
                background: bgMode === "checker" ? "rgba(245, 158, 11, 0.2)" : "transparent",
                color: bgMode === "checker" ? "#FBBF24" : "#94A3B8",
                cursor: "pointer",
              }}
            >
              Transparent
            </button>
            <button
              type="button"
              onClick={() => setBgMode("dark")}
              style={{
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "0.72rem",
                border: "1px solid",
                borderColor: bgMode === "dark" ? "#F59E0B" : "rgba(255, 255, 255, 0.1)",
                background: bgMode === "dark" ? "rgba(245, 158, 11, 0.2)" : "transparent",
                color: bgMode === "dark" ? "#FBBF24" : "#94A3B8",
                cursor: "pointer",
              }}
            >
              Dunkel
            </button>
            <button
              type="button"
              onClick={() => setBgMode("light")}
              style={{
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "0.72rem",
                border: "1px solid",
                borderColor: bgMode === "light" ? "#F59E0B" : "rgba(255, 255, 255, 0.1)",
                background: bgMode === "light" ? "rgba(245, 158, 11, 0.2)" : "transparent",
                color: bgMode === "light" ? "#FBBF24" : "#94A3B8",
                cursor: "pointer",
              }}
            >
              Hell
            </button>
          </div>
        </div>

        {/* Zoom & Quick Action Controls */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "12px",
            padding: "12px 16px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* Zoom Slider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}
              style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", padding: "2px" }}
              title="Verkleinern"
            >
              <ZoomOut size={16} />
            </button>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.02"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{
                flex: 1,
                accentColor: "#F59E0B",
                cursor: "pointer",
              }}
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3.0, z + 0.1))}
              style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", padding: "2px" }}
              title="Vergrößern"
            >
              <ZoomIn size={16} />
            </button>
            <span style={{ fontSize: "0.8rem", color: "#CBD5E1", width: "42px", textAlign: "right", fontWeight: 600 }}>
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Quick Buttons */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleAutoTrim}
              title="Entfernt automatisch leere Ränder um das Logo und zentriert es optimal"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "6px",
                background: "linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(245, 158, 11, 0.1))",
                border: "1px solid rgba(245, 158, 11, 0.45)",
                color: "#FBBF24",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Crop size={12} />
              <span>Ränder entfernen & anpassen</span>
            </button>

            <button
              type="button"
              onClick={handleAutoFill}
              title="Skaliert das Bild so, dass der Platzhalter komplett ausgefüllt wird"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 11px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#FFFFFF",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              <Maximize2 size={12} />
              <span>Vollflächig ausfüllen</span>
            </button>

            <button
              type="button"
              onClick={handleAutoFit}
              title="Skaliert das Bild so, dass es vollständig sichtbar ist"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 11px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#CBD5E1",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              <span>Komplett einpassen</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPan({ x: 0, y: 0 });
              }}
              title="Zentriert das Bild"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 11px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#CBD5E1",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              <RotateCcw size={12} />
              <span>Zentrieren</span>
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              color: "#CBD5E1",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={saving}
            className="btn-primary"
            style={{
              padding: "10px 22px",
              fontSize: "0.85rem",
              background: "linear-gradient(135deg, #D97706, #B45309)",
              borderColor: "#F59E0B",
              opacity: saving ? 0.7 : 1,
              cursor: saving ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Check size={16} />
            <span>{saving ? "Wird gespeichert..." : "Zuschnitt anwenden & speichern"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
