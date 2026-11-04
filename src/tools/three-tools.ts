import { bumpVersion, type SwarmEngine } from "../core/engine";
import type {
  Gizmo3DOverlayItem,
  Laser3DOverlayItem,
  Point2D,
  Swarm3DEl,
  SwarmCursor,
  SwarmOverlayItem,
  SwarmTask,
} from "../core/types";
import {
  compute3DPhaseWeights,
  computeScreen3DAnchors,
  getSwarm3DHandle,
} from "../three";
import { defaultToolRegistry, type SwarmToolPlugin } from "./registry";

function resolve3DAnchors(engine: SwarmEngine, el: Swarm3DEl) {
  const handle = getSwarm3DHandle(el.id);
  if (handle) {
    return handle.getScreenAnchors(engine.vp);
  }
  const rect = {
    left: engine.vp.left + (el.x + el.dx) * engine.vp.s,
    top: (el.y + el.dy) * engine.vp.s - engine.vp.scrollY,
    width: el.w * engine.vp.s,
    height: el.h * engine.vp.s,
  };
  const weights = compute3DPhaseWeights(el.buildMode, el.progress);
  return computeScreen3DAnchors(
    rect,
    engine.vp,
    { min: [-1.5, -1.5, -1.5], max: [1.5, 1.5, 1.5] },
    el.progress,
    Math.max(0.08, weights.extrude)
  );
}

function update3DProgress(el: Swarm3DEl, progress: number): void {
  const clamped = Math.max(0, Math.min(1, progress));
  el.progress = clamped;
  const weights = compute3DPhaseWeights(el.buildMode, clamped);
  el.phase = weights.activePhase;
  const handle = getSwarm3DHandle(el.id);
  if (handle) {
    handle.setProgress(clamped);
  }
  if (el.domEl) {
    el.domEl.setAttribute("data-swarm-3d-phase", el.phase);
    el.domEl.style.setProperty("--swarm-3d-progress", clamped.toFixed(3));
    el.domEl.style.setProperty("--swarm-3d-extrude", weights.extrude.toFixed(3));
    el.domEl.style.setProperty(
      "--swarm-3d-particles",
      weights.particles.toFixed(3)
    );
    el.domEl.style.setProperty("--swarm-3d-slice", weights.slice.toFixed(3));
  }
  bumpVersion(el);
}

/**
 * Lead Cursor Coroutine for 3D / GLB / Three.js Construction:
 * Orchestrates 3 stages:
 *   1. `extrude` (Wireframe Bounding Box & Y/Z Gizmo Sculpt)
 *   2. `particles` (MeshSurfaceSampler GPU Particle Swarm Welding)
 *   3. `slice` (Holographic 3D Printing Laser Slice Scan)
 */
