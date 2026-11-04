import { GUIDE_RED, SELECTION_BLUE } from "../core/constants";
import type { SwarmEngine } from "../core/engine";
import type { Gizmo3DOverlayItem, Laser3DOverlayItem } from "../core/types";

const BOX_EDGES_3D: ReadonlyArray<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

/**
 * Single Viewport-Culled 2D `<canvas>` Renderer for:
 * - 2D Selection Boxes & Resize Handles
 * - Snap Guides & Spacing Measures
 * - 3D Wireframe Bounding-Box Gizmos (8 corners + 12 edges + X/Y/Z axes)
 * - Holographic 3D Printing Laser Slice Scanlines & Particle Welding Beams
 */
export class FastOverlayCanvasController {
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  private safeGetContext(): CanvasRenderingContext2D | null {
    try {
      if (
        typeof navigator !== "undefined" &&
        /jsdom/i.test(navigator.userAgent || "")
      ) {
        return null;
      }
      return typeof this.canvas.getContext === "function"
        ? this.canvas.getContext("2d")
        : null;
    } catch {
      return null;
    }
  }

  public sync(engine: SwarmEngine): void {
    const ctx = this.safeGetContext();
    if (!ctx) return;

    const { s, left, vw, vh, scrollY } = engine.vp;
    if (this.canvas.width !== vw || this.canvas.height !== vh) {
      this.canvas.width = vw;
      this.canvas.height = vh;
    }

    ctx.clearRect(0, 0, vw, vh);
    const toScreenX = (x: number) => left + x * s;
    const toScreenY = (y: number, sticky = false) =>
      (y + (sticky ? engine.stick : 0)) * s - scrollY;

    // 1. Draw active guides
    for (const el of engine.list) {
      if (el.kind === "guide" && el.vis && el.op > 0) {
        ctx.save();
        ctx.strokeStyle = GUIDE_RED;
        ctx.globalAlpha = el.op;
        ctx.lineWidth = 1 + el.flash;
        ctx.beginPath();
        if (el.axis === "x") {
          const sx = toScreenX(el.cur);
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx, vh);
        } else {
          const sy = toScreenY(el.cur);
          ctx.moveTo(0, sy);
          ctx.lineTo(vw, sy);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. Draw cursor overlays (2D boxes, measures, 3D gizmos, 3D laser beams)
    for (const cursor of engine.cursors) {
      if (!cursor.ov) continue;
      for (const item of cursor.ov()) {
        if (item.t === "box") {
          const x = toScreenX(item.b.x);
          const y = toScreenY(item.b.y, cursor.sticky);
          const w = item.b.w * s;
          const h = item.b.h * s;
          if (y + h < -80 || y > vh + 80) continue;

          const color = item.color === "red" ? GUIDE_RED : SELECTION_BLUE;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, w, h);

          if (item.handles) {
            ctx.fillStyle = "#fff";
            for (const [hx, hy] of [
              [x, y],
              [x + w, y],
              [x, y + h],
              [x + w, y + h],
            ]) {
              ctx.fillRect(hx - 3.5, hy - 3.5, 7, 7);
              ctx.strokeRect(hx - 3.5, hy - 3.5, 7, 7);
            }
          }
        } else if (item.t === "measure") {
          const ax = toScreenX(item.a.x);
          const ay = toScreenY(item.a.y, cursor.sticky);
          const bx = toScreenX(item.b.x);
          const by = toScreenY(item.b.y, cursor.sticky);
          ctx.strokeStyle = GUIDE_RED;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        } else if (item.t === "gizmo3d") {
          this.drawGizmo3D(ctx, item, toScreenX, (y) =>
            toScreenY(y, cursor.sticky)
          );
        } else if (item.t === "laser3d") {
          this.drawLaser3D(ctx, item, toScreenX, (y) =>
            toScreenY(y, cursor.sticky)
          );
        }
      }
    }
  }

  private drawGizmo3D(
    ctx: CanvasRenderingContext2D,
    item: Gizmo3DOverlayItem,
    toX: (x: number) => number,
    toY: (y: number) => number
  ): void {
    const pts = item.corners.map((p) => ({ x: toX(p.x), y: toY(p.y) }));
    if (pts.length < 8) return;

    ctx.save();
    ctx.strokeStyle = "rgba(13, 153, 255, 0.72)";
    ctx.lineWidth = 1.25;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (const [i, j] of BOX_EDGES_3D) {
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[j].x, pts[j].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw 3D X (Red), Y (Green), Z (Blue) Gizmo Axes
    const orig = { x: toX(item.origin.x), y: toY(item.origin.y) };
    const axisSpecs: Array<{ pt: { x: number; y: number }; col: string }> = [
      { pt: { x: toX(item.axes.x.x), y: toY(item.axes.x.y) }, col: "#F24822" },
      { pt: { x: toX(item.axes.y.x), y: toY(item.axes.y.y) }, col: "#14AE5C" },
      { pt: { x: toX(item.axes.z.x), y: toY(item.axes.z.y) }, col: "#0D99FF" },
    ];
    for (const ax of axisSpecs) {
      ctx.strokeStyle = ax.col;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(orig.x, orig.y);
      ctx.lineTo(ax.pt.x, ax.pt.y);
      ctx.stroke();
    }

    // Draw corner vertex handles
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#7C3AED";
    ctx.lineWidth = 1.2;
    for (const p of pts) {
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
      ctx.strokeRect(p.x - 3, p.y - 3, 6, 6);
    }
    ctx.restore();
  }

  private drawLaser3D(
    ctx: CanvasRenderingContext2D,
    item: Laser3DOverlayItem,
    toX: (x: number) => number,
    toY: (y: number) => number
  ): void {
    const lx = toX(item.leftPt.x);
    const ly = toY(item.leftPt.y);
    const rx = toX(item.rightPt.x);
    const ry = toY(item.rightPt.y);
    const cx = toX(item.cursorPt.x);
    const cy = toY(item.cursorPt.y);

    ctx.save();
    if (item.mode === "slice") {
      // Horizontal Holographic 3D Printing Laser Slice Line
      ctx.strokeStyle = "#38BDF8";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(rx, ry);
      ctx.stroke();

      // Beam from cursor tip to laser slice midpoint
      ctx.strokeStyle = "rgba(124, 58, 237, 0.75)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo((lx + rx) * 0.5, (ly + ry) * 0.5);
      ctx.stroke();
    } else {
      // Particle welding energy ray from cursor tip into 3D surface center
      ctx.strokeStyle = "rgba(56, 189, 248, 0.82)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo((lx + rx) * 0.5, (ly + ry) * 0.5);
      ctx.stroke();
    }
    ctx.restore();
  }

  public destroy(): void {
    const ctx = this.safeGetContext();
    ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
