import type { Point2D } from "../core/types";
import { SOA_STRIDE, type SoACursorBuffer } from "./soa-buffer";
import type { WasmExports } from "./wasm-types";

const GRID_CELLS = 256;
const CELL_SIZE = 96.0;

export function runBoidsSpatialHash(
  wasm: WasmExports | null,
  cellHead: Int32Array,
  boidNext: Int32Array,
  dt: number,
  buffer: SoACursorBuffer,
  count: number,
  center: Point2D,
  radiusScale = 1.0
): boolean {
  const n = Math.min(count, buffer.capacity, 256);
  if (n <= 0) return false;

  if (wasm) {
    const ptr = wasm.get_cursor_buffer_ptr();
    const wasmView = new Float32Array(wasm.memory.buffer, ptr, n * SOA_STRIDE);
    wasmView.set(buffer.data.subarray(0, n * SOA_STRIDE));
    wasm.step_boids_spatial_hash(dt, n, center.x, center.y, radiusScale);
    buffer.data.set(wasmView);
    return true;
  }

  cellHead.fill(-1);
  const d = buffer.data;
  for (let i = 0; i < n; i++) {
    const base = i * SOA_STRIDE;
    const cx = (d[base] / CELL_SIZE) | 0;
    const cy = (d[base + 1] / CELL_SIZE) | 0;
    const h =
      (Math.imul(cx, 73856093) ^ Math.imul(cy, 19349663)) & (GRID_CELLS - 1);
    boidNext[i] = cellHead[h];
    cellHead[h] = i;
  }

  for (let i = 0; i < n; i++) {
    const base = i * SOA_STRIDE;
    const x = d[base];
    const y = d[base + 1];
    let vx = d[base + 2];
    let vy = d[base + 3];
    const maxSpeed = Math.max(120, d[base + 5]);
    const maxForce = Math.max(300, d[base + 6]);
    const orbit = Math.max(45, d[base + 7]) * radiusScale;
    const curl = d[base + 9] >= 0 ? 1 : -1;

    const cx = (x / CELL_SIZE) | 0;
    const cy = (y / CELL_SIZE) | 0;
    let sepX = 0;
    let sepY = 0;
    let aliX = 0;
    let aliY = 0;
    let neighbors = 0;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const h =
          (Math.imul(cx + dx, 73856093) ^ Math.imul(cy + dy, 19349663)) &
          (GRID_CELLS - 1);
        let j = cellHead[h];
        while (j >= 0) {
          if (j !== i) {
            const jbase = j * SOA_STRIDE;
            const ox = x - d[jbase];
            const oy = y - d[jbase + 1];
            const d2 = ox * ox + oy * oy;
            if (d2 > 0.001 && d2 < 3600) {
              const invD = 1 / Math.max(1, Math.sqrt(d2));
              sepX += ox * invD * invD * 420;
              sepY += oy * invD * invD * 420;
              aliX += d[jbase + 2];
              aliY += d[jbase + 3];
              neighbors++;
            }
          }
          j = boidNext[j];
        }
      }
    }

    const toCx = center.x - x;
    const toCy = center.y - y;
    const distC = Math.max(1, Math.hypot(toCx, toCy));
    const dirX = toCx / distC;
    const dirY = toCy / distC;
    const tanX = -dirY * curl;
    const tanY = dirX * curl;
    const radialErr = distC - orbit;

    let ax = dirX * (radialErr * 6.5) + tanX * (maxSpeed * 0.85) + sepX;
    let ay = dirY * (radialErr * 6.5) + tanY * (maxSpeed * 0.85) + sepY;

    if (neighbors > 0) {
      ax += (aliX / neighbors - vx) * 1.4;
      ay += (aliY / neighbors - vy) * 1.4;
    }

    const aMag = Math.hypot(ax, ay);
    if (aMag > maxForce) {
      ax = (ax / aMag) * maxForce;
      ay = (ay / aMag) * maxForce;
    }

    vx = (vx + ax * dt) * 0.96;
    vy = (vy + ay * dt) * 0.96;
    const vMag = Math.hypot(vx, vy);
    if (vMag > maxSpeed) {
      vx = (vx / vMag) * maxSpeed;
      vy = (vy / vMag) * maxSpeed;
    }

    d[base] = x + vx * dt;
    d[base + 1] = y + vy * dt;
    d[base + 2] = vx;
    d[base + 3] = vy;
  }

  return true;
}
