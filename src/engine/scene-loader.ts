import {
  AGENT_COLORS,
  AGENT_NAMES,
} from "../core/constants";
import { buildSwarmLandingScene } from "../presets/swarm-landing";
import type {
  Point2D,
  SwarmCursor,
  SwarmElementNode,
  SwarmEngineOptions,
  SwarmTask,
} from "../core/types";
import type { SwarmEngine } from "./SwarmEngine";

export const rand = (min: number, max: number): number =>
  min + Math.random() * (max - min);

export const bumpVersion = (el: SwarmElementNode): void => {
  el.v++;
};

export function createSwarmCursor(
  id: number,
  x: number,
  y: number,
  home: Point2D | null = null
): SwarmCursor {
  const isFast = Math.random() < 0.25;
  return {
    id,
    x,
    y,
    home,
    name: AGENT_NAMES[id % AGENT_NAMES.length],
    color: AGENT_COLORS[id % AGENT_COLORS.length],
    shape: "arrow",
    press: 0,
    task: null,
    gen: null,
    ov: null,
    idleFor: 0,
    leaving: false,
    worked: false,
    sticky: false,
    vx: 0,
    vy: 0,
    angle: 0,
    ...(isFast
      ? {
          speed: rand(1000, 1500),
          force: rand(3500, 6000),
          spin: rand(2.2, 3.4),
        }
      : {
          speed: rand(300, 750),
          force: rand(700, 1800),
          spin: rand(0.8, 1.8),
        }),
    curl: rand(-1, 1),
    ph: rand(0, Math.PI * 2),
    orbit: rand(70, 170),
    follow: false,
  };
}

export function hydrateEngineScene(
  engine: SwarmEngine,
  options: SwarmEngineOptions,
  initialCursorsCount: number,
  minCursorsCount: number
): void {
  engine.els.clear();
  engine.list = [];
  engine.tasks = [];
  engine.byTask.clear();
  engine.groups.clear();
  engine.cursors = [];
  engine.guideDeps.clear();
  engine.squadCoordinator?.clear();
  engine.started = false;
  engine.flocking = false;
  engine.done = false;
  engine.frontier = 0;
  engine.vel = 0;
  engine.time = 0;
  engine.retiredWorkers = 0;
  engine.rulers = { want: 0, t: 0, lastNeed: -10 };

  const getWorkerCount = () =>
    engine.cursors.filter((c) => c.worked).length + engine.retiredWorkers;

  const scene =
    typeof options.scene === "function"
      ? options.scene(getWorkerCount)
      : options.scene ?? buildSwarmLandingScene(getWorkerCount);

  engine.height = scene.height;
  if (scene.width) engine.designWidth = scene.width;

  for (const el of scene.els) {
    const copy = { ...el, v: 0, vis: false, dx: 0, dy: 0 } as SwarmElementNode;
    if (copy.kind === "text") {
      copy.shown = "";
      copy.editing = false;
      copy.selAll = false;
      copy.size = copy.st.size;
    } else if (copy.kind === "rect") {
      copy.draw = null;
      copy.styled = false;
    } else if (copy.kind === "path") {
      copy.placed = 0;
      copy.shut = false;
      copy.edit = false;
      copy.owner = null;
      copy.fillOn = false;
    } else if (copy.kind === "guide") {
      copy.cur = copy.pos;
      copy.op = 1;
      copy.flash = 0;
      copy.dragging = false;
    } else if (copy.kind === "3d") {
      copy.progress = 0;
      copy.phase = "idle";
    }
    engine.els.set(copy.id, copy);
    engine.list.push(copy);
  }

  for (const task of scene.tasks) {
    const taskState: Required<SwarmTask> = {
      ...task,
      state: "wait",
      doneAt: 0,
    };
    engine.tasks.push(taskState);
    engine.byTask.set(task.id, taskState);
    if (task.spec.type === "text" && task.spec.snap) {
      const list = engine.guideDeps.get(task.spec.snap) ?? [];
      list.push(taskState);
      engine.guideDeps.set(task.spec.snap, list);
    }
  }

  for (const group of scene.groups) {
    engine.groups.set(group.id, group);
  }

  for (let i = 0; i < initialCursorsCount; i++) {
    const angle = (i / initialCursorsCount) * Math.PI * 2;
    const cursor = engine.makeCursor(
      engine.designWidth / 2 + Math.cos(angle) * 160,
      400 + Math.sin(angle) * 160,
      i < minCursorsCount ? { x: 0, y: 0 } : null
    );
    cursor.follow = true;
    engine.cursors.push(cursor);
  }
}
