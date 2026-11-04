import { BLEED_LEFT, BLEED_RIGHT } from "../core/constants";
import { getLineHeightPx, measureTextBlock } from "../core/text-measure";
import type {
  BoundingBox,
  BoxOverlayItem,
  MeasureOverlayItem,
  Point2D,
  SwarmElementNode,
  SwarmTextEl,
} from "../core/types";
import type { SwarmEngine } from "./SwarmEngine";

export function computeElementBounds(el: SwarmElementNode): BoundingBox {
  if (el.kind === "text") {
    const m = measureTextBlock(el.shown || " ", el.st, el.size, el.w);
    return {
      x: el.x + el.dx,
      y: el.y + el.dy,
      w: el.w ?? Math.max(m.w, 2),
      h: Math.max(m.h, getLineHeightPx(el.st, el.size)),
    };
  }
  if (el.kind === "rect") {
    return {
      x: el.x + el.dx,
      y: el.y + el.dy,
      w: el.draw?.w ?? el.w,
      h: el.draw?.h ?? el.h,
    };
  }
  if (el.kind === "path") {
    const xs = el.pts.map((p) => p.x);
    const ys = el.pts.map((p) => p.y);
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      w: Math.max(...xs) - Math.min(...xs),
      h: Math.max(...ys) - Math.min(...ys),
    };
  }
  if (el.kind === "3d" || el.kind === "image") {
    return {
      x: el.x + el.dx,
      y: el.y + el.dy,
      w: el.w,
      h: el.h,
    };
  }
  return { x: el.pos, y: 0, w: 0, h: 0 };
}

export function computeUnionBounds(
  engine: SwarmEngine,
  ids: string[]
): BoundingBox {
  const boxes = ids
    .map((id) => engine.els.get(id))
    .filter((e): e is SwarmElementNode => !!e)
    .map((e) => engine.bounds(e));
  if (boxes.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
  const minX = Math.min(...boxes.map((b) => b.x));
  const minY = Math.min(...boxes.map((b) => b.y));
  return {
    x: minX,
    y: minY,
    w: Math.max(...boxes.map((b) => b.x + b.w)) - minX,
    h: Math.max(...boxes.map((b) => b.y + b.h)) - minY,
  };
}

export function computeTextUnderline(
  engine: SwarmEngine,
  el: SwarmTextEl
): BoundingBox {
  const m = measureTextBlock(el.shown || " ", el.st, el.size, el.w);
  const b = engine.bounds(el);
  const firstLineW = m.lines[0] ?? 0;
  return {
    x: el.align === "center" && el.w ? b.x + (el.w - firstLineW) / 2 : b.x,
    y: b.y + getLineHeightPx(el.st, el.size) * 0.5 + el.size * 0.42,
    w: firstLineW,
    h: 0,
  };
}

export function createSelectionBox(
  engine: SwarmEngine,
  el: SwarmElementNode,
  extra: Partial<BoxOverlayItem> = {}
): BoxOverlayItem {
  const b = engine.bounds(el);
  return {
    t: "box",
    b,
    handles: true,
    badge: `${Math.round(b.w)} × ${Math.round(b.h)}`,
    rulerLines: true,
    underline: el.kind === "text" ? engine.textUnderline(el) : undefined,
    ...extra,
  };
}

export function computeAnchorPoint(
  engine: SwarmEngine,
  pt: Point2D
): Point2D | (() => Point2D) {
  if (pt.x <= BLEED_LEFT) {
    return () => ({ x: engine.fromViewport(6, 0).x, y: pt.y });
  }
  if (pt.x >= BLEED_RIGHT) {
    return () => ({
      x: engine.fromViewport(engine.vp.vw - 6, 0).x,
      y: pt.y,
    });
  }
  return pt;
}

export function computeSpacingMeasure(
  boxA: BoundingBox,
  boxB: BoundingBox
): MeasureOverlayItem | null {
  const overlapY =
    Math.min(boxA.y + boxA.h, boxB.y + boxB.h) - Math.max(boxA.y, boxB.y);
  const overlapX =
    Math.min(boxA.x + boxA.w, boxB.x + boxB.w) - Math.max(boxA.x, boxB.x);

  if (overlapY > 0) {
    const midY = Math.max(boxA.y, boxB.y) + overlapY / 2;
    const [leftBox, rightBox] = boxA.x < boxB.x ? [boxA, boxB] : [boxB, boxA];
    const gap = rightBox.x - (leftBox.x + leftBox.w);
    if (gap > 0) {
      return {
        t: "measure",
        a: { x: leftBox.x + leftBox.w, y: midY },
        b: { x: rightBox.x, y: midY },
        label: String(Math.round(gap)),
      };
    }
  } else if (overlapX > 0) {
    const midX = Math.max(boxA.x, boxB.x) + overlapX / 2;
    const [topBox, botBox] = boxA.y < boxB.y ? [boxA, boxB] : [boxB, boxA];
    const gap = botBox.y - (topBox.y + topBox.h);
    if (gap > 0) {
      return {
        t: "measure",
        a: { x: midX, y: topBox.y + topBox.h },
        b: { x: midX, y: botBox.y },
        label: String(Math.round(gap)),
      };
    }
  }
  return null;
}
