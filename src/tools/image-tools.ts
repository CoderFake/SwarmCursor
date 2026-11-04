import { bumpVersion, type SwarmEngine } from "../core/engine";
import type {
  ImageBuildOverlayItem,
  SwarmCursor,
  SwarmImageBuildMode,
  SwarmImageEl,
  SwarmOverlayItem,
} from "../core/types";
import { defaultToolRegistry, type SwarmToolPlugin } from "./registry";

export interface ImageBuildPhaseState {
  activePhase: "mosaic" | "scanline" | "halftone";
  pixelBlockSize: number;
  scanlineRatio: number;
  halftoneRadiusScale: number;
  blurPx: number;
}

/**
 * Computes progressive image construction parameters for the 3 researched algorithms:
 * 1. `mosaic`: Progressive Quadtree / Macro-Block Pixelation (32px -> 16px -> 8px -> 4px -> 1px)
 * 2. `scanline`: Holographic CRT / Laser Raster Scanline Sweep (0% -> 100% top-to-bottom)
 * 3. `halftone`: Rotated Dot-Matrix Screen-Printing Expansion
 * 4. `all`: Chains `mosaic` (0..0.45) -> `halftone` (0.45..0.75) -> `scanline` (0.75..1.0)
 */
export function computeImageBuildState(
  mode: SwarmImageBuildMode,
  progress: number
): ImageBuildPhaseState {
  const p = Math.max(0, Math.min(1, progress));

  if (mode === "mosaic") {
    const blockSteps = [32, 16, 8, 4, 2, 1];
    const idx = Math.min(
      blockSteps.length - 1,
      Math.floor(p * blockSteps.length)
    );
    return {
      activePhase: "mosaic",
      pixelBlockSize: blockSteps[idx],
      scanlineRatio: 1,
      halftoneRadiusScale: p,
      blurPx: Math.max(0, (1 - p) * 10),
    };
  }

  if (mode === "scanline") {
    return {
      activePhase: "scanline",
      pixelBlockSize: 1,
      scanlineRatio: p,
      halftoneRadiusScale: 1,
      blurPx: Math.max(0, (1 - p) * 4),
    };
  }

  if (mode === "halftone") {
    return {
      activePhase: "halftone",
      pixelBlockSize: Math.max(1, Math.round((1 - p) * 12)),
      scanlineRatio: 1,
      halftoneRadiusScale: p,
      blurPx: Math.max(0, (1 - p) * 6),
    };
  }

  // Combined "all" mode: Mosaic -> Halftone -> Scanline
  const activePhase =
    p < 0.45 ? "mosaic" : p < 0.75 ? "halftone" : "scanline";
  const blockSize =
    p < 0.45 ? Math.max(4, Math.round(32 * (1 - p / 0.45))) : 1;
  const halftoneScale =
    p < 0.45 ? 0.35 : p < 0.75 ? (p - 0.45) / 0.3 : 1;
  const scanRatio = p < 0.75 ? p : (p - 0.75) / 0.25;

  return {
    activePhase,
    pixelBlockSize: blockSize,
    scanlineRatio: Math.min(1, Math.max(0, scanRatio)),
    halftoneRadiusScale: Math.min(1, Math.max(0.15, halftoneScale)),
    blurPx: Math.max(0, (1 - p) * 8),
  };
}

function updateImageProgress(el: SwarmImageEl, progress: number): void {
  const clamped = Math.max(0, Math.min(1, progress));
  el.progress = clamped;
  const state = computeImageBuildState(el.buildMode, clamped);
  el.phase = clamped >= 1 ? "done" : state.activePhase;

  if (el.domEl) {
    if (clamped < 1) {
      el.domEl.setAttribute("data-swarm-drawing", "true");
    }
    el.domEl.setAttribute("data-swarm-image-phase", el.phase);
    el.domEl.style.setProperty("--swarm-img-progress", clamped.toFixed(3));
    el.domEl.style.setProperty(
      "--swarm-img-pixel-size",
      `${state.pixelBlockSize}px`
    );
    el.domEl.style.setProperty(
      "--swarm-img-scan-y",
      `${(state.scanlineRatio * 100).toFixed(1)}%`
    );
    el.domEl.style.setProperty(
      "--swarm-img-blur",
      `${state.blurPx.toFixed(1)}px`
    );
    el.domEl.style.setProperty(
      "--swarm-draw-op",
      (0.2 + clamped * 0.8).toFixed(2)
    );
    if (el.buildMode === "scanline") {
      el.domEl.style.setProperty(
        "--swarm-clip-b",
        `${((1 - state.scanlineRatio) * 100).toFixed(1)}%`
      );
      el.domEl.style.setProperty("--swarm-clip-r", "0%");
    } else {
      el.domEl.style.setProperty("--swarm-clip-b", "0%");
      el.domEl.style.setProperty("--swarm-clip-r", "0%");
    }
  }
  bumpVersion(el);
}

/**
 * Autonomous Image Construction Coroutine (`mosaic` | `scanline` | `halftone` | `all`):
 * 1. Flies cursor to top-left corner and drags image frame
 * 2. Sweeps across the image while driving progressive Mosaic / Scanline / Halftone synthesis
 */
export function* runImageCoroutine(
  engine: SwarmEngine,
  cursor: SwarmCursor,
  el: SwarmImageEl
): Generator<void, void, number> {
  cursor.shape = "cross";
  yield* engine.moveTo(cursor, { x: el.x, y: el.y }, { speed: 1.5 });
  yield* engine.click(cursor);

  el.vis = true;
  updateImageProgress(el, 0.04);

  cursor.ov = (): SwarmOverlayItem[] => {
    const state = computeImageBuildState(el.buildMode, el.progress);
    const item: ImageBuildOverlayItem = {
      t: "imagebuild",
      b: { x: el.x + el.dx, y: el.y + el.dy, w: el.w, h: el.h },
      progress: el.progress,
      mode: el.buildMode,
      phase: state.activePhase,
      badge: `IMG·${state.activePhase.toUpperCase()} ${Math.round(el.progress * 100)}%`,
    };
    return [item];
  };

  let p = 0.04;
  while (p < 1.0) {
    const dt = yield;
    p = Math.min(1.0, p + (dt ?? 0.016) * engine.tempo * 1.15);
    updateImageProgress(el, p);
    const state = computeImageBuildState(el.buildMode, p);

    if (state.activePhase === "scanline") {
      cursor.shape = "ns";
      cursor.x = el.x + el.w * (0.2 + 0.6 * Math.sin(p * Math.PI * 3));
      cursor.y = el.y + el.h * state.scanlineRatio;
    } else if (state.activePhase === "halftone") {
      cursor.shape = "pen-add";
      cursor.x = el.x + el.w * (0.5 + 0.35 * Math.cos(p * Math.PI * 4));
      cursor.y = el.y + el.h * (0.5 + 0.35 * Math.sin(p * Math.PI * 4));
    } else {
      cursor.shape = "cross";
      cursor.x = el.x + el.w * p;
      cursor.y = el.y + el.h * p;
    }
    cursor.press = 1;
  }

  updateImageProgress(el, 1.0);
  cursor.shape = "arrow";
  yield* engine.wait(0.06);
  cursor.ov = null;
}

export const imageBuildToolPlugin: SwarmToolPlugin = {
  type: "image",
  runLead(engine, cursor, task) {
    const el = engine.els.get(
      (task.spec as { type: "image"; el: string }).el
    ) as SwarmImageEl;
    return runImageCoroutine(engine, cursor, el);
  },
};

defaultToolRegistry.register(imageBuildToolPlugin);
