import type {
  Swarm3DEl,
  SwarmCursor,
  SwarmElementNode,
  SwarmRectEl,
  SwarmTask,
  SwarmTextEl,
} from "../core/types";
import type { SwarmEngine } from "./SwarmEngine";

export function isTaskDependencySatisfied(
  engine: SwarmEngine,
  depId: string
): boolean {
  const depTask = engine.byTask.get(depId);
  if (!depTask) return true;
  if (depTask.state === "done") return true;
  // Early pipeline unlock: when a parent task has reached >= 35% progress,
  // unlock dependent tasks so the cursor swarm builds in parallel!
  if (depTask.state === "active") {
    if (depTask.spec.type === "rect") {
      const rectEl = engine.els.get(depTask.spec.el) as SwarmRectEl | undefined;
      if (rectEl && rectEl.vis) {
        if (rectEl.styled || !rectEl.draw) return true;
        const ratio = Math.min(
          rectEl.draw.w / Math.max(1, rectEl.w),
          rectEl.draw.h / Math.max(1, rectEl.h)
        );
        if (ratio >= 0.35) return true;
      }
    } else if (depTask.spec.type === "text") {
      const textEl = engine.els.get(depTask.spec.el) as SwarmTextEl | undefined;
      if (textEl && textEl.vis) {
        if (!textEl.editing) return true;
        if (textEl.shown.length / Math.max(1, textEl.text.length) >= 0.35) {
          return true;
        }
      }
    } else if (depTask.spec.type === "3d") {
      const threeEl = engine.els.get(depTask.spec.el) as Swarm3DEl | undefined;
      if (threeEl && threeEl.vis && threeEl.progress >= 0.35) {
        return true;
      }
    }
  }
  return false;
}

export function getAvailableTasks(
  engine: SwarmEngine
): Array<Required<SwarmTask>> {
  const out: Array<Required<SwarmTask>> = [];
  for (const t of engine.tasks) {
    if (t.state !== "wait" || t.y > engine.frontier) continue;
    if (t.deps.every((depId) => isTaskDependencySatisfied(engine, depId))) {
      out.push(t);
    }
  }
  return out;
}

export function pickBestTaskForCursor(
  engine: SwarmEngine,
  cursor: SwarmCursor,
  avail: Array<Required<SwarmTask>>
): Required<SwarmTask> | null {
  let best: Required<SwarmTask> | null = null;
  let bestScore = Infinity;
  const top = engine.viewTop - 40;
  const bot = engine.viewBot;

  for (const task of avail) {
    const bucket = task.y >= top && task.y <= bot ? 0 : task.y < top ? 1 : 2;
    const score =
      bucket * 1e6 +
      (bucket === 1 ? top - task.y : task.y) * 0.6 +
      Math.abs(task.y - cursor.y) * 0.4;
    if (score < bestScore) {
      bestScore = score;
      best = task;
    }
  }
  return best;
}

export function notifyTaskCompleted(
  engine: SwarmEngine,
  task: Required<SwarmTask>,
  onElementDone?: (el: SwarmElementNode) => void
): void {
  const spec = task.spec;
  if ("el" in spec) {
    const el = engine.els.get(spec.el);
    if (el) {
      if (el.domEl) {
        el.domEl.setAttribute("data-swarm-done", "true");
      }
      onElementDone?.(el);
    }
  } else if (spec.type === "dup") {
    const group = engine.groups.get(spec.group);
    const copy = group?.copies[spec.k];
    copy?.ids.forEach((id) => {
      const el = engine.els.get(id);
      if (el) {
        el.dx = 0;
        el.dy = 0;
        const pendingEdit = engine.byTask.get(`e:${id}`);
        if (el.domEl && (!pendingEdit || pendingEdit.state === "done")) {
          el.domEl.setAttribute("data-swarm-done", "true");
        }
        onElementDone?.(el);
      }
    });
  }
}
