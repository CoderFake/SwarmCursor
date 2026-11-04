import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  type AgentIconId,
  type AgentIconSpec,
  createInitialIconQueue,
  getAgentIconPool,
  pickRandomAgentIcon,
} from "../core/agent-icons";
import { FLOCK_TARGET_CURSORS } from "../core/constants";
import type { SwarmEngine } from "../core/engine";

export interface SwarmAgentPillProps {
  /** Optional SwarmEngine instance to sync live agent count and tempo */
  engine?: SwarmEngine;
  /** Explicit agent count to display (defaults to engine.cursors.length or 36) */
  count?: number;
  /** Custom label or formatter function (defaults to `{N} agents`) */
  label?: string | ((count: number) => string);
  /** Maximum visible icons in the queue (hard-capped at 5, default: 5) */
  maxIcons?: number;
  /** Interval in ms between random queue pushes from left to right (default: 650) */
  intervalMs?: number;
  /** Optional subset of AI icon IDs to sample from */
  icons?: AgentIconId[];
  /** Bottom-bar position or inline layout (default: "bottom-center") */
  position?: "bottom-center" | "bottom-left" | "bottom-right" | "inline";
  /** Automatically hide the pill once all engine tasks finish, and re-open on reset/reload (default: true) */
  hideWhenDone?: boolean;
  /** Pause random queue shifting */
  paused?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Figma-style bottom-bar pill displaying up to 5 overlapping circular AI agent icons
 * that continuously shift from left to right like a working agent queue,
 * paired with `{N} agents`.
 */
export function SwarmAgentPill({
  engine,
  count,
  label,
  maxIcons = 5,
  intervalMs = 650,
  icons,
  position = "bottom-center",
  hideWhenDone = true,
  paused = false,
  className,
  style,
}: SwarmAgentPillProps) {
  const clampedMax = Math.max(1, Math.min(5, maxIcons));
  const pool = useMemo(() => getAgentIconPool(icons), [icons]);
  const nextKeyRef = useRef(clampedMax + 1);

  const isDone = Boolean(
    hideWhenDone &&
      engine &&
      engine.tasks.length > 0 &&
      (engine.flocking || engine.tasks.every((t) => t.state === "done"))
  );

  const [queueState, setQueueState] = useState<{
    step: number;
    items: Array<{ key: number; icon: AgentIconSpec }>;
  }>(() => ({
    step: 0,
    items: createInitialIconQueue(clampedMax, pool),
  }));

  useEffect(() => {
    setQueueState((prev) => ({
      step: prev.step,
      items: prev.items.slice(0, clampedMax),
    }));
  }, [clampedMax]);

  useEffect(() => {
    if (typeof window === "undefined" || paused || isDone) return;
    const tempo = Math.max(0.25, engine?.tempoMultiplier ?? 1);
    const delay = Math.max(120, Math.round(intervalMs / tempo));

    const timer = window.setInterval(() => {
      if (engine?.paused) return;
      if (
        hideWhenDone &&
        engine &&
        engine.tasks.length > 0 &&
        (engine.flocking || engine.tasks.every((t) => t.state === "done"))
      ) {
        return;
      }
      setQueueState((prev) => {
        const currentHeadId = prev.items[0]?.icon.id;
        const nextIcon = pickRandomAgentIcon(pool, currentHeadId);
        const key = nextKeyRef.current++;
        return {
          step: prev.step + 1,
          items: [{ key, icon: nextIcon }, ...prev.items.slice(0, clampedMax - 1)],
        };
      });
    }, delay);

    return () => window.clearInterval(timer);
  }, [pool, clampedMax, intervalMs, paused, isDone, hideWhenDone, engine]);

  const resolvedCount = count ?? engine?.cursors.length ?? FLOCK_TARGET_CURSORS;
  const formattedLabel =
    typeof label === "function"
      ? label(resolvedCount)
      : typeof label === "string"
        ? label
        : `${resolvedCount} agents`;

  const visibleItems = queueState.items.slice(0, clampedMax);
  const shiftClass = queueState.step % 2 === 0 ? "is-shifting-a" : "is-shifting-b";
  const doneClass = isDone ? " is-done" : "";

  return (
    <div
      className={
        className
          ? `swarm-agent-pill ${position}${doneClass} ${className}`
          : `swarm-agent-pill ${position}${doneClass}`
      }
      style={style}
      role="status"
      aria-live="polite"
      aria-hidden={isDone}
    >
      <div className="swarm-agent-stack" aria-hidden="true">
        {visibleItems.map((entry, idx) => {
          const animClass =
            queueState.step === 0
              ? ""
              : idx === 0
                ? "is-entering"
                : shiftClass;
          return (
            <span
              key={entry.key}
              className={
                animClass
                  ? `swarm-agent-avatar ${animClass}`
                  : "swarm-agent-avatar"
              }
              title={entry.icon.name}
              style={{
                backgroundColor: entry.icon.avatarBg,
                zIndex: clampedMax - idx,
              }}
            >
              <svg
                viewBox={entry.icon.viewBox}
                xmlns="http://www.w3.org/2000/svg"
                dangerouslySetInnerHTML={{ __html: entry.icon.svgBody }}
              />
            </span>
          );
        })}
      </div>
      <span className="swarm-agent-pill-label">{formattedLabel}</span>
    </div>
  );
}
