import React, { useEffect, useRef, useState } from "react";
import { FLOCK_TARGET_CURSORS } from "../core/constants";
import { SwarmEngine } from "../core/engine";
import { CursorView } from "./CursorSvg";
import { SwarmAgentPill, type SwarmAgentPillProps } from "./SwarmAgentPill";

export interface SwarmFollowerProps {
  /** Number of cursors in the swirling flock (default: 36) */
  count?: number;
  /** Orbit radius scale (default: 1, which is ~135px radius) */
  radiusScale?: number;
  /** Tempo / speed multiplier (default: 1) */
  tempoMultiplier?: number;
  /** Show agent name labels next to cursors (default: false) */
  showLabels?: boolean;
  /** Opt-in bottom-bar AI agent queue pill (`{N} agents`). Off by default unless declared. */
  agentPill?: boolean | Omit<SwarmAgentPillProps, "engine">;
  /** Z-index of the fixed overlay layer (default: 40) */
  zIndex?: number;
  className?: string;
}

/**
 * Standalone multi-cursor flock component that chases the user's mouse
 * when moving and orbits/swirls in a circle around the pointer when stopped.
 * When the pointer leaves the window, the flock drifts in a figure-8 lissajous curve.
 */
export function SwarmFollower({
  count = FLOCK_TARGET_CURSORS,
  radiusScale = 1,
  tempoMultiplier = 1,
  showLabels = false,
  agentPill = false,
  zIndex = 40,
  className,
}: SwarmFollowerProps) {
  const engineRef = useRef<SwarmEngine | null>(null);
  if (!engineRef.current) {
    const eng = new SwarmEngine({
      initialCursors: count,
      flockCursors: count,
      tempoMultiplier,
      scene: { els: [], tasks: [], groups: [], height: 800, width: 1280 },
    });
    eng.started = true;
    eng.flocking = true;
    for (const c of eng.cursors) {
      c.follow = true;
    }
    engineRef.current = eng;
  }

  const [, setTick] = useState(0);
  const engine = engineRef.current;

  useEffect(() => {
    engine.setTempoMultiplier(tempoMultiplier);
  }, [engine, tempoMultiplier]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateViewport = () => {
      engine.vp.vw = window.innerWidth || 1280;
      engine.vp.vh = window.innerHeight || 800;
      engine.vp.s = 1;
      engine.vp.left = 0;
      engine.vp.scrollY = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      engine.mouse = { x: e.clientX, y: e.clientY };
    };
    const onPointerLeave = () => {
      engine.mouse = null;
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    let rafId = 0;
    let lastTime = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000) * engine.tempoMultiplier;
      lastTime = now;
      engine.time += dt;
      engine.follow(dt, engine.cursors, undefined, radiusScale);
      setTick((t) => t + 1);
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        onPointerLeave
      );
    };
  }, [engine, radiusScale]);

  return (
    <>
      <div
        className={className ? `cursors ${className}` : "cursors"}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex,
          overflow: "hidden",
        }}
      >
        {engine.cursors.map((c) => (
          <CursorView
            key={c.id}
            c={c}
            X={c.x}
            Y={c.y}
            showLabel={showLabels}
          />
        ))}
      </div>
      {agentPill && (
        <SwarmAgentPill
          engine={engine}
          count={count}
          {...(typeof agentPill === "object" ? agentPill : {})}
        />
      )}
    </>
  );
}
