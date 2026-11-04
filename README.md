# SwarmCursor 2.0

**Compiled Rust/WASM SIMD128 Multi-Agent Figma Cursor Choreography, 3D / Three.js / GLB Builder (`extrude` · `particles` · `slice`), 2D `<SwarmImage>` Builder (`mosaic` · `scanline` · `halftone`), Auto Deep DOM Scanner & Zero-React-Tick 60fps Renderer for React 18/19 & Vanilla TypeScript.**

- **Live Documentation & Interactive Showcase**: **[https://sc-hd.vercel.app/](https://sc-hd.vercel.app/)**
- **Repository**: **[https://github.com/CoderFake/SwarmCursor](https://github.com/CoderFake/SwarmCursor)**
- **Documentation**: **[🇬🇧 English (`docs/en/`)](./docs/en/README.md)** · **[🇻🇳 Tiếng Việt (`docs/vi/`)](./docs/vi/README.md)**
- **AI Coding Agent Skill (`.zip` / `SKILL.md`)**: **[`skills/swarm-cursor/SKILL.md`](./skills/swarm-cursor/SKILL.md)** · **[Download `swarm-cursor-skills.zip`](https://sc-hd.vercel.app/swarm-cursor-skills.zip)**

---

## Key Features in SwarmCursor 2.0

### 1. 3D / Three.js / GLB Sculptural Builders (`swarm-cursor/three`)
Supports **3 sculptural 3D construction algorithms** (usable individually or chained sequentially via `buildMode="all"`):
- **`extrude` (3D Gizmo Sculpt & Wireframe Extrusion)**: The Lead Cursor drags the `X / Y / Z` 3D Gizmo axes to extrude a wireframe bounding cage, projecting 3D vertices directly to 2D screen coordinates (`projectPoints3DBatch`).
- **`particles` (Mesh Surface Area CDF Sampling + GPU Particle Swarm)**: Uniformly samples mesh surface triangles by cumulative area (`CumulativeAreaSampler` $O(\log M)$ binary search) and converges thousands of glowing GPU particles (`PARTICLE_BUILD_VERTEX_SHADER`).
- **`slice` (Holographic 3D Printing / Laser Clipping Plane)**: Assistant Cursors sweep a horizontal laser plane (`THREE.Plane` + `HOLOGRAPHIC_SLICE_FRAGMENT_CHUNK`) from bottom to top, revealing the final PBR / Liquid Glass mesh.

### 2. Recursive Deep DOM Scanner & Early-Unlock DAG (`swarm-cursor/scanner`)
- **`scanDeepDOM(root)` & `LayoutReadCache`**: Recursively traverses inside component containers (`[data-swarm-deep="true"]` or `deepScan={true}`) in a single layout read pass to discover child nodes (`h1..h6`, `p`, `span`, `button`, `input`, `svg/path`, `canvas[data-swarm-3d]`, `img[data-swarm-image]`) and wire a **Parent $\rightarrow$ Child DAG**.
- **Pipelined Early Unlock (`DAGScheduler` @ `60%`)**: As soon as a parent container reaches `60%` construction progress, child cursors immediately unlock and begin typing text, placing SVG anchor points, scanning images, and sculpting 3D stages inside.

### 3. Multi-Agent Work-Stealing Squads (`swarm-cursor/tools`)
- **`SquadCoordinator`**: Allows **2–6 AI cursors** to collaborate simultaneously on a single 3D stage or complex container (`squadSize` / `data-swarm-squad="4"`):
  - **1 Lead Cursor**: Drags the 3D Gizmo X/Y/Z axes or primary wireframe frame.
  - **N Assistant Cursors**: Orbit projected 3D vertices on screen, fire particle-welding beams (`3d-extrude-beam`), and sweep holographic laser planes (`active3DLasers`).

### 4. Progressive 2D Image Construction (`<SwarmImage>` / `data-swarm="image"`)
Provides **3 progressive image synthesis algorithms** inspired by Quadtree Subdivisions, Holographic CRT Rasterization, and Halftone Screen-Printing (usable individually or combined via `buildMode="all"`):
- **`mosaic` (Progressive Quadtree Macro-Block Refinement)**: Refines macro-blocks (`32px` $\rightarrow$ `16px` $\rightarrow$ `8px` $\rightarrow$ `4px` $\rightarrow$ `0px`) while the cursor sweeps diagonally across the frame.
- **`scanline` (Holographic Laser Raster Scan)**: The cursor drags a glowing horizontal laser line (`IMG·SCAN` badge) from top to bottom over a blueprint grid (`clip-path: inset(...)`).
- **`halftone` (Halftone Dot-Matrix Screen-Printing)**: Reconstructs the image through a screen-printed dot matrix before converging to full clarity.
- **`all` (Multi-Pass Image Synthesis)**: Chains `mosaic` $\rightarrow$ `halftone` $\rightarrow$ `scanline`.

```tsx
import { SwarmImage } from "swarm-cursor/react";

<SwarmImage
  id="project-cover"
  src="/images/architecture-cover.webp"
  buildMode="mosaic" // "mosaic" | "scanline" | "halftone" | "all"
  deps={["r:project-card"]}
  className="w-full h-64 rounded-2xl"
/>
```

### 5. Parallel Rust/WASM SIMD128 Kernel & Zero-React-Tick 60fps Renderers (`swarm-cursor/kernel` & `swarm-cursor/renderers`)
- **5 Parallel Compute Pipelines in Rust $\rightarrow$ WebAssembly SIMD128 (`crates/swarm-kernel-wasm/src/`)**:
  1. `stepBoidsSpatialHash`: **$O(N)$ Uniform Spatial Hash Grid Boids** + tangential Vortex orbit on flat `SoACursorBuffer` memory (16 floats/cursor).
  2. `stepBezierPathsBatch`: Solves **4 Cubic Bezier flight trajectories per instruction (`f32x4`)** with velocity-tangent arrow rotation and spring damping.
  3. `projectPoints3DBatch`: Multiplies `4×4 MVP` matrices in `f32x4` registers with perspective divide for thousands of 3D $\rightarrow$ 2D vertices.
  4. `auctionTasksBatch`: Parallel task auction scoring Euclidean distance and viewport priority across 4 tasks per SIMD step.
  5. `deformSculpturalMeshBatch`: Multi-harmonic 3D sculptural mesh displacement (branchless polynomial `sin`/`cos`) directly in WASM linear memory.
- **Zero-React-Tick 60fps Renderers (`swarm-cursor/renderers`)**:
  - `FastCursorLayerController`: Fixed DOM pool updating cursor transforms via `translate3d(x, y, 0)`.
  - `FastOverlayCanvasController`: Renders all `#0D99FF` selection boxes, `#F24822` red snap guides, 3D Gizmo axes, and laser beams on a single 2D `<canvas>`.

---

## Installation & 8 Modular Sub-Packages

```bash
npm install git+https://github.com/CoderFake/SwarmCursor.git
```

SwarmCursor 2.0 is architected into **8 independent tree-shakeable sub-packages**:

| Sub-package Import | Responsibility & Key Exports |
|---|---|
| `swarm-cursor` | Full barrel export of Core, Engine, Kernel, 3D, Scanner, Renderers, Tools & `buildSwarmLandingScene` |
| `swarm-cursor/engine` | Modular `SwarmEngine` orchestrator (`SwarmEngine`, `scheduler`, `cursor-motion`, `tool-coroutines`, `bounds-and-overlays`, `scene-loader`) |
| `swarm-cursor/kernel` | **Rust/WASM SIMD128** kernel (`SwarmKernel`, `wasmKernel`, `SoACursorBuffer`, `DAGScheduler`, `boids-ops`, `bezier-ops`, `projection-ops`, `auction-ops`, `mesh-ops`) |
| `swarm-cursor/three` | 3D / Three.js / GLB integration (`CumulativeAreaSampler`, `ProjectionBridge`, `PARTICLE_BUILD_*_SHADER`, `SwarmGLBController`) |
| `swarm-cursor/scanner` | Recursive DOM scanner & layout read cache (`scanDeepDOM`, `LayoutReadCache`) |
| `swarm-cursor/renderers` | Zero-React-Tick 60fps renderers (`FastCursorLayerController`, `FastOverlayCanvasController`) |
| `swarm-cursor/tools` | Pluggable Tool Registry, Multi-Agent Squads & 2D Image Builder (`ToolRegistry`, `SquadCoordinator`, `three-tools`, `image-tools`) |
| `swarm-cursor/react` | React 18/19 Components (`<SwarmProvider>`, `<SwarmElement>`, `<Swarm3D>`, `<SwarmImage>`, `<SwarmFollower>`, `<SwarmAgentPill>`, `<SwarmCanvas>`, `<SwarmControls>`) |
| `swarm-cursor/styles.css` | Standard stylesheet for cursors, selection boxes, rulers, and 3D/Image shaders |

---

## Quick Start

### 1. DOM-Driven Mode + Deep DOM + `<Swarm3D>` + `<SwarmImage>` (React)

```tsx
import {
  SwarmProvider,
  Swarm3D,
  SwarmImage,
  SwarmControls,
} from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function App() {
  return (
    <SwarmProvider
      scrollMode="hybrid"
      deepScan={true}
      fastMode={true}
      agentPill={{ maxIcons: 5, position: "bottom-center" }}
    >
      {/* Container recursively scans child h2, p, button, svg into a Parent -> Child DAG */}
      <article id="hero-card" data-swarm="rect" data-swarm-deep="true">
        <h2>Autonomous 3D & UI Engineering</h2>
        <p>AI cursors automatically frame, type, and sculpt 3D & 2D assets.</p>
        <button type="button">Explore Architecture</button>
      </article>

      {/* 2D Image synthesized via Quadtree Mosaic / Laser Scanline / Halftone */}
      <SwarmImage
        id="hero-cover"
        src="/images/architecture-cover.webp"
        buildMode="mosaic"
        deps={["r:hero-card"]}
        className="w-full h-64 rounded-2xl"
      />

      {/* 3D / GLB mesh sculpted by a 4-cursor squad across 3 phases */}
      <Swarm3D
        id="crystal-orb-3d"
        src="/models/crystal-orb.glb"
        buildMode="all"
        squadSize={4}
        deps={["r:hero-card"]}
        className="w-96 h-96"
      >
        <canvas />
      </Swarm3D>

      <SwarmControls position="bottom-right" />
    </SwarmProvider>
  );
}
```

### 2. Custom Three.js / WebGL Integration (`registerSwarm3D` + `wasmKernel`)

```tsx
import * as THREE from "three";
import {
  registerSwarm3D,
  CumulativeAreaSampler,
  PARTICLE_BUILD_VERTEX_SHADER,
  PARTICLE_BUILD_FRAGMENT_SHADER,
} from "swarm-cursor/three";
import { wasmKernel } from "swarm-cursor/kernel";

// 1. Sample 3,200 surface particles uniformly by triangle area in O(log M)
const sampler = new CumulativeAreaSampler(
  positionsFloat32,
  indicesUint32,
  [-2.1, -2.1, -2.1],
  [2.1, 2.1, 2.1]
);
const { targets, seeds } = sampler.sampleBatch(3200);

// 2. Register with SwarmEngine so a 4-cursor squad drives the 3 build phases
const unregister = registerSwarm3D("dom-orb-sphere", {
  buildMode: "all",
  squadSize: 4,
  boundingBox: { min: [-2.1, -2.1, -2.1], max: [2.1, 2.1, 2.1] },
  onProgress: (progress, weights) => {
    wireframeCage.material.opacity = weights.extrude * 0.65;
    particleMat.uniforms.uBuildProgress.value = Math.max(weights.particles, progress);
    slicePlane.constant = -2.3 + weights.slice * 4.7;
  },
});

// 3. In your animation loop: deform 3D vertices via Rust/WASM SIMD128
wasmKernel.deformSculpturalMeshBatch(
  basePositions,
  posAttr.array as Float32Array,
  time
);
```

### 3. Built-in Virtual Artboard Showcase (`buildSwarmLandingScene`)

```tsx
import { buildSwarmLandingScene } from "swarm-cursor";
import { SwarmCanvas } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export function ShowcaseLanding() {
  return (
    <SwarmCanvas
      scene={() => buildSwarmLandingScene(() => 18)}
      scrollMode="hybrid"
      controls={true}
      agentPill={{ maxIcons: 5 }}
    />
  );
}
```

---

## Bilingual Documentation (`docs/en/` & `docs/vi/`)

- **Live Interactive Docs Portal**: **[https://sc-hd.vercel.app/](https://sc-hd.vercel.app/)**
- **Documentation Overview**: **[`docs/README.md`](./docs/README.md)**
- **🇬🇧 English Documentation ([`docs/en/README.md`](./docs/en/README.md))**
  - [Installation, 8 Sub-Packages & Rust/WASM Setup](./docs/en/getting-started/installation.md)
  - [Quick Start in 60 Seconds](./docs/en/getting-started/quick-start.md)
  - [`<SwarmProvider>` & `<SwarmElement>`](./docs/en/components/swarm-provider.md)
  - [`<Swarm3D>` & `registerSwarm3D` (`extrude` · `particles` · `slice`)](./docs/en/components/swarm-3d.md)
  - [`<SwarmImage>` (`mosaic` · `scanline` · `halftone`)](./docs/en/components/swarm-image.md)
  - [`<SwarmFollower>` (Mouse Follow & Circular Vortex Orbit)](./docs/en/components/swarm-follower.md)
  - [`<SwarmAgentPill>` (Bottom-Bar 5-AI-Icon Queue + `{N} agents`)](./docs/en/components/swarm-agent-pill.md)
  - [`<SwarmCanvas>`, `SceneBuilder` & `buildSwarmLandingScene`](./docs/en/components/swarm-canvas.md)
  - [`<SwarmControls>` & `useSwarm()` Hook](./docs/en/components/swarm-controls.md)
  - [8 Sub-Packages & Rust/WASM SIMD128 API Reference](./docs/en/subsystems/reference.md)
  - [`data-swarm-*` HTML Attributes, CSS Variables & 9 AI Icons](./docs/en/customization/theming-and-attributes.md)
- **🇻🇳 Tài liệu Tiếng Việt ([`docs/vi/README.md`](./docs/vi/README.md))**

---

## License

MIT © [CoderFake](https://github.com/CoderFake/SwarmCursor)
