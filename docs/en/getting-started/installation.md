# Installation, Sub-Packages & Setup (`SwarmCursor 2.0`)

Official Repository: **[https://github.com/CoderFake/SwarmCursor](https://github.com/CoderFake/SwarmCursor)**

---

## 1. Install Package

### From GitHub Repository
```bash
npm install git+https://github.com/CoderFake/SwarmCursor.git
# or pnpm / yarn
pnpm add git+https://github.com/CoderFake/SwarmCursor.git
```

### From Local Workspace / Monorepo
```bash
npm install file:../swarm-cursor
```

---

## 2. Import Stylesheet

Import the CSS file once at your application entry point (`main.tsx`, `App.tsx`, or `app/layout.tsx`):

```tsx
import "swarm-cursor/styles.css";
```

---

## 3. 8 Modular Sub-Packages (Tree-Shakeable Subpath Exports)

SwarmCursor 2.0 is split into independent sub-packages so you can import the full barrel (`swarm-cursor`) or cherry-pick only the subsystem you need:

| Import Path | Responsibility & Key Exports |
| :--- | :--- |
| `swarm-cursor` | Full barrel export of Core, Engine, Kernel, 3D, Scanner, Renderers, Tools & Presets (`buildSwarmLandingScene`) |
| `swarm-cursor/engine` | Modular orchestrator: `SwarmEngine`, `hydrateEngineScene`, `getAvailableTasks`, `pickBestTaskForCursor`, `moveToCoroutine`, `drawRectCoroutine`, `duplicateGroupCoroutine`, `computeElementBounds`, `computeSpacingMeasure` |
| `swarm-cursor/kernel` | **Rust/WASM SIMD128** kernel (`SwarmKernel`, `wasmKernel`, `SoACursorBuffer`, `DAGScheduler`, `stepBoids`, `stepBezierPathsBatch`, `project3DBatch`, `auctionTasksBatch`, `deformSculpturalMeshBatch`) |
| `swarm-cursor/three` | 3D / Three.js / GLB builders: `CumulativeAreaSampler`, `compute3DPhaseWeights`, `registerSwarm3D`, `ProjectionBridge`, `SwarmGLBController`, `PARTICLE_BUILD_*_SHADER`, `HOLOGRAPHIC_SLICE_*` |
| `swarm-cursor/scanner` | Recursive DOM scanner & layout cache: `scanDeepDOM`, `LayoutReadCache` |
| `swarm-cursor/renderers` | Zero-React-Tick 60fps renderers: `FastCursorLayerController`, `FastOverlayCanvasController` |
| `swarm-cursor/tools` | Pluggable Tool Registry, Multi-Agent Squads & 2D Image Builder: `ToolRegistry`, `SquadCoordinator`, `computeImageBuildState` |
| `swarm-cursor/react` | React Components & Hooks: `<SwarmProvider>`, `<SwarmElement>`, `<Swarm3D>`, `<SwarmImage>`, `<SwarmFollower>`, `<SwarmAgentPill>`, `<SwarmCanvas>`, `<SwarmControls>`, `useSwarm`, `useSwarm3D` |
| `swarm-cursor/styles.css` | Stylesheet for cursors, Figma bounding boxes, red snap guides, 3D overlays and 2D image effects |

---

## 4. SSR Compatibility (Next.js App Router / Remix / Astro)

All components in `swarm-cursor/react` and `wasmKernel` are SSR-safe (`typeof window !== "undefined"`). In Next.js App Router, simply place `"use client"` at the top of your wrapper component.

---

## 5. Rebuilding the Rust/WASM SIMD128 Kernel (Optional for Contributors)

`swarm-cursor` ships with the pre-compiled WebAssembly SIMD128 binary embedded (`SWARM_KERNEL_WASM_BASE64`), so **no special Vite/Webpack WASM plugin is required**. To recompile the Rust source in `crates/swarm-kernel-wasm/src/`:

```bash
RUSTFLAGS="-C target-feature=+simd128" cargo build \
  --manifest-path crates/swarm-kernel-wasm/Cargo.toml \
  --target wasm32-unknown-unknown \
  --release

npm run build
```
