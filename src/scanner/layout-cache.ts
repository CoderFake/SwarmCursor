import type { BoundingBox } from "../core/types";

/**
 * Caches DOM element bounding boxes and uses ResizeObserver so the 60fps
 * animation loop never triggers synchronous layout reflows (`getBoundingClientRect`).
 */
export class DOMLayoutCache {
  private boxes = new Map<HTMLElement, BoundingBox>();
  private observer: ResizeObserver | null = null;
  private rootEl: HTMLElement | null = null;

  constructor(rootEl?: HTMLElement | null) {
    this.rootEl = rootEl ?? null;
    if (typeof ResizeObserver !== "undefined") {
      this.observer = new ResizeObserver((entries) => {
        const rootRect = this.rootEl?.getBoundingClientRect() ?? {
          left: 0,
          top: 0,
        };
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          const r = target.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            this.boxes.set(target, {
              x: Math.max(0, r.left - rootRect.left),
              y: Math.max(0, r.top - rootRect.top),
              w: r.width,
              h: r.height,
            });
          }
        }
      });
    }
  }

  public set(el: HTMLElement, box: BoundingBox): void {
    this.boxes.set(el, box);
    this.observer?.observe(el);
  }

  public get(el: HTMLElement): BoundingBox | undefined {
    return this.boxes.get(el);
  }

  public isInViewport(
    el: HTMLElement,
    viewTop: number,
    viewBot: number,
    padding = 180
  ): boolean {
    const box = this.boxes.get(el);
    if (!box) return true;
    return box.y + box.h >= viewTop - padding && box.y <= viewBot + padding;
  }

  public destroy(): void {
    this.observer?.disconnect();
    this.boxes.clear();
  }
}
