import { SOA_STRIDE, type SoACursorBuffer } from "./soa-buffer";
import type { WasmExports } from "./wasm-types";

export function runBezierPathsBatch(
  wasm: WasmExports | null,
  dt: number,
  tempo: number,
  cursorBuffer: SoACursorBuffer,
  bezierBuffer: Float32Array,
  count: number
): number {
  const n = Math.min(count, cursorBuffer.capacity, 256);
  if (n <= 0) return 0;

  if (wasm) {
    const cPtr = wasm.get_cursor_buffer_ptr();
    const bPtr = wasm.get_bezier_buffer_ptr();
    const mem = wasm.memory.buffer;
    const cView = new Float32Array(mem, cPtr, n * SOA_STRIDE);
    const bView = new Float32Array(mem, bPtr, n * 12);

    cView.set(cursorBuffer.data.subarray(0, n * SOA_STRIDE));
    bView.set(bezierBuffer.subarray(0, n * 12));
    const rem = wasm.step_bezier_paths_batch(dt, tempo, n);
    cursorBuffer.data.set(cView);
    bezierBuffer.set(bView);
    return rem;
  }

  let activeRemaining = 0;
  const c = cursorBuffer.data;
  for (let i = 0; i < n; i++) {
    const bBase = i * 12;
    if (bezierBuffer[bBase] < 0.5) continue;
    const cBase = i * SOA_STRIDE;
    let u = bezierBuffer[bBase + 1];
    const dur = Math.max(0.001, bezierBuffer[bBase + 2]);
    const speedMult = bezierBuffer[bBase + 3];
    u += (dt * tempo * speedMult) / dur;
    if (u >= 1) {
      u = 1;
      bezierBuffer[bBase] = 0;
    } else {
      activeRemaining++;
    }
    bezierBuffer[bBase + 1] = u;
    const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) * 0.5;
    const inv = 1 - e;
    const b0 = inv * inv * inv;
    const b1 = 3 * inv * inv * e;
    const b2 = 3 * inv * e * e;
    const b3 = e * e * e;
    const nx =
      b0 * bezierBuffer[bBase + 4] +
      b1 * bezierBuffer[bBase + 6] +
      b2 * bezierBuffer[bBase + 8] +
      b3 * bezierBuffer[bBase + 10];
    const ny =
      b0 * bezierBuffer[bBase + 5] +
      b1 * bezierBuffer[bBase + 7] +
      b2 * bezierBuffer[bBase + 9] +
      b3 * bezierBuffer[bBase + 11];
    const vx = (nx - c[cBase]) / Math.max(0.001, dt);
    const vy = (ny - c[cBase + 1]) / Math.max(0.001, dt);
    c[cBase] = nx;
    c[cBase + 1] = ny;
    c[cBase + 2] = vx;
    c[cBase + 3] = vy;
    c[cBase + 10] = Math.max(-14, Math.min(14, vx * 0.018));
  }
  return activeRemaining;
}
