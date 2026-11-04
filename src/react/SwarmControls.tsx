import React, { useEffect, useRef, useState } from "react";
import type { AutoScrollController } from "../core/autoscroll";
import type { SwarmEngine } from "../core/engine";
import type { ScrollMode } from "../core/types";

export interface SwarmControlsProps {
  engine: SwarmEngine;
  autoScroll: AutoScrollController;
  position?: "bottom-right" | "bottom-left" | "top-right";
  /** Start with popover open (default: false — collapsed corner badge like Next.js Turbopack) */
  defaultOpen?: boolean;
  /** Optional extra settings rows rendered inside the popover */
  children?: React.ReactNode;
}

const TEMPOS = [0.5, 1, 2, 4] as const;
const SCROLL_MODES: Array<{ value: ScrollMode; label: string }> = [
  { value: "manual", label: "Manual" },
  { value: "auto", label: "Auto" },
  { value: "hybrid", label: "Hybrid" },
];

export function SwarmControls({
  engine,
  autoScroll,
  position = "bottom-right",
  defaultOpen = false,
  children,
}: SwarmControlsProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [, setForce] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const refresh = () => setForce((n) => n + 1);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const doneCount = engine.tasks.filter((t) => t.state === "done").length;
  const totalCount = engine.tasks.length;
  const progressPct =
    totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 100;
  const isCompleted =
    totalCount > 0 &&
    (engine.done || engine.flocking || doneCount === totalCount);
  const isBuilding =
    engine.started && !engine.paused && !isCompleted && totalCount > 0;

  return (
    <div
      ref={rootRef}
      className={`swarm-turbopack-widget ${position}${open ? " is-open" : ""}`}
    >
      {/* Popover Panel */}
      <div
        className="swarm-turbopack-popover"
        role="dialog"
        aria-label="SwarmCursor Settings"
        aria-hidden={!open}
      >
        <div className="swarm-tp-header">
          <div className="swarm-tp-title">
            <span
              className={`swarm-tp-dot${isBuilding ? " is-active" : engine.paused ? " is-paused" : ""}`}
            />
            <strong>SwarmCursor</strong>
            <span className="swarm-tp-badge">
              {engine.paused
                ? "Paused"
                : isCompleted
                  ? "Completed"
                  : engine.started
                    ? "Building"
                    : "Idle"}
            </span>
          </div>
          <button
            type="button"
            className="swarm-tp-close"
            onClick={() => setOpen(false)}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Progress & Stats */}
        <div className="swarm-tp-stats">
          <div className="swarm-tp-stats-row">
            <span>{engine.cursors.length} active agents</span>
            <span>
              {doneCount}/{totalCount} tasks ({progressPct}%)
            </span>
          </div>
          <div className="swarm-tp-progress-track">
            <div
              className="swarm-tp-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Playback Actions */}
        <div className="swarm-tp-row">
          <span className="swarm-tp-label">Playback</span>
          <div className="swarm-tp-actions">
            <button
              type="button"
              className="swarm-tp-btn primary"
              onClick={() => {
                if (!engine.started) engine.start();
                else if (engine.paused) engine.resume();
                else engine.pause();
                refresh();
              }}
            >
              {!engine.started ? "▶ Start" : engine.paused ? "▶ Resume" : "⏸ Pause"}
            </button>
            <button
              type="button"
              className="swarm-tp-btn"
              onClick={() => {
                engine.reset();
                if (typeof window !== "undefined") window.scrollTo(0, 0);
                engine.start();
                refresh();
              }}
            >
              ↺ Replay
            </button>
          </div>
        </div>

        {/* Scroll Mode Segmented Control */}
        <div className="swarm-tp-row">
          <span className="swarm-tp-label">Scroll</span>
          <div className="swarm-tp-seg">
            {SCROLL_MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                className={autoScroll.mode === m.value ? "active" : ""}
                onClick={() => {
                  autoScroll.setMode(m.value);
                  refresh();
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speed Segmented Control */}
        <div className="swarm-tp-row">
          <span className="swarm-tp-label">Speed</span>
          <div className="swarm-tp-seg">
            {TEMPOS.map((t) => (
              <button
                key={t}
                type="button"
                className={
                  Math.abs(engine.tempoMultiplier - t) < 0.05 ? "active" : ""
                }
                onClick={() => {
                  engine.setTempoMultiplier(t);
                  refresh();
                }}
              >
                {t}×
              </button>
            ))}
          </div>
        </div>

        {/* Rulers Toggle */}
        <div className="swarm-tp-row">
          <span className="swarm-tp-label">Figma Rulers</span>
          <button
            type="button"
            className={`swarm-tp-btn${engine.rulers.want > 0 ? " active" : ""}`}
            onClick={() => {
              engine.rulers.want = engine.rulers.want > 0 ? 0 : 1;
              engine.rulers.lastNeed =
                engine.rulers.want > 0 ? engine.time : -10;
              refresh();
            }}
          >
            {engine.rulers.want > 0 ? "On" : "Off"}
          </button>
        </div>

        {children && <div className="swarm-tp-extra">{children}</div>}
      </div>

      {/* Corner Trigger Button (Next.js Turbopack Style) */}
      <button
        type="button"
        className="swarm-turbopack-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title="SwarmCursor Settings"
      >
        <span
          className={`swarm-tp-trigger-dot${isBuilding ? " is-active" : ""}`}
        />
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
        </svg>
        <span className="swarm-tp-trigger-count">{engine.cursors.length}</span>
      </button>
    </div>
  );
}
