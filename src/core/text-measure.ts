import type { TextStyleSpec } from "./types";

let measureCtx: CanvasRenderingContext2D | null = null;
let measureCtxInitialized = false;
const measureCache = new Map<
  string,
  { w: number; h: number; lines: number[] }
>();

function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (measureCtxInitialized) return measureCtx;
  measureCtxInitialized = true;
  if (
    typeof document !== "undefined" &&
    (typeof navigator === "undefined" || !/jsdom/i.test(navigator.userAgent))
  ) {
    try {
      const canvas = document.createElement("canvas");
      measureCtx = canvas.getContext("2d");
    } catch {
      measureCtx = null;
    }
  }
  return measureCtx;
}

export const getFontFamily = (st: TextStyleSpec): string =>
  st.font === "mono"
    ? '"JetBrains Mono", ui-monospace, monospace'
    : "Inter, system-ui, sans-serif";

export const getLineHeightPx = (st: TextStyleSpec, size = st.size): number =>
  Math.round(size * st.lh);

function measureStringWidth(
  str: string,
  st: TextStyleSpec,
  size: number
): number {
  const ctx = getMeasureCtx();
  if (ctx && typeof ctx.measureText === "function") {
    try {
      ctx.font = `${st.weight} ${size}px ${getFontFamily(st)}`;
      if ("letterSpacing" in ctx) {
        (ctx as unknown as { letterSpacing: string }).letterSpacing = `${(st.ls ?? 0) * size}px`;
      }
      const w = ctx.measureText(str).width;
      if (w > 0 || str.length === 0) return w;
    } catch {
      // Fallback below for jsdom or SSR
    }
  }
  const avgCharFactor = st.font === "mono" ? 0.6 : 0.52 + (st.ls ?? 0);
  return str.length * size * avgCharFactor;
}

export function measureTextBlock(
  text: string,
  st: TextStyleSpec,
  size: number,
  maxWidth?: number
): { w: number; h: number; lines: number[] } {
  const key = `${text}|${st.font}|${st.weight}|${size}|${st.ls ?? 0}|${maxWidth ?? -1}`;
  const cached = measureCache.get(key);
  if (cached) return cached;

  const lines: number[] = [];
  for (const rawLine of text.split("\n")) {
    if (maxWidth == null || st.pre) {
      lines.push(measureStringWidth(rawLine, st, size));
      continue;
    }
    const words = rawLine.split(" ");
    let current = "";
    for (const word of words) {
      const candidate = current ? current + " " + word : word;
      if (current && measureStringWidth(candidate, st, size) > maxWidth) {
        lines.push(measureStringWidth(current, st, size));
        current = word;
      } else {
        current = candidate;
      }
    }
    lines.push(measureStringWidth(current, st, size));
  }

  const width = maxWidth ?? Math.max(0, ...lines);
  const result = {
    w: Math.ceil(width),
    h: lines.length * getLineHeightPx(st, size),
    lines,
  };
  measureCache.set(key, result);
  return result;
}
