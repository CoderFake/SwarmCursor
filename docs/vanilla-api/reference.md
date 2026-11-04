# Vanilla JS / TypeScript & Modular Subsystems API Reference

**SwarmCursor 2.0** được thiết kế theo kiến trúc 6 phân hệ độc lập (`@swarm/kernel`, `@swarm/scanner`, `@swarm/three`, `@swarm/tools`, `@swarm/renderers`, `@swarm/react`), dễ dàng mở rộng và sử dụng trong mọi dự án TypeScript/JavaScript hoặc React.

---

## 1. `@swarm/kernel` — Rust/WASM Kernel, SoA Memory & DAG Scheduler

```ts
import {
  SoACursorBuffer,
  WasmSwarmKernel,
  DAGScheduler,
} from "swarm-cursor";

// Bộ đệm Float32Array phẳng (16 floats/cursor) zero-GC
const buffer = new SoACursorBuffer(64);

// Lõi biên dịch Rust -> WebAssembly (Spatial Hash Grid O(N) Boids + 4x4 Matrix Projection)
const kernel = await WasmSwarmKernel.create();
kernel.stepBoids(buffer, dt, targetX, targetY, radiusScale, scrollVel);

// Bộ lập lịch đồ thị phụ thuộc DAG (mở khóa con khi cha đạt 60% tiến độ)
const dag = new DAGScheduler({ earlyUnlockThreshold: 0.6 });
```

---

## 2. `@swarm/scanner` — Deep DOM Scanner & Layout Read Cache

```ts
import { scanDeepDOM, LayoutReadCache } from "swarm-cursor";

// Quét đệ quy toàn bộ cây DOM trong 1 lần đọc layout duy nhất (Zero Layout Thrashing)
const scene = scanDeepDOM(document.getElementById("app")!, 1280, {
  maxDepth: 6,
});
```

---

## 3. `@swarm/three` — 3D / Three.js / GLB Build Algorithms

```ts
import {
  CumulativeAreaSampler,
  compute3DPhaseWeights,
  registerSwarm3D,
  PARTICLE_BUILD_VERTEX_SHADER,
  PARTICLE_BUILD_FRAGMENT_SHADER,
  HOLOGRAPHIC_SLICE_FRAGMENT_CHUNK,
} from "swarm-cursor";

// 1. Lấy mẫu bề mặt tam giác theo diện tích tích lũy (O(log M) binary search)
const sampler = new CumulativeAreaSampler(positions, indices);
const { targets, seeds } = sampler.sampleBatch(3200);

// 2. Đăng ký điều khiển vật thể 3D với tiến trình của đàn chuột
const unregister = registerSwarm3D("my-3d-id", {
  buildMode: "all", // "extrude" | "particles" | "slice" | "all"
  squadSize: 4,
  onProgress: (progress, weights) => {
    // weights = { extrude, particles, slice }
  },
});
```

---

## 4. `@swarm/tools` — Pluggable Tool Registry & Multi-Agent Squads

```ts
import { ToolRegistry, SquadCoordinator } from "swarm-cursor";

// Đăng ký thêm công cụ vẽ tùy chỉnh (mở rộng không cần sửa core engine)
const registry = new ToolRegistry();
registry.register({
  type: "custom-shader",
  defaultCursorTool: "pen",
  supportsSquad: true,
  *runLead(ctx) {
    yield* ctx.wait(0.2);
  },
});
```

---

## 5. `@swarm/renderers` — Zero-React-Tick 60fps Renderers

```ts
import {
  FastCursorLayerController,
  FastOverlayCanvasController,
} from "swarm-cursor";

const cursorCtrl = new FastCursorLayerController(cursorsDiv, {
  showLabels: false,
});
const overlayCtrl = new FastOverlayCanvasController(overlayCanvas);

// Trong vòng lặp requestAnimationFrame:
engine.step(dt);
cursorCtrl.sync(engine);
overlayCtrl.sync(engine);
```

---

## 6. High-Level Helpers (`createSwarm`, `createSwarmFollower`, `createSwarmAgentPill`)

```ts
import {
  createSwarm,
  createSwarmFollower,
  createSwarmAgentPill,
} from "swarm-cursor";
import "swarm-cursor/styles.css";

const swarm = createSwarm({
  container: document.body,
  mode: "dom",
  scrollMode: "hybrid",
  autoScrollSpeed: 180,
  agentPill: { maxIcons: 5, intervalMs: 650, position: "bottom-center" },
});
```
