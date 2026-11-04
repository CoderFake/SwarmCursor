import type { Point2D } from "../core/types";

export interface ScheduledTaskNodeInput {
  id: string;
  y: number;
  anchor: Point2D;
  deps: string[];
  earlyUnlockRatio?: number;
  maxSquadSize?: number;
}

export interface ScheduledTaskNode extends Required<ScheduledTaskNodeInput> {
  inDegree: number;
  dependents: string[];
  progress: number;
  activeWorkers: number;
  state: "locked" | "ready" | "active" | "done";
  unlockedDependents: boolean;
}

export interface TaskAssignmentBid {
  taskId: string;
  role: "lead" | "assistant";
  slotIdx: number;
}

/**
 * Kahn's Topological Sort DAG + Decentralized Spatial Auction & Work-Stealing
 * Scheduler for Multi-Agent Cursor Choreography.
 */
export class DAGTaskScheduler {
  public nodes = new Map<string, ScheduledTaskNode>();
  private pendingDeps = new Map<string, Set<string>>();

  public clear(): void {
    this.nodes.clear();
    this.pendingDeps.clear();
  }

  public addNode(input: ScheduledTaskNodeInput): void {
    const cleanDeps = input.deps.filter((d) => d && d !== input.id);
    const node: ScheduledTaskNode = {
      id: input.id,
      y: input.y,
      anchor: input.anchor,
      deps: cleanDeps,
      earlyUnlockRatio: input.earlyUnlockRatio ?? 0.6,
      maxSquadSize: Math.max(1, input.maxSquadSize ?? 1),
      inDegree: 0,
      dependents: [],
      progress: 0,
      activeWorkers: 0,
      state: "locked",
      unlockedDependents: false,
    };

    this.nodes.set(node.id, node);
    this.recomputeEdges();
  }

  private recomputeEdges(): void {
    for (const node of this.nodes.values()) {
      node.dependents = [];
      node.inDegree = 0;
    }
    for (const node of this.nodes.values()) {
      for (const depId of node.deps) {
        const parent = this.nodes.get(depId);
        if (parent) {
          parent.dependents.push(node.id);
          if (!parent.unlockedDependents && parent.state !== "done") {
            node.inDegree++;
          }
        }
      }
      if (node.state === "locked" && node.inDegree === 0) {
        node.state = "ready";
      }
    }
  }

  /**
   * Updates task progress (0..1). When progress >= earlyUnlockRatio (or 1.0),
   * decrements child in-degrees and returns newly unlocked task IDs.
   */
  public updateProgress(taskId: string, progress: number): string[] {
    const node = this.nodes.get(taskId);
    if (!node) return [];

    node.progress = Math.max(node.progress, Math.min(1, progress));
    const newlyUnlocked: string[] = [];

    if (
      !node.unlockedDependents &&
      node.progress >= node.earlyUnlockRatio
    ) {
      node.unlockedDependents = true;
      for (const childId of node.dependents) {
        const child = this.nodes.get(childId);
        if (!child || child.state !== "locked") continue;
        child.inDegree = Math.max(0, child.inDegree - 1);
        if (child.inDegree === 0) {
          child.state = "ready";
          newlyUnlocked.push(child.id);
        }
      }
    }

    if (node.progress >= 1.0) {
      node.state = "done";
      node.activeWorkers = 0;
    }

    return newlyUnlocked;
  }

  public releaseWorker(taskId: string): void {
    const node = this.nodes.get(taskId);
    if (!node) return;
    node.activeWorkers = Math.max(0, node.activeWorkers - 1);
  }

  /**
   * Phase 1: Assigns ready tasks (lead role) using Euclidean distance + viewport bucket cost.
   * Phase 2 (Work-Stealing): If no unstarted ready task is available, steals an assistant
   * slot on an active multi-agent task (`activeWorkers < maxSquadSize`).
   */
  public auctionNextTask(
    cursorPos: Point2D,
    viewportTop: number,
    viewportBot: number,
    frontierY = Infinity
  ): TaskAssignmentBid | null {
    let bestLead: ScheduledTaskNode | null = null;
    let bestLeadScore = Infinity;

    let bestAssist: ScheduledTaskNode | null = null;
    let bestAssistScore = Infinity;

    for (const node of this.nodes.values()) {
      if (node.y > frontierY) continue;

      const inViewport = node.y >= viewportTop - 60 && node.y <= viewportBot + 60;
      const bucketPenalty = inViewport ? 0 : node.y < viewportTop ? 25000 : 50000;
      const dist = Math.hypot(
        node.anchor.x - cursorPos.x,
        node.anchor.y - cursorPos.y
      );

      if (node.state === "ready" && node.activeWorkers === 0) {
        const score = bucketPenalty + dist * 0.45 + node.y * 0.35;
        if (score < bestLeadScore) {
          bestLeadScore = score;
          bestLead = node;
        }
      } else if (
        (node.state === "active" || node.state === "ready") &&
        node.activeWorkers > 0 &&
        node.activeWorkers < node.maxSquadSize &&
        node.progress < 0.88
      ) {
        const score =
          bucketPenalty + dist * 0.5 + node.activeWorkers * 180;
        if (score < bestAssistScore) {
          bestAssistScore = score;
          bestAssist = node;
        }
      }
    }

    if (bestLead) {
      bestLead.state = "active";
      const slotIdx = bestLead.activeWorkers++;
      return {
        taskId: bestLead.id,
        role: "lead",
        slotIdx,
      };
    }

    if (bestAssist) {
      const slotIdx = bestAssist.activeWorkers++;
      return {
        taskId: bestAssist.id,
        role: "assistant",
        slotIdx,
      };
    }

    return null;
  }
}
