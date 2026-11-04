import type { Point2D, SwarmCursor } from "../core/types";

export const SOA_STRIDE = 16;

export interface SoACursorPatch {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  angle?: number;
  speed?: number;
  force?: number;
  orbit?: number;
  ph?: number;
  curl?: number;
  press?: number;
  targetX?: number;
  targetY?: number;
}

/**
 * Structure-of-Arrays (SoA) / Strided Flat Float32Array Buffer for Zero-Copy
 * sharing between Rust WebAssembly linear memory, TypeScript, and Fast Renderers.
 */
export class SoACursorBuffer {
  public readonly capacity: number;
  public data: Float32Array;

  constructor(capacity = 256, backingBuffer?: Float32Array) {
    this.capacity = capacity;
    this.data =
      backingBuffer && backingBuffer.length >= capacity * SOA_STRIDE
        ? backingBuffer
        : new Float32Array(capacity * SOA_STRIDE);
  }

  public bindExternalBuffer(view: Float32Array): void {
    const copyLen = Math.min(this.data.length, view.length);
    view.set(this.data.subarray(0, copyLen));
    this.data = view;
  }

  public setCursor(idx: number, patch: SoACursorPatch): void {
    if (idx < 0 || idx >= this.capacity) return;
    const base = idx * SOA_STRIDE;
    const d = this.data;
    if (patch.x !== undefined) d[base + 0] = patch.x;
    if (patch.y !== undefined) d[base + 1] = patch.y;
    if (patch.vx !== undefined) d[base + 2] = patch.vx;
    if (patch.vy !== undefined) d[base + 3] = patch.vy;
    if (patch.angle !== undefined) d[base + 4] = patch.angle;
    if (patch.speed !== undefined) d[base + 5] = patch.speed;
    if (patch.force !== undefined) d[base + 6] = patch.force;
    if (patch.orbit !== undefined) d[base + 7] = patch.orbit;
    if (patch.ph !== undefined) d[base + 8] = patch.ph;
    if (patch.curl !== undefined) d[base + 9] = patch.curl;
    if (patch.press !== undefined) d[base + 10] = patch.press;
    if (patch.targetX !== undefined) d[base + 11] = patch.targetX;
    if (patch.targetY !== undefined) d[base + 12] = patch.targetY;
  }

  public getCursorPosition(idx: number): Point2D {
    const base = idx * SOA_STRIDE;
    return {
      x: this.data[base + 0],
      y: this.data[base + 1],
    };
  }

  public syncFromCursors(cursors: SwarmCursor[]): void {
    const count = Math.min(cursors.length, this.capacity);
    const d = this.data;
    for (let i = 0; i < count; i++) {
      const c = cursors[i];
      const base = i * SOA_STRIDE;
      d[base + 0] = c.x;
      d[base + 1] = c.y;
      d[base + 2] = c.vx;
      d[base + 3] = c.vy;
      d[base + 4] = c.angle;
      d[base + 5] = c.speed;
      d[base + 6] = c.force;
      d[base + 7] = c.orbit;
      d[base + 8] = c.ph;
      d[base + 9] = c.curl;
      d[base + 10] = c.press;
    }
  }

  public syncToCursors(cursors: SwarmCursor[]): void {
    const count = Math.min(cursors.length, this.capacity);
    const d = this.data;
    for (let i = 0; i < count; i++) {
      const c = cursors[i];
      const base = i * SOA_STRIDE;
      c.x = d[base + 0];
      c.y = d[base + 1];
      c.vx = d[base + 2];
      c.vy = d[base + 3];
      c.angle = d[base + 4];
      c.press = d[base + 10];
    }
  }
}
