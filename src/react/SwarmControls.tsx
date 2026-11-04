import React, { useEffect, useRef, useState } from "react";
import type { AutoScrollController } from "../core/autoscroll";
import type { SwarmEngine } from "../engine/SwarmEngine";
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

const SWARM_STORAGE_KEY = "swarm_cursor_settings_v1";

interface PersistedSwarmSettings {
  scrollMode?: ScrollMode;
  tempoMultiplier?: number;
  rulers?: boolean;
  paused?: boolean;
  open?: boolean;
}

function readSwarmSettings(): PersistedSwarmSettings {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SWARM_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedSwarmSettings) : {};
  } catch {
    return {};
  }
}

function writeSwarmSettings(patch: Partial<PersistedSwarmSettings>): void {
  if (typeof window === "undefined") return;
  try {
    const next = { ...readSwarmSettings(), ...patch };
    window.localStorage.setItem(SWARM_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors
  }
}

export function SwarmControls({
  engine,
  autoScroll,
  position = "bottom-right",
  defaultOpen = false,
  children,
}: SwarmControlsProps) {
  const [open, setOpen] = useState(() => {
    const saved = readSwarmSettings();
    return typeof saved.open === "boolean" ? saved.open : defaultOpen;
  });
  const [, setForce] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const refresh = () => setForce((n) => n + 1);

  const toggleOpen = (nextOpen: boolean | ((prev: boolean) => boolean)) => {
    setOpen((prev) => {
      const resolved = typeof nextOpen === "function" ? nextOpen(prev) : nextOpen;
      writeSwarmSettings({ open: resolved });
      return resolved;
    });
  };

  useEffect(() => {
    const saved = readSwarmSettings();
    if (
      saved.scrollMode === "manual" ||
      saved.scrollMode === "auto" ||
      saved.scrollMode === "hybrid"
    ) {
      autoScroll.setMode(saved.scrollMode);
    }
    if (typeof saved.tempoMultiplier === "number" && saved.tempoMultiplier > 0) {
      engine.setTempoMultiplier(saved.tempoMultiplier);
    }
    if (typeof saved.rulers === "boolean") {
      engine.rulers.want = saved.rulers ? 1 : 0;
      engine.rulers.lastNeed = saved.rulers ? engine.time : -10;
    }
    if (typeof saved.paused === "boolean") {
      engine.paused = saved.paused;
    }
    refresh();
  }, [engine, autoScroll]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        toggleOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleOpen(false);
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
            onClick={() => toggleOpen(false)}
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
                if (!engine.started) {
                  engine.start();
                  engine.paused = false;
                } else if (engine.paused) {
                  engine.resume();
                } else {
                  engine.pause();
                }
                writeSwarmSettings({ paused: engine.paused });
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
                engine.paused = false;
                writeSwarmSettings({ paused: false });
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
                  writeSwarmSettings({ scrollMode: m.value });
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
                  writeSwarmSettings({ tempoMultiplier: t });
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
              writeSwarmSettings({ rulers: engine.rulers.want > 0 });
              refresh();
            }}
          >
            {engine.rulers.want > 0 ? "On" : "Off"}
          </button>
        </div>

        {children && <div className="swarm-tp-extra">{children}</div>}
      </div>

      {/* Corner Trigger Button (Pure Liquid Glass Theme SVG Cursor Icon) */}
      <button
        type="button"
        className="swarm-turbopack-trigger"
        onClick={() => toggleOpen((v) => !v)}
        aria-expanded={open}
        title="SwarmCursor Settings"
      >
        <span
          className={`swarm-tp-trigger-dot${isBuilding ? " is-active" : ""}`}
        />
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="swarm-tp-cursor-grad"
              x1="3"
              y1="3"
              x2="21"
              y2="21"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="55%" stopColor="#6D5DF6" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient
              id="swarm-tp-spark-grad"
              x1="14"
              y1="2"
              x2="22"
              y2="10"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
          <path
            d="M4.2 3.6C3.75 2.72 4.62 1.85 5.5 2.3L19.85 9.15C20.82 9.61 20.68 11.03 19.63 11.29L13.45 12.82C12.92 12.95 12.5 13.37 12.37 13.9L10.84 20.08C10.58 21.13 9.16 21.27 8.7 20.3L4.2 3.6Z"
            fill="url(#swarm-tp-cursor-grad)"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M6.4 5.5L16.2 10.15L12.1 11.2L6.4 5.5Z"
            fill="#FFFFFF"
            fillOpacity="0.35"
          />
          <path
            d="M18 2.5L18.85 4.95L21.3 5.8L18.85 6.65L18 9.1L17.15 6.65L14.7 5.8L17.15 4.95L18 2.5Z"
            fill="url(#swarm-tp-spark-grad)"
          />
        </svg>
        <span className="swarm-tp-trigger-count">{engine.cursors.length}</span>
      </button>
    </div>
  );
}
