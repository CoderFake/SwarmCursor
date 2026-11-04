# Vanilla JS / TypeScript, Modular Engine & Rust/WASM API Reference

**SwarmCursor 2.0** is engineered around **8 independent sub-packages (Tree-Shakeable Subpath Exports)** that work in any TypeScript/JavaScript or React application.

---

## 1. 8 Subpath Exports Overview

```ts
import { ... } from "swarm-cursor";           // Full barrel export
import { ... } from "swarm-cursor/engine";    // Modular SwarmEngine & coroutines
import { ... } from "swarm-cursor/kernel";    // Rust/WASM SIMD128 kernel, SoA Buffer & DAG
import { ... } from "swarm-cursor/three";     // 3D / Three.js / GLB algorithms & Shaders
import { ... } from "swarm-cursor/scanner";   // Deep DOM scanner & LayoutReadCache
import { ... } from "swarm-cursor/renderers"; // Zero-React-Tick 60fps renderers
import { ... } from "swarm-cursor/tools";     // ToolRegistry, SquadCoordinator & 2D Image Builder
import { ... } from "swarm-cursor/react";     // React Components & Hooks
```

---

## 2. `swarm-cursor/engine` — Modular Orchestrator & Coroutines

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
  dragGuideCoroutine,
} from "swarm-cursor/engine";

const engine = new SwarmEngine({
  workerCount: 18,
  speedMultiplier: 1,
});
```

---

## 3. `swarm-cursor/kernel` — Rust/WASM SIMD128 Parallel Kernel, SoA Memory & DAG Scheduler

The Rust kernel (`crates/swarm-kernel-wasm/src/`) is compiled with `wasm32` **SIMD128 (`f32x4`)** instructions and organized into 5 zero-allocation batch pipelines:

| `wasmKernel` Method | Rust & TS Module | Algorithm Description |
| :--- | :--- | :--- |
| `stepBoids(buffer, dt, tx, ty, scale, scrollVel)` | `boids.rs` / `boids-ops.ts` | Reynolds Boids + tangential Vortex orbit on an **$O(N)$ Uniform Spatial Hash Grid** using `f32x4` SIMD lanes. |
| `stepBezierPathsBatch(buffer, dt)` | `bezier.rs` / `bezier-ops.ts` | Evaluates **4 Cubic Bezier flight paths per instruction (`f32x4`)** with velocity-tangent arrow rotation and spring damping. |
| `project3DBatch(verts3D, count, mvp16, vpW, vpH, out2D)` | `projection.rs` / `projection-ops.ts` | `4×4 Model-View-Projection` matrix multiplication in `f32x4` registers with perspective divide for thousands of 3D vertices. |
| `auctionTasksBatch(cursorXY, cCount, taskXY, taskPrio, tCount, vTop, vBot, outBest)` | `auction.rs` / `auction-ops.ts` | Parallel task auction between $C$ idle cursors and $T$ unlocked tasks (scoring 4 tasks at once in `f32x4` by Euclidean distance + viewport priority). |
| `deformSculpturalMeshBatch(basePos, outPos, outNorm, time, px, py, extrudeW, sliceW, sliceY)` | `mesh.rs` / `mesh-ops.ts` | Multi-harmonic 3D sculptural sphere deformation (branchless polynomial `sin`/`cos`) + analytical surface normals directly in WASM linear memory. |

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

const sampler = new CumulativeAreaSampler(positions, indices);
const { targets, seeds } = sampler.sampleBatch(3200);

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

// Recursively scans the DOM tree in a single layout read pass (Zero Layout Thrashing)
const scene = scanDeepDOM(document.getElementById("app")!, 1280, {
  maxDepth: 6,
});
```

---

## 6. `swarm-cursor/tools` — Pluggable Tool Registry, Multi-Agent Squads & 2D Image Construction

```ts
import {
  ToolRegistry,
  SquadCoordinator,
  computeImageBuildState,
} from "swarm-cursor/tools";

const state = computeImageBuildState("all", 0.5);
// state = { activePhase, pixelBlockSize, scanlineRatio, halftoneRadiusScale, blurPx }
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
```
