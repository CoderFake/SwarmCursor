import { describe, it, expect } from "vitest";
import {
  SoACursorBuffer,
  SwarmKernel,
  DAGTaskScheduler,
} from "../src/kernel";

describe("@swarm/kernel (SoA Buffer, Spatial Hash O(N) WASM/SIMD Kernel & DAG Scheduler)", () => {
  it("packs and unpacks cursor state in 16-float SoA layout and steps O(N) spatial hash boids", async () => {
    const kernel = await SwarmKernel.create();
    expect(kernel.isWasmAccelerated).toBe(true);
    const buf = new SoACursorBuffer(32);
    buf.setCursor(0, {
      x: 100,
      y: 100,
      vx: 5,
      vy: 0,
      speed: 500,
      force: 1200,
      orbit: 90,
      ph: 0,
      curl: 1,
    });
    buf.setCursor(1, {
      x: 108,
      y: 102,
      vx: -3,
      vy: 2,
      speed: 500,
      force: 1200,
      orbit: 90,
      ph: 1,
      curl: -1,
    });

    kernel.stepBoidsSpatialHash(0.016, buf, 2, { x: 200, y: 200 }, 1.0, 1.5);
    const c0 = buf.getCursorPosition(0);
    const c1 = buf.getCursorPosition(1);
    expect(c0.x).not.toBe(100);
    expect(Number.isFinite(c0.x)).toBe(true);
    expect(Number.isFinite(c1.y)).toBe(true);
  });

  it("projects 3D points to 2D screen coordinates in batch using 4x4 ViewProjection matrix", async () => {
    const kernel = await SwarmKernel.create();
    const mat = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
    const pts3d = new Float32Array([0, 0, 0, 0.5, -0.5, 0]);
    const out2d = new Float32Array(4);
    kernel.projectPoints3DBatch(mat, pts3d, out2d, 1000, 800);
    expect(out2d[0]).toBeCloseTo(500, 1);
    expect(out2d[1]).toBeCloseTo(400, 1);
    expect(out2d[2]).toBeCloseTo(750, 1);
    expect(out2d[3]).toBeCloseTo(600, 1);
  });

  it("unlocks child tasks early at earlyUnlockRatio (0.6) and supports multi-agent work-stealing", () => {
    const dag = new DAGTaskScheduler();
    dag.addNode({
      id: "r:card",
      y: 200,
      anchor: { x: 300, y: 200 },
      deps: [],
      earlyUnlockRatio: 0.6,
      maxSquadSize: 2,
    });
    dag.addNode({
      id: "t:card-title",
      y: 220,
      anchor: { x: 320, y: 220 },
      deps: ["r:card"],
      earlyUnlockRatio: 1.0,
      maxSquadSize: 1,
    });

    const a1 = dag.auctionNextTask({ x: 280, y: 190 }, 0, 800);
    expect(a1?.taskId).toBe("r:card");
    expect(a1?.role).toBe("lead");

    const a2 = dag.auctionNextTask({ x: 290, y: 195 }, 0, 800);
    expect(a2?.taskId).toBe("r:card");
    expect(a2?.role).toBe("assistant");

    const unlocked = dag.updateProgress("r:card", 0.65);
    expect(unlocked).toContain("t:card-title");

    const a3 = dag.auctionNextTask({ x: 310, y: 215 }, 0, 800);
    expect(a3?.taskId).toBe("t:card-title");
  });

  it("executes batch Bezier trajectories, spatial task auction, and 3D sculptural mesh deformation in Rust/WASM", () => {
    const kernel = SwarmKernel.createSync();
    expect(kernel.isWasmAccelerated).toBe(true);

    // 1. Batch Bezier Path Evaluator
    const cBuf = new SoACursorBuffer(4);
    const bBuf = new Float32Array(4 * 12);
    // [active, u, dur, speedMult, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y]
    bBuf.set([1, 0, 0.2, 1.0, 100, 100, 140, 110, 180, 130, 220, 160], 0);
    const rem = kernel.stepBezierPathsBatch(0.05, 1.0, cBuf, bBuf, 1);
    expect(rem).toBe(1);
    expect(cBuf.getCursorPosition(0).x).toBeGreaterThan(100);

    // 2. Batch Spatial Task Auction in Rust
    const bids = kernel.auctionTasksBatch(
      [
        { x: 110, y: 120 },
        { x: 115, y: 122 },
      ],
      [
        {
          x: 120,
          y: 125,
          state: 1,
          activeWorkers: 0,
          maxSquad: 3,
          progress: 0,
        },
      ],
      0,
      800,
      1000
    );
    expect(bids[0]?.taskIdx).toBe(0);
    expect(bids[0]?.role).toBe("lead");
    expect(bids[1]?.taskIdx).toBe(0);
    expect(bids[1]?.role).toBe("assistant");

    // 3. Batch 3D Sculptural Mesh Vertex Deformer in Rust
    const baseVerts = new Float32Array([1.5, 0, 0, 0, 1.5, 0, 0, 0, 1.5]);
    const outVerts = new Float32Array(9);
    kernel.deformSculpturalMeshBatch(baseVerts, outVerts, 1.25);
    expect(outVerts[0]).not.toBe(1.5);
    expect(outVerts.every((v) => Number.isFinite(v))).toBe(true);
  });
});
