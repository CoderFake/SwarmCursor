import { clamp } from "../core/physics";
import type { Point2D, SwarmCursor, SwarmTextEl } from "../core/types";
import { bumpVersion, rand } from "./scene-loader";
import type { SwarmEngine } from "./SwarmEngine";

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export function* waitCoroutine(
  engine: SwarmEngine,
  seconds: number
): Generator<void, void, number> {
  let elapsed = 0;
  while (elapsed < seconds) {
    const dt = yield;
    elapsed += (dt ?? 0.016) * engine.tempo;
  }
}

export function* moveToCoroutine(
  engine: SwarmEngine,
  cursor: SwarmCursor,
  targetOrFn: Point2D | (() => Point2D),
  opts: {
    speed?: number;
    drag?: boolean;
    bend?: number;
    onStep?: () => void;
  } = {}
): Generator<void, void, number> {
  const getTarget =
    typeof targetOrFn === "function" ? targetOrFn : () => targetOrFn;
  const startX = cursor.x;
  const startY = cursor.y;
  const initialTarget = getTarget();
  const dist = Math.hypot(initialTarget.x - startX, initialTarget.y - startY);

  if (dist < 0.5) {
    cursor.x = initialTarget.x;
    cursor.y = initialTarget.y;
    opts.onStep?.();
    return;
  }

  const duration =
    clamp(0.06 + Math.sqrt(dist) * 0.011, 0.07, 0.42) / (opts.speed ?? 1);
  const arcBend =
    (opts.bend ?? (Math.random() < 0.5 ? -1 : 1) * rand(0.04, 0.14)) *
    Math.min(dist, 600);

  let elapsed = 0;
  while (elapsed < duration) {
    const dt = yield;
    elapsed += (dt ?? 0.016) * engine.tempo;
    const progress = Math.min(1, elapsed / duration);
    const eased =
      opts.drag || progress < 0.15
        ? easeInOutCubic(progress)
        : easeOutCubic(progress);
    const target = getTarget();
    const dx = target.x - startX;
    const dy = target.y - startY;
    const len = Math.hypot(dx, dy) || 1;
    const normalOffset = Math.sin(Math.PI * eased) * arcBend;
    cursor.x = startX + dx * eased + (-dy / len) * normalOffset;
    cursor.y = startY + dy * eased + (dx / len) * normalOffset;
    opts.onStep?.();
  }

  const finalTarget = getTarget();
  cursor.x = finalTarget.x;
  cursor.y = finalTarget.y;
  opts.onStep?.();
}

export function* clickCoroutine(
  engine: SwarmEngine,
  cursor: SwarmCursor
): Generator<void, void, number> {
  cursor.press = 1;
  yield* engine.wait(0.07);
}

export function* typeTextCoroutine(
  engine: SwarmEngine,
  el: SwarmTextEl,
  str: string,
  replaceAll = false
): Generator<void, void, number> {
  for (let i = 0; i < str.length; i++) {
    if (i === 0 && replaceAll) el.shown = "";
    el.shown += str[i];
    el.selAll = false;
    bumpVersion(el);
    let delay = rand(0.012, 0.04);
    if (str[i] === " ") delay += rand(0, 0.03);
    if (str[i] === "\n") delay += 0.1;
    if (Math.random() < 0.025) delay += rand(0.08, 0.2);
    yield* engine.wait(delay);
  }
}

export function* idleCoroutine(
  engine: SwarmEngine,
  cursor: SwarmCursor
): Generator<void, void, number> {
  if (!engine.started && cursor.home) {
    const home = cursor.home;
    const phase = rand(0, 6);
    while (!engine.started) {
      const t = engine.time;
      cursor.x = home.x + Math.sin(t * 1.3 + phase) * 3;
      cursor.y = home.y + Math.cos(t * 1.7 + phase) * 2.5;
      yield;
    }
  }
  for (;;) {
    const top = engine.viewTop;
    const bot = engine.viewBot;
    const dest = {
      x: rand(220, 1060),
      y: rand(top + (bot - top) * 0.2, top + (bot - top) * 0.8),
    };
    yield* engine.moveTo(cursor, dest, { speed: 0.35 });
    let pause = rand(0.4, 1.4);
    while (pause > 0) {
      const dt = yield;
      pause -= dt ?? 0.016;
      if (cursor.y < engine.viewTop || cursor.y > engine.viewBot) break;
    }
  }
}

export function* leaveCoroutine(
  engine: SwarmEngine,
  cursor: SwarmCursor
): Generator<void, void, number> {
  const exitRight = cursor.x > engine.designWidth / 2;
  yield* engine.moveTo(
    cursor,
    () =>
      engine.fromViewport(
        exitRight ? engine.vp.vw + 60 : -60,
        (cursor.y - engine.viewTop) * engine.vp.s
      ),
    { speed: 0.8 }
  );
}
