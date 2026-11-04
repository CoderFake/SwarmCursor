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
});
