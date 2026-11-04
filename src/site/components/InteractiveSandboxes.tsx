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
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="50%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#0F2942"/>
    </linearGradient>
    <linearGradient id="orb" x1="260" y1="70" x2="540" y2="310" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#A855F7"/>
      <stop offset="50%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#0EA5E9"/>
    </linearGradient>
  </defs>
  <rect width="800" height="380" fill="url(#bg)"/>
  <g stroke="rgba(148,163,184,0.16)" stroke-width="1">
    <line x1="0" y1="95" x2="800" y2="95"/>
    <line x1="0" y1="190" x2="800" y2="190"/>
    <line x1="0" y1="285" x2="800" y2="285"/>
    <line x1="200" y1="0" x2="200" y2="380"/>
    <line x1="400" y1="0" x2="400" y2="380"/>
    <line x1="600" y1="0" x2="600" y2="380"/>
  </g>
  <circle cx="400" cy="190" r="115" fill="url(#orb)" opacity="0.9"/>
  <circle cx="400" cy="190" r="142" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="6 6"/>
  <rect x="44" y="42" width="210" height="76" rx="12" fill="rgba(15,23,42,0.82)" stroke="rgba(139,92,246,0.5)"/>
  <text x="64" y="74" fill="#F8FAFC" font-family="monospace" font-size="14" font-weight="700">SWARM IMAGE 2.0</text>
  <text x="64" y="98" fill="#38BDF8" font-family="monospace" font-size="12">mosaic · scanline · halftone</text>
  <rect x="536" y="262" width="220" height="76" rx="12" fill="rgba(15,23,42,0.82)" stroke="rgba(14,165,233,0.5)"/>
  <text x="556" y="294" fill="#F8FAFC" font-family="monospace" font-size="14" font-weight="700">RUST/WASM SIMD128</text>
  <text x="556" y="318" fill="#A855F7" font-family="monospace" font-size="12">60fps Zero-React-Tick</text>
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
      ctx.strokeStyle = `rgba(13, 153, 255, ${0.18 + weights.extrude * 0.55})`;
      ctx.lineWidth = 1;
      const boxR = 98 * (0.4 + 0.6 * weights.extrude);
      ctx.strokeRect(cx - boxR, cy - boxR * 0.85, boxR * 2, boxR * 1.7);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#EF4444";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 58, cy + 12);
      ctx.stroke();
      ctx.strokeStyle = "#22C55E";
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
        ? `rgba(124, 58, 237, ${0.45 + weights.slice * 0.5})`
        : `rgba(14, 165, 233, ${0.25 + weights.particles * 0.65})`;
      ctx.fill();
    }

    if (weights.slice > 0.02 && weights.slice < 0.99) {
      const laserScreenY = cy - sliceY * scale;
      ctx.strokeStyle = "#A855F7";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 135, laserScreenY);
      ctx.lineTo(cx + 135, laserScreenY);
      ctx.stroke();
    }
  }, [clampedP, mode, weights.extrude, weights.particles, weights.slice]);

  return (
    <div className="docs-sandbox" data-swarm="rect">
      <div className="docs-sandbox-header">
        <div>
          <span className="docs-sandbox-badge">LIVE 3D + WASM SIMD128 SANDBOX</span>
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
            className="docs-chip"
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
          <canvas ref={canvasRef} width={520} height={240} className="docs-3d-canvas" />
        </Swarm3D>
        <div className="docs-sandbox-metrics">
          <div className="docs-metric-row">
            <span>Progress</span>
            <strong>{Math.round(clampedP * 100)}%</strong>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={clampedP}
            onChange={(e) => {
              setPlaying(false);
              setProgress(Number(e.target.value));
            }}
          />
          <div className="docs-metric-row">
            <span>extrude weight</span>
            <code>{weights.extrude.toFixed(2)}</code>
          </div>
          <div className="docs-metric-row">
            <span>particles weight</span>
            <code>{weights.particles.toFixed(2)}</code>
          </div>
          <div className="docs-metric-row">
            <span>slice weight</span>
            <code>{weights.slice.toFixed(2)}</code>
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
        <div>
          <span className="docs-sandbox-badge">LIVE 2D &lt;SwarmImage&gt; SANDBOX</span>
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
            className="docs-chip"
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
            <span>Active Phase</span>
            <code>{imgState.activePhase}</code>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={clampedP}
            onChange={(e) => {
              setPlaying(false);
              setProgress(Number(e.target.value));
            }}
          />
          <div className="docs-metric-row">
            <span>Quadtree Block</span>
            <code>{imgState.pixelBlockSize}px</code>
          </div>
          <div className="docs-metric-row">
            <span>Laser Scanline</span>
            <code>{Math.round(imgState.scanlineRatio * 100)}%</code>
          </div>
          <div className="docs-metric-row">
            <span>Halftone Scale</span>
            <code>{imgState.halftoneRadiusScale.toFixed(2)}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
