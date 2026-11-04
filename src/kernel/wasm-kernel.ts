import type { Point2D } from "../core/types";
import { runAuctionTasksBatch } from "./auction-ops";
import { runBezierPathsBatch } from "./bezier-ops";
import { runBoidsSpatialHash } from "./boids-ops";
import { runDeformSculpturalMeshBatch } from "./mesh-ops";
import { runProjectPoints3DBatch } from "./projection-ops";
import type { SoACursorBuffer } from "./soa-buffer";
import { SWARM_KERNEL_WASM_BASE64 } from "./wasm-binary";
import {
  decodeBase64ToBytes,
  type WasmAuctionResult,
  type WasmAuctionTaskInput,
  type WasmExports,
} from "./wasm-types";

export type { WasmAuctionResult, WasmAuctionTaskInput, WasmExports };

/**
 * Compiled Rust -> WebAssembly Compute Kernel (`wasm32-unknown-unknown +simd128`)
 * Facade delegating to modular compute operators:
 *  - `boids-ops.ts` (`stepBoidsSpatialHash`)
 *  - `bezier-ops.ts` (`stepBezierPathsBatch`)
 *  - `projection-ops.ts` (`projectPoints3DBatch`)
 *  - `auction-ops.ts` (`auctionTasksBatch`)
 *  - `mesh-ops.ts` (`deformSculpturalMeshBatch`)
 */
export class SwarmKernel {
  private wasm: WasmExports | null = null;
  private cellHead = new Int32Array(256);
  private boidNext = new Int32Array(256);
  private uploadedMeshRef: { current: Float32Array | null } = { current: null };

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
      const { instance } = await WebAssembly.instantiate(
        bytes as BufferSource,
        {}
      );
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
    return runBoidsSpatialHash(
      this.wasm,
      this.cellHead,
      this.boidNext,
      dt,
      buffer,
      count,
      center,
      radiusScale
    );
  }

  public stepBezierPathsBatch(
    dt: number,
    tempo: number,
    cursorBuffer: SoACursorBuffer,
    bezierBuffer: Float32Array,
    count: number
  ): number {
    return runBezierPathsBatch(
      this.wasm,
      dt,
      tempo,
      cursorBuffer,
      bezierBuffer,
      count
    );
  }

  public projectPoints3DBatch(
    matrix16: Float32Array,
    points3D: Float32Array,
    out2D: Float32Array,
    vw: number,
    vh: number
  ): void {
    runProjectPoints3DBatch(this.wasm, matrix16, points3D, out2D, vw, vh);
  }

  public auctionTasksBatch(
    cursorPositions: Point2D[],
    tasks: WasmAuctionTaskInput[],
    viewTop: number,
    viewBot: number,
    frontierY = 1e9
  ): Array<WasmAuctionResult | null> {
    return runAuctionTasksBatch(
      this.wasm,
      cursorPositions,
      tasks,
      viewTop,
      viewBot,
      frontierY
    );
  }

  public deformSculpturalMeshBatch(
    basePositions: Float32Array,
    outPositions: Float32Array,
    time: number
  ): void {
    runDeformSculpturalMeshBatch(
      this.wasm,
      this.uploadedMeshRef,
      basePositions,
      outPositions,
      time
    );
  }
}

export const wasmKernel = SwarmKernel.createSync();
