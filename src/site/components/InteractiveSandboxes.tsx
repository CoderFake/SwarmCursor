import React, { useEffect, useRef, useState } from "react";
import { Swarm3D, SwarmImage } from "../../react";
import { compute3DPhaseWeights } from "../../three";
import { computeImageBuildState } from "../../tools";
import { wasmKernel } from "../../kernel";
import type { Swarm3DBuildMode, SwarmImageBuildMode } from "../../core/types";
import type { DocsUI } from "../types";

const DEMO_ARCHITECTURAL_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="380" viewBox="0 0 800 380">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="800" y2="380" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#070B14"/>
      <stop offset="50%" stop-color="#13112C"/>
      <stop offset="100%" stop-color="#091E32"/>
    </linearGradient>
    <linearGradient id="orb" x1="260" y1="70" x2="540" y2="310" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#8B5CF6"/>
      <stop offset="50%" stop-color="#4F46E5"/>
      <stop offset="100%" stop-color="#0EA5E9"/>
    </linearGradient>
  </defs>
  <rect width="800" height="380" fill="url(#bg)"/>
  <g stroke="rgba(148,163,184,0.14)" stroke-width="1">
    <line x1="0" y1="95" x2="800" y2="95"/>
    <line x1="0" y1="190" x2="800" y2="190"/>
    <line x1="0" y1="285" x2="800" y2="285"/>
    <line x1="200" y1="0" x2="200" y2="380"/>
    <line x1="400" y1="0" x2="400" y2="380"/>
    <line x1="600" y1="0" x2="600" y2="380"/>
  </g>
  <circle cx="400" cy="190" r="115" fill="url(#orb)" opacity="0.92"/>
  <circle cx="400" cy="190" r="144" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="6 6"/>
  <rect x="40" y="38" width="228" height="78" rx="12" fill="rgba(11,15,25,0.88)" stroke="rgba(139,92,246,0.55)"/>
  <text x="60" y="70" fill="#F8FAFC" font-family="monospace" font-size="13" font-weight="700">SWARM IMAGE 2.0</text>
  <text x="60" y="94" fill="#38BDF8" font-family="monospace" font-size="11.5">mosaic · scanline · halftone</text>
  <rect x="530" y="262" width="230" height="78" rx="12" fill="rgba(11,15,25,0.88)" stroke="rgba(14,165,233,0.55)"/>
  <text x="550" y="294" fill="#F8FAFC" font-family="monospace" font-size="13" font-weight="700">RUST/WASM SIMD128</text>
  <text x="550" y="318" fill="#A855F7" font-family="monospace" font-size="11.5">60fps Zero-React-Tick</text>
