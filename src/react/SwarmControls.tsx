import React, { useState } from "react";
import type { AutoScrollController } from "../core/autoscroll";
import type { SwarmEngine } from "../core/engine";
import type { ScrollMode } from "../core/types";

export interface SwarmControlsProps {
  engine: SwarmEngine;
  autoScroll: AutoScrollController;
  position?: "bottom-right" | "bottom-left" | "top-right";
}

export function SwarmControls({
  engine,
  autoScroll,
  position = "bottom-right",
}: SwarmControlsProps) {
  const [, setForce] = useState(0);
  const refresh = () => setForce((n) => n + 1);

  const doneCount = engine.tasks.filter((t) => t.state === "done").length;
  const totalCount = engine.tasks.length;

  return (
    <div className={`swarm-controls ${position}`}>
      <button
        type="button"
        onClick={() => {
          if (!engine.started) engine.start();
          else if (engine.paused) engine.resume();
          else engine.pause();
          refresh();
        }}
      >
        {!engine.started ? "Start" : engine.paused ? "Resume" : "Pause"}
      </button>

      <button
        type="button"
        onClick={() => {
          engine.reset();
          if (typeof window !== "undefined") window.scrollTo(0, 0);
          refresh();
        }}
      >
        Reset
      </button>

      <select
        value={autoScroll.mode}
        onChange={(e) => {
          autoScroll.setMode(e.target.value as ScrollMode);
          refresh();
        }}
        aria-label="Scroll Mode"
      >
        <option value="manual">Scroll: Manual</option>
        <option value="auto">Scroll: Auto</option>
        <option value="hybrid">Scroll: Hybrid</option>
      </select>

      <select
        value={String(engine.tempoMultiplier)}
        onChange={(e) => {
          engine.setTempoMultiplier(parseFloat(e.target.value));
          refresh();
        }}
        aria-label="Tempo Speed"
      >
        <option value="0.5">0.5×</option>
        <option value="1">1.0×</option>
        <option value="2">2.0×</option>
        <option value="4">4.0×</option>
      </select>

      <button
        type="button"
        onClick={() => {
          engine.rulers.want = engine.rulers.want > 0 ? 0 : 1;
          engine.rulers.lastNeed = engine.rulers.want > 0 ? engine.time : -10;
          refresh();
        }}
      >
        Rulers
      </button>

      <span className="swarm-controls-stat">
        {engine.cursors.length} agents · {doneCount}/{totalCount}
      </span>
    </div>
  );
}
