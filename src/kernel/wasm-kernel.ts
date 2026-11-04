import type { Point2D } from "../core/types";
import { SOA_STRIDE, SoACursorBuffer } from "./soa-buffer";
import { SWARM_KERNEL_WASM_BASE64 } from "./wasm-binary";

interface WasmExports {
  memory: WebAssembly.Memory;
  get_cursor_buffer_ptr(): number;
  get_proj_mat_ptr(): number;
  get_pts_3d_ptr(): number;
  get_pts_2d_ptr(): number;
  step_boids_spatial_hash(
    dt: number,
    count: number,
    centerX: number,
    centerY: number,
    radiusScale: number
  ): void;
  project_points_3d_batch(count: number, vw: number, vh: number): void;
}

const GRID_CELLS = 256;
const CELL_SIZE = 96.0;

function decodeBase64ToBytes(b64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(b64, "base64"));
  }
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

/**
 * Compiled Rust -> WebAssembly Compute Kernel (`wasm32-unknown-unknown`)
 * with Zero-Copy Float32Array views and automatic TypedArray SIMD-style fallback.
 */
export class SwarmKernel {
  private wasm: WasmExports | null = null;
  private cellHead = new Int32Array(GRID_CELLS);
  private boidNext = new Int32Array(256);

  constructor(wasmExports?: WasmExports | null) {
    this.wasm = wasmExports ?? null;
  }

  public static createSync(): SwarmKernel {
    try {
      const bytes = decodeBase64ToBytes(SWARM_KERNEL_WASM_BASE64);
      const mod = new WebAssembly.Module(bytes as BufferSource);
      const inst = new WebAssembly.Instance(mod, {});
      return new SwarmKernel(inst.exports as unknown as WasmExports);
    } catch {
      return new SwarmKernel(null);
    }
  }

  public static async create(): Promise<SwarmKernel> {
    try {
      const bytes = decodeBase64ToBytes(SWARM_KERNEL_WASM_BASE64);
      const { instance } = await WebAssembly.instantiate(bytes as BufferSource, {});
      return new SwarmKernel(instance.exports as unknown as WasmExports);
    } catch {
      return new SwarmKernel(null);
    }
  }

  public get isWasmAccelerated(): boolean {
    return this.wasm !== null;
  }

  public stepBoidsSpatialHash(
    dt: number,
    buffer: SoACursorBuffer,
    count: number,
    center: Point2D,
    radiusScale = 1.0,
    _time = 0
  ): boolean {
    const n = Math.min(count, buffer.capacity, 256);
    if (n <= 0) return false;

    if (this.wasm) {
      const ptr = this.wasm.get_cursor_buffer_ptr();
      const wasmView = new Float32Array(
        this.wasm.memory.buffer,
        ptr,
        n * SOA_STRIDE
      );
      wasmView.set(buffer.data.subarray(0, n * SOA_STRIDE));
      this.wasm.step_boids_spatial_hash(
        dt,
        n,
        center.x,
        center.y,
        radiusScale
      );
      buffer.data.set(wasmView);
      return true;
    }

    // TypedArray O(N) Uniform Spatial Hash fallback
    this.cellHead.fill(-1);
    const d = buffer.data;
    for (let i = 0; i < n; i++) {
      const base = i * SOA_STRIDE;
      const cx = (d[base] / CELL_SIZE) | 0;
      const cy = (d[base + 1] / CELL_SIZE) | 0;
      const h = (Math.imul(cx, 73856093) ^ Math.imul(cy, 19349663)) & (GRID_CELLS - 1);
      this.boidNext[i] = this.cellHead[h];
      this.cellHead[h] = i;
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
          let j = this.cellHead[h];
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
            j = this.boidNext[j];
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

  public projectPoints3DBatch(
    matrix16: Float32Array,
    points3D: Float32Array,
    out2D: Float32Array,
    vw: number,
    vh: number
  ): void {
    const count = Math.min(
      Math.floor(points3D.length / 3),
      Math.floor(out2D.length / 2),
      1024
    );
    if (count <= 0) return;

    if (this.wasm) {
      const matPtr = this.wasm.get_proj_mat_ptr();
      const p3Ptr = this.wasm.get_pts_3d_ptr();
      const p2Ptr = this.wasm.get_pts_2d_ptr();
      const buf = this.wasm.memory.buffer;

      new Float32Array(buf, matPtr, 16).set(matrix16.subarray(0, 16));
      new Float32Array(buf, p3Ptr, count * 3).set(points3D.subarray(0, count * 3));
      this.wasm.project_points_3d_batch(count, vw, vh);
      out2D.set(new Float32Array(buf, p2Ptr, count * 2));
      return;
    }

    const halfW = vw * 0.5;
    const halfH = vh * 0.5;
    for (let i = 0; i < count; i++) {
      const p3 = i * 3;
      const p2 = i * 2;
      const x = points3D[p3];
      const y = points3D[p3 + 1];
      const z = points3D[p3 + 2];

      const clipX =
        matrix16[0] * x + matrix16[4] * y + matrix16[8] * z + matrix16[12];
      const clipY =
        matrix16[1] * x + matrix16[5] * y + matrix16[9] * z + matrix16[13];
      const clipW =
        matrix16[3] * x + matrix16[7] * y + matrix16[11] * z + matrix16[15];
      const invW = Math.abs(clipW) > 1e-6 ? 1.0 / clipW : 1.0;

      const ndcX = clipX * invW;
      const ndcY = clipY * invW;
      out2D[p2] = (ndcX + 1.0) * halfW;
      out2D[p2 + 1] = (1.0 - ndcY) * halfH;
    }
  }
}
