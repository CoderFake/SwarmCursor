# Vanilla JS / TypeScript, Modular Engine & Rust/WASM API Reference

**SwarmCursor 2.0** được thiết kế theo kiến trúc **8 Sub-Packages độc lập (Tree-Shakeable Subpath Exports)**, cho phép bạn import từng phân hệ riêng biệt trong mọi dự án TypeScript/JavaScript hoặc React.

---

## 1. Bảng tổng quan 8 Subpath Exports

```ts
import { ... } from "swarm-cursor";           // Barrel đầy đủ tất cả phân hệ
import { ... } from "swarm-cursor/engine";    // SwarmEngine & các module điều phối
import { ... } from "swarm-cursor/kernel";    // Lõi Rust/WASM SIMD128, SoA Buffer & DAG
import { ... } from "swarm-cursor/three";     // Thuật toán 3D / Three.js / GLB & Shaders
import { ... } from "swarm-cursor/scanner";   // Quét đệ quy DOM & LayoutReadCache
import { ... } from "swarm-cursor/renderers"; // Bộ vẽ 60fps Zero-React-Tick
import { ... } from "swarm-cursor/tools";     // ToolRegistry, SquadCoordinator & Image 2D
import { ... } from "swarm-cursor/react";     // Các React Components & Hooks
```

---

## 2. `swarm-cursor/engine` — Modular Orchestrator & Coroutines

Phân hệ `src/engine/` chia nhỏ `SwarmEngine` thành 6 module chuyên biệt có thể dùng độc lập hoặc mở rộng:

```ts
import {
  SwarmEngine,
  hydrateEngineScene,
  bumpVersion,
  computeElementBounds,
  computeSpacingMeasure,
  triggerSnapGuideFlash,
  getAvailableTasks,
  pickBestTaskForCursor,
  moveToCoroutine,
  waitCoroutine,
  drawRectCoroutine,
  typeTextCoroutine,
  drawPathCoroutine,
  duplicateGroupCoroutine,
  editTextCoroutine,
  dragGuideCoroutine,
} from "swarm-cursor/engine";

// SwarmEngine tự động tái sử dụng singleton `wasmKernel` (Rust/WASM SIMD128)
// và giao việc song cho đàn chuột rảnh qua `wasmKernel.auctionTasksBatch(...)`
const engine = new SwarmEngine({
  initialCursors: 18,
  tempoMultiplier: 0.85,
});
```

---

## 3. `swarm-cursor/kernel` — Rust/WASM SIMD128 Parallel Kernel, SoA Memory & DAG Scheduler

Lõi Rust (`crates/swarm-kernel-wasm/src/`) được biên dịch với tập lệnh vector `wasm32` **SIMD128 (`f32x4`)** và chia thành 5 phép toán xử lý theo lô (batch operations) không cấp phát bộ nhớ (zero-allocation):

| Phương thức trên `wasmKernel` | Module Rust & TS | Mô tả thuật toán |
| :--- | :--- | :--- |
| `stepBoids(buffer, dt, tx, ty, scale, scrollVel)` | `boids.rs` / `boids-ops.ts` | Boids Reynolds 3 quy tắc + lực xoáy Vortex trên lưới băm không gian **Uniform Spatial Hash Grid $O(N)$** sử dụng vector `f32x4`. |
| `stepBezierPathsBatch(buffer, dt)` | `bezier.rs` / `bezier-ops.ts` | Giải đồng thời **4 đường cong Cubic Bezier mỗi chu kỳ lệnh (`f32x4`)** kèm xoay góc mũi tên và giảm chấn lò xo khi con trỏ bay giữa các tác vụ. |
| `project3DBatch(verts3D, count, mvp16, vpW, vpH, out2D)` | `projection.rs` / `projection-ops.ts` | Nhân ma trận `4×4 Model-View-Projection` bằng thanh ghi `f32x4` và chia phối cảnh (`perspective divide`) cho hàng nghìn đỉnh 3D. |
| `auctionTasksBatch(cursorXY, cCount, taskXY, taskPrio, tCount, vTop, vBot, outBest)` | `auction.rs` / `auction-ops.ts` | Đấu giá giao việc song song giữa $C$ con trỏ rảnh và $T$ tác vụ mở khóa (xét4 tác vụ/lần bằng `f32x4` theo khoảng cách Euclid và độ ưu tiên khung nhìn). |
| `deformSculpturalMeshBatch(basePos, outPos, outNorm, time, px, py, extrudeW, sliceW, sliceY)` | `mesh.rs` / `mesh-ops.ts` | Biến dạng mặt cầu điêu khắc 3D đa tầng sóng hài (`sin`/`cos` xấp xỉ đa thức không nhánh) + tính pháp tuyến giải tích (`analytical normals`) trực tiếp trong WASM. |

