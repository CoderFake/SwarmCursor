# SwarmCursor 2.0 — Getting Started Reference
---


---

# Installation, 8 Sub-Packages & Rust/WASM SIMD128

> **Module Badge:** `01 · SETUP & 8 SUB-PACKAGES` · **Section ID:** `installation`

SwarmCursor 2.0 is architected as 8 independent tree-shakeable sub-packages with an embedded WebAssembly SIMD128 binary that runs out-of-the-box in Vite, Next.js App Router, and Astro.

## Key Concepts & Workflow

### [STEP 1] Install from GitHub / NPM
Install the package into your React 18/19 or Vanilla TypeScript workspace.

### [STEP 2] Import Stylesheet Once
Import `swarm-cursor/styles.css` in `main.tsx` or `App.tsx` to enable cursors, Figma rulers, and 3D/Image shaders.

### [STEP 3] Import Only What You Need
Import the full barrel from `swarm-cursor` or cherry-pick `/engine`, `/kernel`, `/three`, `/scanner`, `/renderers`, `/tools`, `/react`.

## 8 Modular Sub-Packages (Tree-Shakeable Subpath Exports)

| Prop / Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `swarm-cursor` | `Barrel Export` | `All modules` | Full barrel export of Core, Engine, Kernel, 3D, Scanner, Renderers, Tools & `buildSwarmLandingScene`. |
| `swarm-cursor/engine` | `Orchestrator` | `6 modules` | `SwarmEngine`, `hydrateEngineScene`, `getAvailableTasks`, `pickBestTaskForCursor`, `moveToCoroutine`, `drawRectCoroutine`, `duplicateGroupCoroutine`. |
| `swarm-cursor/kernel` | `Rust/WASM SIMD128` | `5 SIMD ops` | `wasmKernel`, `SwarmKernel`, `SoACursorBuffer`, `DAGScheduler` (`stepBoids`, `stepBezierPathsBatch`, `project3DBatch`, `auctionTasksBatch`, `deformSculpturalMeshBatch`). |
| `swarm-cursor/three` | `3D / GLB` | `3 phases` | `CumulativeAreaSampler`, `compute3DPhaseWeights`, `registerSwarm3D`, `ProjectionBridge`, `SwarmGLBController`, GLSL Shaders. |
| `swarm-cursor/scanner` | `DOM Scanner` | `Single-pass` | `scanDeepDOM` & `LayoutReadCache` recursively scan DOM trees into a Parent -> Child DAG with zero layout thrashing. |
| `swarm-cursor/renderers` | `60fps Renderers` | `0 React ticks` | `FastCursorLayerController` (DOM Pool) & `FastOverlayCanvasController` (2D Canvas). |
| `swarm-cursor/tools` | `Tools & Squads` | `Pluggable` | `ToolRegistry`, `SquadCoordinator` (Work-Stealing 2..6 cursors) & `computeImageBuildState`. |
| `swarm-cursor/react` | `React 18/19` | `8 components` | `<SwarmProvider>`, `<SwarmElement>`, `<Swarm3D>`, `<SwarmImage>`, `<SwarmFollower>`, `<SwarmAgentPill>`, `<SwarmCanvas>`, `<SwarmControls>`. |

## Code Examples

### Installation & Stylesheet Import (`terminal / main.tsx`)

```tsx
# Install via npm / pnpm / yarn
npm install git+https://github.com/CoderFake/SwarmCursor.git

// In main.tsx or App.tsx:
import "swarm-cursor/styles.css";
```

### Rebuilding the Rust/WASM SIMD128 Kernel (Optional) (`crates/swarm-kernel-wasm`)

```tsx
RUSTFLAGS="-C target-feature=+simd128" cargo build \
  --manifest-path crates/swarm-kernel-wasm/Cargo.toml \
  --target wasm32-unknown-unknown \
  --release

npm run build
```

---

# 5 Quick-Start Integration Patterns in 60 Seconds

> **Module Badge:** `02 · QUICK START IN 60S` · **Section ID:** `quick-start`

Choose the pattern that fits your app: (1) Boids mouse follower & circular vortex, (2) Scroll-driven DOM/3D/Image builder, (3) Virtual Artboard canvas, (4) 5-AI-icon bottom queue bar, or (5) Direct Rust/WASM SIMD128 kernel calls.

## Key Concepts & Workflow

### [PATTERN 1] Mouse Follower & Vortex
Mount `<SwarmFollower count={36} />` for a flock that chases the pointer and orbits in a circular vortex when idle.

### [PATTERN 2] DOM + Deep Scan + 3D + Image
Wrap your page in `<SwarmProvider deepScan>` with `<Swarm3D>` and `<SwarmImage>` for full multi-agent choreography.

### [PATTERN 3] Virtual Artboard Showcase
Render `<SwarmCanvas scene={buildSwarmLandingScene} />` or author custom scenes with `SceneBuilder`.

## Code Examples

### Patterns 1 & 2: Combining <SwarmProvider>, Deep DOM, <Swarm3D> & <SwarmImage> (`App.tsx`)

```tsx
import {
  SwarmProvider,
  SwarmElement,
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
      <SwarmElement id="hero-title" tool="text" grow snapAxis="x">
        <h1>SwarmCursor 2.0 Engine</h1>
      </SwarmElement>

      <article id="card" data-swarm="rect" data-swarm-deep="true" data-swarm-deps="t:hero-title">
        <h3>Deep DOM Auto-DAG</h3>
        <p>Child elements unlock at 60% parent progress.</p>
        <button type="button">Explore</button>
      </article>

      <SwarmImage
        id="cover"
        src="/images/cover.webp"
        buildMode="all"
        deps={["r:card"]}
      />

      <Swarm3D id="orb" buildMode="all" squadSize={4} deps={["r:card"]}>
        <canvas />
      </Swarm3D>

      <SwarmControls position="bottom-right" />
    </SwarmProvider>
  );
}
```

### Patterns 3, 4 & 5: <SwarmFollower>, <SwarmAgentPill> & wasmKernel (`StandaloneExamples.tsx`)

```tsx
import { SwarmFollower, SwarmAgentPill } from "swarm-cursor/react";
import { wasmKernel } from "swarm-cursor/kernel";

// 1. Standalone Boids Mouse Follower + Bottom 5-AI-Icon Queue Pill
export const FollowerDemo = () => (
  <SwarmFollower count={36} radiusScale={1} agentPill={{ maxIcons: 5 }} />
);

// 2. Standalone Bottom-Bar AI Queue Pill
export const PillOnlyDemo = () => (
  <SwarmAgentPill count={30} maxIcons={5} intervalMs={650} position="bottom-center" />
);

// 3. Direct Rust/WASM SIMD128 Sculptural Mesh Deformation
wasmKernel.deformSculpturalMeshBatch(basePositions, outPositions, timeSeconds);
```
