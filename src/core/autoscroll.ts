import type { SwarmEngine } from "./engine";
import type { ScrollMode } from "./types";

export interface AutoScrollOptions {
  mode?: ScrollMode;
  speed?: number;
  pauseOnUserMs?: number;
  onScrollTo?: (scrollY: number) => void;
}

export class AutoScrollController {
  public mode: ScrollMode;
  public speed: number;
  public pauseOnUserMs: number;
  public userCooldownSec = 0;
  private onScrollTo?: (scrollY: number) => void;

  constructor(opts: AutoScrollOptions = {}) {
    this.mode = opts.mode ?? "manual";
    this.speed = opts.speed ?? 180;
    this.pauseOnUserMs = opts.pauseOnUserMs ?? 2800;
    this.onScrollTo = opts.onScrollTo;
  }

  public setMode(mode: ScrollMode): void {
    this.mode = mode;
    this.userCooldownSec = 0;
  }

  public notifyUserInteraction(): void {
    if (this.mode === "hybrid") {
      this.userCooldownSec = this.pauseOnUserMs / 1000;
    }
  }

  public update(dt: number, engine: SwarmEngine): void {
    if (this.mode === "manual" || engine.paused) return;

    if (this.userCooldownSec > 0) {
      this.userCooldownSec = Math.max(0, this.userCooldownSec - dt);
      return;
    }

    if (!engine.started) {
      engine.start();
    }

    if (engine.flocking) return;

    const maxScroll = Math.max(0, engine.height * engine.vp.s - engine.vp.vh);
    if (engine.vp.scrollY >= maxScroll) return;

    // Director logic: adjust scroll speed based on active tasks inside the viewport
    const viewTop = engine.viewTop;
    const viewBot = engine.viewBot;
    const pendingInView = engine.tasks.filter(
      (t) => t.state !== "done" && t.y >= viewTop && t.y <= viewBot - 80
    );

    const effectiveSpeed =
      pendingInView.length > 6
        ? this.speed * 0.45
        : pendingInView.length > 2
          ? this.speed * 0.75
          : this.speed * 1.25;

    const nextScrollY = Math.min(
      maxScroll,
      engine.vp.scrollY + effectiveSpeed * dt
    );

    engine.setScroll(nextScrollY);
    if (this.onScrollTo) {
      this.onScrollTo(nextScrollY);
    } else if (typeof window !== "undefined") {
      window.scrollTo({ top: nextScrollY, behavior: "instant" as ScrollBehavior });
    }
  }
}