export function* run3DLeadCoroutine(
  engine: SwarmEngine,
  cursor: SwarmCursor,
  el: Swarm3DEl
): Generator<void, void, number> {
  el.vis = true;
  update3DProgress(el, 0.02);

  const initialAnchors = resolve3DAnchors(engine, el);
  cursor.shape = "cross";
  yield* engine.moveTo(cursor, initialAnchors.boxCorners[0], { speed: 1.2 });
  yield* engine.click(cursor);

  cursor.ov = (): SwarmOverlayItem[] => {
    const anchors = resolve3DAnchors(engine, el);
    const gizmo: Gizmo3DOverlayItem = {
      t: "gizmo3d",
      corners: anchors.boxCorners,
      origin: anchors.origin,
      axes: anchors.axes,
      progress: el.progress,
      phase: el.phase,
      badge: `3D·${el.phase.toUpperCase()} ${Math.round(el.progress * 100)}%`,
    };
    const items: SwarmOverlayItem[] = [gizmo];
    if (el.phase === "slice" || el.phase === "particles") {
      const laser: Laser3DOverlayItem = {
        t: "laser3d",
        leftPt: anchors.laserLeft,
        rightPt: anchors.laserRight,
        cursorPt: { x: cursor.x, y: cursor.y },
        progress: el.progress,
        mode: el.phase === "slice" ? "slice" : "particles",
      };
      items.push(laser);
    }
    return items;
  };

  // Phase 1: 3D Gizmo Extrude (0.02 -> 0.32)
  cursor.shape = "ns";
  cursor.press = 1;
  let p = 0.02;
  while (p < 0.32) {
    const dt = yield;
    p = Math.min(0.32, p + (dt ?? 0.016) * engine.tempo * 0.42);
    update3DProgress(el, p);
    const anchors = resolve3DAnchors(engine, el);
    cursor.x = anchors.axes.y.x;
    cursor.y = anchors.axes.y.y;
    cursor.press = 1;
  }

  // Phase 2: GPU Particle Swarm Surface Welding (0.32 -> 0.65)
  cursor.shape = "pen-add";
  while (p < 0.65) {
    const dt = yield;
    p = Math.min(0.65, p + (dt ?? 0.016) * engine.tempo * 0.38);
    update3DProgress(el, p);
    const anchors = resolve3DAnchors(engine, el);
    const wp = anchors.surfaceWaypoints[0] ?? anchors.origin;
    cursor.x += (wp.x - cursor.x) * 0.22;
    cursor.y += (wp.y - cursor.y) * 0.22;
    cursor.press = 0.6;
  }

  // Phase 3: Holographic Laser Slice Print (0.65 -> 1.0)
  cursor.shape = "ew";
  while (p < 1.0) {
    const dt = yield;
    p = Math.min(1.0, p + (dt ?? 0.016) * engine.tempo * 0.42);
    update3DProgress(el, p);
    const anchors = resolve3DAnchors(engine, el);
    cursor.x = anchors.laserLeft.x;
    cursor.y = anchors.laserLeft.y;
    cursor.press = 1;
  }

  update3DProgress(el, 1.0);
  cursor.shape = "arrow";
  cursor.ov = null;
}

/**
 * Assistant Cursor Coroutine for Multi-Agent Squad Collaboration on a 3D Element:
 * Works simultaneously alongside the Lead Cursor (holding opposite gizmo axes,
 * emitting surface particles from different angles, and holding the right laser head).
 */
export function* run3DAssistantCoroutine(
  engine: SwarmEngine,
  cursor: SwarmCursor,
  el: Swarm3DEl,
  slotIdx: number
): Generator<void, void, number> {
  cursor.shape = slotIdx % 2 === 1 ? "ew" : "pen";

  cursor.ov = (): SwarmOverlayItem[] => {
    if (el.progress >= 1) return [];
    const anchors = resolve3DAnchors(engine, el);
    const laser: Laser3DOverlayItem = {
      t: "laser3d",
      leftPt: anchors.laserLeft,
      rightPt: anchors.laserRight,
      cursorPt: { x: cursor.x, y: cursor.y },
      progress: el.progress,
      mode: el.phase === "slice" ? "slice" : "particles",
    };
    return [laser];
  };

  while (el.progress < 0.98 && el.phase !== "done") {
    const dt = yield;
    const stepDt = dt ?? 0.016;
    const anchors = resolve3DAnchors(engine, el);
    let target: Point2D;
    if (el.phase === "extrude") {
      cursor.shape = "ew";
      target = slotIdx % 2 === 1 ? anchors.axes.x : anchors.axes.z;
    } else if (el.phase === "particles") {
      cursor.shape = "pen-add";
      const wpIdx = slotIdx % Math.max(1, anchors.surfaceWaypoints.length);
      target = anchors.surfaceWaypoints[wpIdx] ?? anchors.origin;
    } else {
      cursor.shape = "ew";
      target = anchors.laserRight;
    }

    cursor.x += (target.x - cursor.x) * Math.min(1, stepDt * 9);
    cursor.y += (target.y - cursor.y) * Math.min(1, stepDt * 9);
    cursor.press = 0.85;
  }

  cursor.ov = null;
  cursor.shape = "arrow";
}

export const threeBuildToolPlugin: SwarmToolPlugin = {
  type: "3d",
  runLead(engine, cursor, task) {
    const el = engine.els.get(
      (task.spec as { type: "3d"; el: string }).el
    ) as Swarm3DEl;
    return run3DLeadCoroutine(engine, cursor, el);
  },
  runAssistant(engine, cursor, task, slotIdx) {
    const el = engine.els.get(
      (task.spec as { type: "3d"; el: string }).el
    ) as Swarm3DEl;
    return run3DAssistantCoroutine(engine, cursor, el, slotIdx);
  },
};

defaultToolRegistry.register(threeBuildToolPlugin);