```ts
import {
  wasmKernel,
  SwarmKernel,
  SoACursorBuffer,
  DAGScheduler,
} from "swarm-cursor/kernel";

// 1. Bộ đệm Float32Array phẳng (16 floats/cursor) zero-GC
const buffer = new SoACursorBuffer(64);

// 2. Bước nhảy vật lý Boids O(N) hoặc bay Bezier SIMD128
wasmKernel.stepBoids(buffer, dt, targetX, targetY, 1.0, scrollVel);
wasmKernel.stepBezierPathsBatch(buffer, dt);

// 3. Biến dạng lưới 3D tốc độ cao cho Three.js BufferGeometry
wasmKernel.deformSculpturalMeshBatch(
  basePositions,
  positionAttr.array as Float32Array,
  normalAttr.array as Float32Array,
  timeSeconds,
  pointerX,
  pointerY,
  weights.extrude,
  weights.slice,
  slicePlaneConstant
);

// 4. Bộ lập lịch đồ thị phụ thuộc DAG (mở khóa con khi cha đạt 60% tiến độ)
const dag = new DAGScheduler({ earlyUnlockThreshold: 0.6 });
```

---

## 4. `swarm-cursor/three` — 3D / Three.js / GLB Build Algorithms

```ts
import {
  CumulativeAreaSampler,
  compute3DPhaseWeights,
  registerSwarm3D,
  ProjectionBridge,
  SwarmGLBController,
  PARTICLE_BUILD_VERTEX_SHADER,
  PARTICLE_BUILD_FRAGMENT_SHADER,
  HOLOGRAPHIC_SLICE_FRAGMENT_CHUNK,
} from "swarm-cursor/three";

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

## 5. `swarm-cursor/scanner` — Deep DOM Scanner & Layout Read Cache

```ts
import { scanDeepDOM, LayoutReadCache } from "swarm-cursor/scanner";

// Quét đệ quy toàn bộ cây DOM trong 1 lần đọc layout duy nhất (Zero Layout Thrashing)
const scene = scanDeepDOM(document.getElementById("app")!, 1280, {
  maxDepth: 6,
});
```

---

## 6. `swarm-cursor/tools` — Pluggable Tool Registry, Multi-Agent Squads & Image Construction (`mosaic` · `scanline` · `halftone`)

```ts
import {
  ToolRegistry,
  SquadCoordinator,
  computeImageBuildState,
} from "swarm-cursor/tools";
import { SceneBuilder } from "swarm-cursor";

// 1. Thêm tác vụ xây dựng ảnh 2D vào SceneBuilder
const builder = new SceneBuilder(1280);
const imgTask = builder.addImage("hero-cover", 120, 200, 560, 340, {
  buildMode: "mosaic", // "mosaic" | "scanline" | "halftone" | "all"
  src: "/assets/cover.webp",
});

// 2. Tính toán trạng thái hiệu ứng xây ảnh theo tiến độ 0..1
const state = computeImageBuildState("all", 0.5);
// state = { activePhase, pixelBlockSize, scanlineRatio, halftoneRadiusScale, blurPx }

// 3. Đăng ký thêm công cụ vẽ tùy chỉnh (mở rộng không cần sửa core engine)
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

## 7. `swarm-cursor/renderers` — Zero-React-Tick 60fps Renderers

```ts
import {
  FastCursorLayerController,
  FastOverlayCanvasController,
} from "swarm-cursor/renderers";

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

## 8. High-Level Helpers (`createSwarm`, `createSwarmFollower`, `createSwarmAgentPill`)

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
