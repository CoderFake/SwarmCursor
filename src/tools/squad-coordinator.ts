import type { SwarmEngine } from "../engine/SwarmEngine";
import type {
  Swarm3DEl,
  SwarmCursor,
  SwarmRectEl,
  SwarmTask,
} from "../core/types";
import { defaultToolRegistry } from "./registry";
import "./three-tools";

/**
 * Coordinates Multi-Agent Squads ("Đa thao tác"):
 * When idle cursors have no unstarted ready tasks, they join active `3d` or large
 * `rect` tasks as Assistant Cursors so 2–6 cursors collaborate simultaneously.
 */
export class SquadCoordinator {
  private activeAssistants = new Map<string, number>();

  public clear(): void {
    this.activeAssistants.clear();
  }

  public getMaxSquadSize(engine: SwarmEngine, task: Required<SwarmTask>): number {
    if (task.spec.type === "3d") {
      const el = engine.els.get(task.spec.el) as Swarm3DEl | undefined;
      return Math.max(2, task.spec.squadSize ?? el?.squadSize ?? 4);
    }
    if (task.spec.type === "rect") {
      const el = engine.els.get(task.spec.el) as SwarmRectEl | undefined;
      if (el && el.w * el.h >= 40000) {
        return 2;
      }
    }
    return 1;
  }

  public tryAssignAssistant(
    engine: SwarmEngine,
    cursor: SwarmCursor
  ): boolean {
    for (const task of engine.tasks) {
      if (task.state !== "active") continue;
      const maxSquad = this.getMaxSquadSize(engine, task);
      if (maxSquad <= 1) continue;

      const currentWorkers = engine.cursors.filter(
        (c) => c.task?.id === task.id
      ).length;
      if (currentWorkers >= maxSquad) continue;

      const slotIdx = currentWorkers;
      const plugin = defaultToolRegistry.get(task.spec.type);
      if (plugin?.runAssistant) {
        cursor.task = task;
        cursor.worked = true;
        cursor.idleFor = 0;
        cursor.gen = plugin.runAssistant(engine, cursor, task, slotIdx);
        return true;
      }

      if (task.spec.type === "rect") {
        const el = engine.els.get(task.spec.el) as SwarmRectEl | undefined;
        if (el) {
          cursor.task = task;
          cursor.worked = true;
          cursor.idleFor = 0;
          cursor.gen = this.runRectAssistant(engine, cursor, el);
          return true;
        }
      }
    }
    return false;
  }

  private *runRectAssistant(
    engine: SwarmEngine,
    cursor: SwarmCursor,
    el: SwarmRectEl
  ): Generator<void, void, number> {
    cursor.shape = "pen";
    yield* engine.moveTo(cursor, () => ({ x: el.x + el.w, y: el.y }), {
      speed: 1.2,
    });
    while (el.vis && !el.styled) {
      yield;
      cursor.x = el.x + (el.draw?.w ?? el.w);
      cursor.y = el.y;
      cursor.press = 0.8;
    }
    cursor.shape = "arrow";
  }
}
