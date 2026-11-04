import type { DocSection } from "../../types";

export const EN_SUBSYSTEMS: DocSection[] = [
  {
    id: "wasm-kernel",
    category: "subsystems",
    badge: "08 · RUST / WASM SIMD128 KERNEL",
    title: "swarm-cursor/kernel — 5 Parallel Rust/WASM SIMD128 Pipelines",
    summary:
      "The Rust kernel (`crates/swarm-kernel-wasm/src/`) is compiled with `wasm32` SIMD128 (`f32x4`) vector instructions over flat linear memory (`SoACursorBuffer`, 16 floats/cursor), achieving zero garbage collection at 60–120fps.",
    steps: [
      {
        badge: "SIMD 1 & 2",
        title: "stepBoids & stepBezierPathsBatch",
        body: "O(N) Uniform Spatial Hash Grid Boids and 4-cursor-per-instruction `f32x4` Cubic Bezier flight solver.",
      },
      {
        badge: "SIMD 3 & 4",
        title: "projectPoints3DBatch & Child-Subtask auctionTasksBatch",
        body: "`f32x4` 4×4 MVP matrix vertex projection and parallel Euclidean + viewport priority + child-subtask (`priority` & `parentGroup` intra-card locality boost, `MAX_TASKS = 1024`) task auction & work-stealing assistant matcher (`assistSubtaskCoroutine`).",
      },
      {
        badge: "SIMD 5",
        title: "deformSculpturalMeshBatch",
        body: "Multi-harmonic 3D mesh displacement (branchless polynomial `sin`/`cos`) in WASM linear memory.",
      },
    ],
    codeExamples: [
      {
        title: "Using the 5 SIMD128 Batch Operations in swarm-cursor/kernel",
        filename: "kernel-demo.ts",
        code: `import {
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
wasmKernel.deformSculpturalMeshBatch(basePositions, outPositions, timeSeconds);`,
      },
    ],
    propsTable: {
      title: "Modular Architecture in crates/swarm-kernel-wasm & src/kernel",
      rows: [
        {
          name: "boids.rs / boids-ops.ts",
          type: "stepBoidsSpatialHash()",
          defaultVal: "O(N) Grid + f32x4",
          desc: "Reynolds Separation, Alignment, Cohesion + tangential Vortex orbit force.",
        },
        {
          name: "bezier.rs / bezier-ops.ts",
          type: "stepBezierPathsBatch()",
          defaultVal: "4 cursors / cycle",
          desc: "Evaluates 4 Cubic Bezier trajectories simultaneously with velocity-tangent rotation.",
        },
        {
          name: "projection.rs / projection-ops.ts",
          type: "projectPoints3DBatch()",
          defaultVal: "f32x4 4x4 MVP",
          desc: "Projects 3D mesh vertices to 2D viewport coordinates for cursor vertex tracking.",
        },
        {
          name: "auction.rs / auction-ops.ts",
          type: "auctionTasksBatch()",
          defaultVal: "MAX_TASKS = 1024 (8 f32/task)",
          desc: "Parallel spatial auction with child-subtask (`luồng con`) priority boost, intra-card locality affinity, and work-stealing assistant assignment.",
        },
        {
          name: "mesh.rs / mesh-ops.ts",
          type: "deformSculpturalMeshBatch()",
          defaultVal: "Zero-copy WASM",
          desc: "Displaces 3D vertices across harmonic frequencies in a single WASM call.",
        },
      ],
    },
  },
  {
    id: "engine-and-attributes",
    category: "subsystems",
    badge: "09 · ENGINE, VANILLA API & HTML ATTRIBUTES",
    title: "swarm-cursor/engine, Vanilla Helpers & data-swarm-* Attributes",
    summary:
      "Use `createSwarm()`, `createSwarmFollower()`, `createSwarmAgentPill()`, or modular `swarm-cursor/engine` coroutines in any Vanilla TypeScript/JavaScript project alongside declarative `data-swarm-*` HTML attributes and `--swarm-*` CSS variables.",
    codeExamples: [
      {
        title: "Vanilla JS / TS API & Modular Engine Imports",
        filename: "vanilla-main.ts",
        code: `import {
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
});`,
      },
      {
        title: "Declarative HTML Attributes (data-swarm-*) & CSS Variables",
        filename: "index.html / theme.css",
        code: `<!-- Declarative HTML attributes -->
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
}`,
      },
    ],
    propsTable: {
      title: "Complete data-swarm-* HTML Attributes Reference",
      rows: [
        {
          name: "data-swarm",
          type: '"rect" | "text" | "path" | "3d" | "image"',
          defaultVal: "—",
          desc: "Declares the Figma choreography tool used to construct the element.",
        },
        {
          name: "data-swarm-deep",
          type: '"true"',
          defaultVal: '"false"',
          desc: "Recursively scans child elements and wires a Parent -> Child DAG (60% early unlock).",
        },
        {
          name: "data-swarm-3d",
          type: '"extrude" | "particles" | "slice" | "all"',
          defaultVal: '"all"',
          desc: "Selects the 3D sculptural build algorithm.",
        },
        {
          name: "data-swarm-image",
          type: '"mosaic" | "scanline" | "halftone" | "all"',
          defaultVal: '"all"',
          desc: "Selects the 2D image construction algorithm.",
        },
        {
          name: "data-swarm-squad",
          type: '"2" .. "6"',
          defaultVal: '"4"',
          desc: "Number of AI cursors collaborating simultaneously in a Work-Stealing Squad.",
        },
        {
          name: "data-swarm-grow / data-swarm-snap",
          type: '"true" / "x" | "y" | "xy"',
          defaultVal: "undefined",
          desc: "Select-all font scaling (`grow`) and red ruler guide alignment (`snap`).",
        },
      ],
    },
  },
];
