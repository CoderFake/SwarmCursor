# SwarmCursor 2.0 — Rust/WASM SIMD128 Kernel, Engine & CSS Reference
---


---

# swarm-cursor/kernel — 5 Parallel Rust/WASM SIMD128 Pipelines

> **Module Badge:** `08 · RUST / WASM SIMD128 KERNEL` · **Section ID:** `wasm-kernel`

The Rust kernel (`crates/swarm-kernel-wasm/src/`) is compiled with `wasm32` SIMD128 (`f32x4`) vector instructions over flat linear memory (`SoACursorBuffer`, 16 floats/cursor), achieving zero garbage collection at 60–120fps.

## Key Concepts & Workflow

### [SIMD 1 & 2] stepBoids & stepBezierPathsBatch
O(N) Uniform Spatial Hash Grid Boids and 4-cursor-per-instruction `f32x4` Cubic Bezier flight solver.

### [SIMD 3 & 4] projectPoints3DBatch & auctionTasksBatch
`f32x4` 4×4 MVP matrix vertex projection and parallel Euclidean + viewport priority task auction.

### [SIMD 5] deformSculpturalMeshBatch
Multi-harmonic 3D mesh displacement (branchless polynomial `sin`/`cos`) in WASM linear memory.

## Modular Architecture in crates/swarm-kernel-wasm & src/kernel

| Prop / Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `boids.rs / boids-ops.ts` | `stepBoidsSpatialHash()` | `O(N) Grid + f32x4` | Reynolds Separation, Alignment, Cohesion + tangential Vortex orbit force. |
| `bezier.rs / bezier-ops.ts` | `stepBezierPathsBatch()` | `4 cursors / cycle` | Evaluates 4 Cubic Bezier trajectories simultaneously with velocity-tangent rotation. |
| `projection.rs / projection-ops.ts` | `projectPoints3DBatch()` | `f32x4 4x4 MVP` | Projects 3D mesh vertices to 2D viewport coordinates for cursor vertex tracking. |
| `auction.rs / auction-ops.ts` | `auctionTasksBatch()` | `f32x4 4 tasks / step` | Scores spatial proximity and viewport priority for conflict-free task assignment. |
| `mesh.rs / mesh-ops.ts` | `deformSculpturalMeshBatch()` | `Zero-copy WASM` | Displaces 3D vertices across harmonic frequencies in a single WASM call. |

## Code Examples

### Using the 5 SIMD128 Batch Operations in swarm-cursor/kernel (`kernel-demo.ts`)

```ts
import {
  wasmKernel,
  SoACursorBuffer,
  DAGScheduler,
} from "swarm-cursor/kernel";

// 1. Flat Structure-of-Arrays buffer (16 floats per cursor)
const buffer = new SoACursorBuffer(64);

// 2. O(N) Spatial Hash Grid Boids & 4-wide f32x4 Cubic Bezier flight
wasmKernel.stepBoidsSpatialHash(dt, buffer, 36, { x: mouseX, y: mouseY }, 1.0);
wasmKernel.stepBezierPathsBatch(dt, 1.0, buffer, bezierCoeffs, 18);

// 3. Batch 4x4 MVP 3D -> 2D screen projection
wasmKernel.projectPoints3DBatch(mvpMatrix16, points3D, outScreenXY, vpWidth, vpHeight);

// 4. Parallel Cursor-to-Task Auction
const assignments = wasmKernel.auctionTasksBatch(cursorPositions, tasks, viewTop, viewBot);

// 5. Real-time 3D Sculptural Mesh Deformation
wasmKernel.deformSculpturalMeshBatch(basePositions, outPositions, timeSeconds);
```

---

# swarm-cursor/engine, Vanilla Helpers & data-swarm-* Attributes

> **Module Badge:** `09 · ENGINE, VANILLA API & HTML ATTRIBUTES` · **Section ID:** `engine-and-attributes`

Use `createSwarm()`, `createSwarmFollower()`, `createSwarmAgentPill()`, or modular `swarm-cursor/engine` coroutines in any Vanilla TypeScript/JavaScript project alongside declarative `data-swarm-*` HTML attributes and `--swarm-*` CSS variables.

## Complete data-swarm-* HTML Attributes Reference

| Prop / Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `data-swarm` | `"rect" \| "text" \| "path" \| "3d" \| "image"` | `—` | Declares the Figma choreography tool used to construct the element. |
| `data-swarm-deep` | `"true"` | `"false"` | Recursively scans child elements and wires a Parent -> Child DAG (60% early unlock). |
| `data-swarm-3d` | `"extrude" \| "particles" \| "slice" \| "all"` | `"all"` | Selects the 3D sculptural build algorithm. |
| `data-swarm-image` | `"mosaic" \| "scanline" \| "halftone" \| "all"` | `"all"` | Selects the 2D image construction algorithm. |
| `data-swarm-squad` | `"2" .. "6"` | `"4"` | Number of AI cursors collaborating simultaneously in a Work-Stealing Squad. |
| `data-swarm-grow / data-swarm-snap` | `"true" / "x" \| "y" \| "xy"` | `undefined` | Select-all font scaling (`grow`) and red ruler guide alignment (`snap`). |

## Code Examples

### Vanilla JS / TS API & Modular Engine Imports (`vanilla-main.ts`)

```ts
import {
  createSwarm,
  createSwarmFollower,
  createSwarmAgentPill,
} from "swarm-cursor";
import {
  SwarmEngine,
  getAvailableTasks,
  pickBestTaskForCursor,
} from "swarm-cursor/engine";
import "swarm-cursor/styles.css";

// Mount DOM-driven swarm in Vanilla JS/TS
const swarm = createSwarm({
  container: document.body,
  mode: "dom",
  scrollMode: "hybrid",
  autoScrollSpeed: 180,
  agentPill: { maxIcons: 5, intervalMs: 650, position: "bottom-center" },
});
```

### Declarative HTML Attributes (data-swarm-*) & CSS Variables (`index.html / theme.css`)

```css
<!-- Declarative HTML attributes -->
<h1 id="title" data-swarm="text" data-swarm-grow="true" data-swarm-snap="x">
  SwarmCursor 2.0
</h1>

<article id="card" data-swarm="rect" data-swarm-deep="true" data-swarm-deps="title">
  <h2>Auto-DAG Deep Container</h2>
  <img src="/cover.webp" data-swarm="image" data-swarm-image="mosaic" />
</article>

<div id="orb" data-swarm="3d" data-swarm-3d="all" data-swarm-squad="4">
  <canvas id="webgl"></canvas>
</div>

/* CSS Custom Properties */
:root {
  --paper: #F8F9FA;
  --ink: #121417;
  --swarm-blue: #0D99FF;
  --swarm-red: #F24822;
}
```
