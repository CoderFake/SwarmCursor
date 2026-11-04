import { GUIDE_RED, SELECTION_BLUE } from "../core/constants";
import type { SwarmEngine } from "../core/engine";
import type {
  Gizmo3DOverlayItem,
  ImageBuildOverlayItem,
  Laser3DOverlayItem,
} from "../core/types";

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

    // 1. Draw active guides & editable vector paths
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
      } else if (el.kind === "path" && el.edit && el.placed > 0) {
        const placedPts = el.pts
          .slice(0, el.placed)
          .map((pt) => ({ x: toScreenX(pt.x), y: toScreenY(pt.y, el.sticky) }));
        const ownerCursor =
          el.owner != null
            ? engine.cursors.find((c) => c.id === el.owner)
            : null;
        const previewPts = ownerCursor
          ? [
              ...placedPts,
              {
                x: toScreenX(ownerCursor.x),
                y: toScreenY(ownerCursor.y, el.sticky),
              },
            ]
          : placedPts;
        if (previewPts.length > 0) {
          ctx.save();
          ctx.strokeStyle = SELECTION_BLUE;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(previewPts[0].x, previewPts[0].y);
          for (let i = 1; i < previewPts.length; i++) {
            ctx.lineTo(previewPts[i].x, previewPts[i].y);
          }
          if (el.shut && placedPts.length > 1) {
            ctx.lineTo(placedPts[0].x, placedPts[0].y);
          }
          ctx.stroke();
          ctx.fillStyle = "#ffffff";
          for (const pt of placedPts) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        }
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

          if (item.underline && item.underline.w > 0) {
            const ux = toScreenX(item.underline.x);
            const uy = toScreenY(item.underline.y, cursor.sticky);
            ctx.beginPath();
            ctx.moveTo(ux, uy);
            ctx.lineTo(ux + item.underline.w * s, uy);
            ctx.stroke();
          }

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

          if (item.badge && w > 0) {
            this.drawBadgePill(ctx, x + w * 0.5, y + h + 14, item.badge, color);
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
          if (item.label) {
            const isHoriz = Math.abs(ay - by) < 2;
            this.drawBadgePill(
              ctx,
              isHoriz ? (ax + bx) * 0.5 : ax + 18,
              isHoriz ? ay + 12 : (ay + by) * 0.5,
              item.label,
              GUIDE_RED
            );
          }
        } else if (item.t === "gizmo3d") {
          this.drawGizmo3D(ctx, item, toScreenX, (y) =>
            toScreenY(y, cursor.sticky)
          );
        } else if (item.t === "laser3d") {
          this.drawLaser3D(ctx, item, toScreenX, (y) =>
            toScreenY(y, cursor.sticky)
          );
        } else if (item.t === "imagebuild") {
          this.drawImageBuild(ctx, item, toScreenX, (y) =>
            toScreenY(y, cursor.sticky),
            s
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
    if (item.badge) {
      const maxY = Math.max(...pts.map((p) => p.y));
      this.drawBadgePill(ctx, orig.x, maxY + 14, item.badge, "#7C3AED");
    }
    ctx.restore();
  }

  private drawBadgePill(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    text: string,
    bgColor: string
  ): void {
    ctx.save();
    ctx.font = "600 10px Inter, system-ui, -apple-system, sans-serif";
    const padX = 6;
    const textW = ctx.measureText(text).width;
    const pillW = Math.ceil(textW + padX * 2);
    const pillH = 16;
    const rx = centerX - pillW * 0.5;
    const ry = centerY - pillH * 0.5;
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(rx, ry, pillW, pillH, 4);
    } else {
      ctx.rect(rx, ry, pillW, pillH);
    }
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, centerX, centerY + 0.5);
    ctx.restore();
  }

  private drawImageBuild(
    ctx: CanvasRenderingContext2D,
    item: ImageBuildOverlayItem,
    toX: (x: number) => number,
    toY: (y: number) => number,
    scale: number
  ): void {
    const x = toX(item.b.x);
    const y = toY(item.b.y);
    const w = item.b.w * scale;
    const h = item.b.h * scale;
    if (w <= 2 || h <= 2) return;

    ctx.save();
    ctx.strokeStyle = SELECTION_BLUE;
    ctx.lineWidth = 1.25;
    ctx.strokeRect(x, y, w, h);

    if (item.phase === "mosaic") {
      // Progressive Quadtree / Macro-Block Pixelation Grid
      const cols = Math.max(4, Math.min(16, Math.round(4 + item.progress * 12)));
      const rows = Math.max(3, Math.min(12, Math.round(3 + item.progress * 9)));
      const cw = w / cols;
      const ch = h / rows;
      const maxCells = Math.ceil(cols * rows * item.progress);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          if (idx > maxCells) break;
          const hue = 215 + ((r * 17 + c * 31) % 65);
          const alpha = (1 - item.progress) * 0.42;
          ctx.fillStyle = `hsla(${hue}, 82%, 66%, ${alpha.toFixed(2)})`;
          ctx.fillRect(x + c * cw + 0.5, y + r * ch + 0.5, cw - 1, ch - 1);
        }
      }
    } else if (item.phase === "scanline") {
      // Laser Raster Scanline + Blueprint Diagonals below scanline
      const scanY = y + h * item.progress;
      ctx.strokeStyle = "rgba(13, 153, 255, 0.28)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, scanY);
      ctx.lineTo(x + w, y + h);
      ctx.moveTo(x + w, scanY);
      ctx.lineTo(x, y + h);
      ctx.stroke();

      ctx.strokeStyle = "#38BDF8";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(x, scanY);
      ctx.lineTo(x + w, scanY);
      ctx.stroke();
    } else {
      // Halftone Dot-Matrix Screen-Printing Grid
      const cols = 10;
      const rows = 8;
      const cw = w / cols;
      const ch = h / rows;
      const maxR = Math.min(cw, ch) * 0.42 * item.progress;
      ctx.fillStyle = "rgba(124, 58, 237, 0.32)";
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.beginPath();
          ctx.arc(x + (c + 0.5) * cw, y + (r + 0.5) * ch, maxR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    if (item.badge) {
      this.drawBadgePill(ctx, x + w * 0.5, y + h + 14, item.badge, SELECTION_BLUE);
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