</svg>`);

export function Interactive3DSandbox({ ui }: { ui: DocsUI }) {
  const [mode, setMode] = useState<Swarm3DBuildMode>("all");
  const [progress, setProgress] = useState(0.68);
  const [playing, setPlaying] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setProgress((p) => {
        const next = p + dt * 0.24;
        return next > 1.15 ? 0 : next;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const clampedP = Math.min(1, Math.max(0, progress));
  const weights = compute3DPhaseWeights(mode, clampedP);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Subtle viewport grid
    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    ctx.lineWidth = 1;
    for (let gx = 40; gx < w; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = 40; gy < h; gy += 40) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    const rings = 14;
    const segments = 24;
    const count = rings * segments;
    const basePos = new Float32Array(count * 3);
    const outPos = new Float32Array(count * 3);

    let idx = 0;
    for (let r = 0; r < rings; r++) {
      const phi = ((r + 0.5) / rings) * Math.PI;
      for (let s = 0; s < segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        basePos[idx * 3] = Math.sin(phi) * Math.cos(theta) * 1.45;
        basePos[idx * 3 + 1] = Math.cos(phi) * 1.45;
        basePos[idx * 3 + 2] = Math.sin(phi) * Math.sin(theta) * 1.45;
        idx++;
      }
    }

    const sliceY = -1.6 + weights.slice * 3.2;
    wasmKernel.deformSculpturalMeshBatch(
      basePos,
      outPos,
      performance.now() * 0.0015
    );

    const cx = w * 0.5;
    const cy = h * 0.52;
    const scale = 68;

    if (weights.extrude > 0.01) {
      ctx.strokeStyle = `rgba(14, 165, 233, ${0.22 + weights.extrude * 0.55})`;
      ctx.lineWidth = 1.25;
      const boxR = 98 * (0.4 + 0.6 * weights.extrude);
      ctx.strokeRect(cx - boxR, cy - boxR * 0.85, boxR * 2, boxR * 1.7);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#EF4444";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 58, cy + 12);
      ctx.stroke();
      ctx.strokeStyle = "#10B981";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy - 62);
      ctx.stroke();
      ctx.strokeStyle = "#3B82F6";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx - 46, cy + 28);
      ctx.stroke();
    }

    for (let i = 0; i < count; i++) {
      const x3 = outPos[i * 3];
      const y3 = outPos[i * 3 + 1];
      const z3 = outPos[i * 3 + 2];
      const persp = 3.6 / (3.6 - z3 * 0.55);
      const sx = cx + x3 * scale * persp;
      const sy = cy - y3 * scale * persp;

      const isSliced = y3 <= sliceY;
      ctx.beginPath();
      ctx.arc(sx, sy, isSliced ? 3.1 : 2.1, 0, Math.PI * 2);
      ctx.fillStyle = isSliced
        ? `rgba(139, 92, 246, ${0.48 + weights.slice * 0.52})`
        : `rgba(56, 189, 248, ${0.28 + weights.particles * 0.65})`;
      ctx.fill();
    }

    if (weights.slice > 0.02 && weights.slice < 0.99) {
      const laserScreenY = cy - sliceY * scale;
      ctx.strokeStyle = "#A855F7";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 140, laserScreenY);
      ctx.lineTo(cx + 140, laserScreenY);
      ctx.stroke();
    }
  }, [clampedP, mode, weights.extrude, weights.particles, weights.slice]);

  return (
    <div className="docs-sandbox" data-swarm="rect">
      <div className="docs-sandbox-header">
        <div className="docs-sandbox-title-group">
          <div className="docs-sandbox-badge-row">
            <span className="docs-pulse-dot" />
            <span className="docs-sandbox-badge">LIVE 3D + WASM SIMD128 VIEWPORT</span>
          </div>
          <h4>{ui.sandbox.threeTitle}</h4>
        </div>
        <div className="docs-sandbox-controls">
          {(["all", "extrude", "particles", "slice"] as Swarm3DBuildMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`docs-chip ${mode === m ? "is-active" : ""}`}
              onClick={() => {
                setMode(m);
                setProgress(0);
                setPlaying(true);
              }}
            >
              {m}
            </button>
          ))}
          <button
            type="button"
            className="docs-chip docs-chip-action"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? ui.sandbox.pause : ui.sandbox.play}
          </button>
        </div>
      </div>

      <div className="docs-sandbox-body">
        <Swarm3D
          id="docs-live-3d-stage"
          buildMode={mode}
          squadSize={4}
          className="docs-3d-canvas-wrap"
        >
          <canvas ref={canvasRef} width={540} height={248} className="docs-3d-canvas" />
        </Swarm3D>
        <div className="docs-sandbox-metrics">
          <div className="docs-metric-row">
            <span>Timeline Scrub</span>
            <strong>{Math.round(clampedP * 100)}%</strong>
          </div>
          <input
            type="range"
            className="docs-range"
            min={0}
            max={1}
            step={0.01}
            value={clampedP}
            onChange={(e) => {
              setPlaying(false);
              setProgress(Number(e.target.value));
            }}
          />
          <div className="docs-metric-bar-group">
            <div className="docs-metric-row">
              <span>01 · extrude (AABB)</span>
              <code>{weights.extrude.toFixed(2)}</code>
            </div>
            <div className="docs-progress-track">
              <div className="docs-progress-fill is-cyan" style={{ width: `${weights.extrude * 100}%` }} />
            </div>
          </div>
          <div className="docs-metric-bar-group">
            <div className="docs-metric-row">
              <span>02 · particles (Voxel)</span>
              <code>{weights.particles.toFixed(2)}</code>
            </div>
            <div className="docs-progress-track">
              <div className="docs-progress-fill is-indigo" style={{ width: `${weights.particles * 100}%` }} />
            </div>
          </div>
          <div className="docs-metric-bar-group">
            <div className="docs-metric-row">
              <span>03 · slice (PBR Laser)</span>
              <code>{weights.slice.toFixed(2)}</code>
            </div>
            <div className="docs-progress-track">
              <div className="docs-progress-fill is-violet" style={{ width: `${weights.slice * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InteractiveImageSandbox({ ui }: { ui: DocsUI }) {
  const [mode, setMode] = useState<SwarmImageBuildMode>("all");
  const [progress, setProgress] = useState(0.55);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setProgress((p) => {
        const next = p + dt * 0.28;
        return next > 1.15 ? 0 : next;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const clampedP = Math.min(1, Math.max(0, progress));
  const imgState = computeImageBuildState(mode, clampedP);

  return (
    <div className="docs-sandbox" data-swarm="rect">
      <div className="docs-sandbox-header">
        <div className="docs-sandbox-title-group">
          <div className="docs-sandbox-badge-row">
            <span className="docs-pulse-dot" />
            <span className="docs-sandbox-badge">LIVE 2D &lt;SwarmImage&gt; PIPELINE</span>
          </div>
          <h4>{ui.sandbox.imageTitle}</h4>
        </div>
        <div className="docs-sandbox-controls">
          {(["all", "mosaic", "scanline", "halftone"] as SwarmImageBuildMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`docs-chip ${mode === m ? "is-active" : ""}`}
              onClick={() => {
                setMode(m);
                setProgress(0);
                setPlaying(true);
              }}
            >
              {m}
            </button>
          ))}
          <button
            type="button"
            className="docs-chip docs-chip-action"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? ui.sandbox.pause : ui.sandbox.play}
          </button>
        </div>
      </div>

      <div className="docs-sandbox-body">
        <div
          className="docs-image-preview-stage"
          style={
            {
              "--swarm-img-progress": clampedP.toFixed(3),
              "--swarm-img-scanline": `${(imgState.scanlineRatio * 100).toFixed(1)}%`,
              "--swarm-img-blur": `${imgState.blurPx.toFixed(1)}px`,
              "--swarm-img-halftone": imgState.halftoneRadiusScale.toFixed(3),
            } as React.CSSProperties
          }
          data-swarm-image={imgState.activePhase}
          data-swarm-drawing={clampedP < 0.99 ? "true" : undefined}
          data-swarm-done={clampedP >= 0.99 ? "true" : undefined}
        >
          <SwarmImage
            id="docs-sandbox-img"
            src={DEMO_ARCHITECTURAL_SVG}
            alt="SwarmImage 2.0 Demo"
            buildMode={mode}
            className="docs-sandbox-img"
          />
        </div>

        <div className="docs-sandbox-metrics">
          <div className="docs-metric-row">
            <span>Active Stage</span>
            <code className="docs-stage-pill">{imgState.activePhase}</code>
          </div>
          <input
            type="range"
            className="docs-range"
            min={0}
            max={1}
            step={0.01}
            value={clampedP}
            onChange={(e) => {
              setPlaying(false);
              setProgress(Number(e.target.value));
            }}
          />
          <div className="docs-metric-bar-group">
            <div className="docs-metric-row">
              <span>Quadtree Block</span>
              <code>{imgState.pixelBlockSize}px</code>
            </div>
            <div className="docs-progress-track">
              <div
                className="docs-progress-fill is-cyan"
                style={{ width: `${Math.max(8, (1 - imgState.pixelBlockSize / 32) * 100)}%` }}
              />
            </div>
          </div>
          <div className="docs-metric-bar-group">
            <div className="docs-metric-row">
              <span>Laser Scanline</span>
              <code>{Math.round(imgState.scanlineRatio * 100)}%</code>
            </div>
            <div className="docs-progress-track">
              <div
                className="docs-progress-fill is-indigo"
                style={{ width: `${imgState.scanlineRatio * 100}%` }}
              />
            </div>
          </div>
          <div className="docs-metric-bar-group">
            <div className="docs-metric-row">
              <span>Halftone Scale</span>
              <code>{imgState.halftoneRadiusScale.toFixed(2)}</code>
            </div>
            <div className="docs-progress-track">
              <div
                className="docs-progress-fill is-violet"
                style={{ width: `${imgState.halftoneRadiusScale * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
