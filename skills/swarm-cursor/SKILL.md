---
name: swarm-cursor
description: Multi-agent AI cursor choreography library for React 18/19 DOM layouts, Three.js/GLB 3D meshes, and 2D images powered by Rust/WASM SIMD128. Activate this skill when installing, integrating, customizing, or optimizing swarm-cursor in any web or React application.
---

# SwarmCursor 2.0 — AI Coding Agent Skill

Use this skill whenever the user asks to integrate, configure, customize, or optimize **SwarmCursor 2.0** (`swarm-cursor`) — the compiled Rust/WASM SIMD128 multi-agent Figma cursor choreography engine for React DOM, Three.js/GLB 3D models, and progressive 2D image construction.

---

## 1. Installation & Required CSS

Install directly from GitHub:

```bash
npm install git+https://github.com/CoderFake/SwarmCursor.git
# Optional peer dependency for 3D / GLB mesh construction:
npm install three @types/three
```

Always import the core stylesheet once in the application entry file (`main.tsx`, `App.tsx`, or `layout.tsx`):

```tsx
import "swarm-cursor/styles.css";
```

---

## 2. Sub-Package Architecture (8 Entry Points)

Choose the most specific entry point for tree-shaking and clean modular architecture:

| Import Path | Exports & Purpose |
| :--- | :--- |
| `swarm-cursor` | Full bundle re-exporting all engines, kernels, tools, and React components |
| `swarm-cursor/react` | `SwarmProvider`, `SwarmElement`, `SwarmCanvas`, `SwarmFollower`, `SwarmAgentPill`, `SwarmControls`, `Swarm3D`, `SwarmImage`, `RulersOverlay`, `useSwarm` |
| `swarm-cursor/three` | `Swarm3DBuilder`, `createSwarm3DStage`, `extractMeshTargets`, `loadGLBTargets` (Three.js & GLB 3-stage pipeline) |
| `swarm-cursor/tools` | `SwarmImageBuilder`, `PenPathTool` (2D progressive image scanner & cubic Bezier pen tool) |
| `swarm-cursor/kernel` | `SwarmKernel`, `wasmKernel` (Compiled Rust/WASM SIMD128 Spatial Hash Boids & Hungarian O(n³) task assignment) |
| `swarm-cursor/engine` | `SwarmEngine`, `AutoScrollController`, `isTaskDependencySatisfied`, `pickBestTaskForCursor` |
| `swarm-cursor/scanner` | `scanDeepDOMElements`, `DOMLayoutCache` (Recursive DOM-to-DAG scanner) |
| `swarm-cursor/renderers` | `FastCursorLayerController`, `FastOverlayCanvasController` (Zero-React-tick 60–120fps direct DOM + 2D Canvas renderers) |

---

## 3. Choosing the Right Integration Mode

1. **Mode A — DOM-Driven React Wrapper (`<SwarmProvider>` + `<SwarmElement>` / `data-swarm`)** *(Recommended for websites & apps)*:
   - Wrap your existing React page in `<SwarmProvider scrollMode="hybrid" deepScan={true} fastMode={true} controls={true}>`.
   - Annotate key structural cards/containers/headings with `data-swarm="rect"`, `data-swarm="text"`, `data-swarm="path"`, `data-swarm="3d"`, or `data-swarm="image"` (or use `<SwarmElement id="..." tool="rect">`).
2. **Mode B — Fixed 1440px Artboard (`<SwarmCanvas>` + `SceneBuilder`)**:
   - Use when building a Figma-style interactive artboard showcase with explicit `(x, y, w, h)` scene coordinates.
3. **Mode C — Ambient Mouse Follower (`<SwarmFollower>`)**:
   - Lightweight decorative cursor flock that orbits the user's pointer without scanning or modifying DOM elements.
4. **Figma Alt+Drag Clone (`dup`) + Select-All Re-Type (`edit`) Choreography**:
   - Group sibling cards into a `SwarmDupGroup` (`d:${groupId}:${k}` task with `duplicateGroupCoroutine`) and wire each cloned card's title text to an `edit` task (`e:${titleId}` with `editTextCoroutine` depending on `d:${groupId}:${k}`).
   - The cursor Alt+Drags (`cursor.shape = "dup"`) the cloned card from the source card with red Figma spacing guides (`#F24822`), then double-clicks the cloned title (`el.selAll = true` -> `.text-sel` highlight) and re-types the new title (`engine.type(el, el.text, true)`).

---

## 4. Critical Performance & Memory-Safety Rules for AI Agents

When writing custom integrations with `SwarmEngine`, `SwarmKernel`, or Three.js WebGL stages, ALWAYS follow these rules:

1. **Promote ONLY primary card/section titles for `text` / `edit` tasks**:
   - Keep body descriptions, tags, and metadata native inside their parent `[data-swarm]` card so they reveal with the parent card's `clip-path`. Promote only the card's primary title (`h2`/`h3`/`strong`) when you want live typing or Alt+Drag Clone + Select-All Re-Type (`dup` + `edit`) choreography, updating `.textContent` and `.text-sel` directly in `requestAnimationFrame` with zero React re-renders per character.
2. **Isolate `MutationObserver` from cursor and overlay layers**:
   - If observing DOM changes to register dynamic `[data-swarm]` nodes, observe ONLY the content container `<div ref={contentRef}>{children}</div>`, NEVER the parent wrapper containing `.cursors` or construction ghost layers.
3. **Use Zero-React-Tick Renderers (`FastCursorLayerController` + `FastOverlayCanvasController`)**:
   - Never trigger React `setState` on every 60fps animation frame for cursor positions or rectangle drag progress.
4. **Parallel Rust/WASM `wasmKernel.auctionTasksBatch` & Singleton `wasmKernel`**:
   - `SwarmEngine` automatically uses the singleton `wasmKernel` (`import { wasmKernel } from "swarm-cursor/kernel"`) and dispatches idle cursors to available viewport tasks in parallel via `wasmKernel.auctionTasksBatch(...)` (`crates/swarm-kernel-wasm/src/auction.rs`). Never instantiate a new `SwarmKernel` on every frame or component re-render.
5. **Strict Viewport Entry Gating & Off-Screen Loop Pausing**:
   - Gate below-the-fold sections until the user actually scrolls (`scrollY > 64` and `rect.top <= vh * 0.72`) so off-screen sections never build prematurely while idle at the top of the page.
   - Pause `requestAnimationFrame` when `engine.flocking === true` (all tasks done), when `document.hidden === true`, or when a 3D WebGL canvas leaves the viewport (`IntersectionObserver`).

---

## 5. Detailed Reference Documentation & Examples

Read these reference files in this skill directory for complete prop tables, HTML attribute specs, and copy-pasteable code patterns:

- [`references/01-getting-started.md`](./references/01-getting-started.md) — Installation, 8 sub-packages, and Quick Start for all 3 integration modes.
- [`references/02-dom-and-react-components.md`](./references/02-dom-and-react-components.md) — `SwarmProvider`, `SwarmElement`, `SwarmCanvas`, `SwarmFollower`, `SwarmAgentPill`, and `SwarmControls`.
- [`references/03-media-3d-and-2d-builders.md`](./references/03-media-3d-and-2d-builders.md) — `Swarm3D` (Three.js & GLB 3-stage pipeline: wireframe, GPU particles, holographic slice) and `SwarmImage` (mosaic, scanline, halftone).
- [`references/04-wasm-engine-and-theming.md`](./references/04-wasm-engine-and-theming.md) — `wasmKernel` SIMD128 API, `SwarmEngine`, `scanDeepDOMElements`, `data-swarm-*` attributes, and CSS custom properties.
- [`examples/dom-provider-quickstart.tsx`](./examples/dom-provider-quickstart.tsx) — Complete React landing page using `SwarmProvider` and `SwarmElement`.
- [`examples/threejs-glb-3d-builder.tsx`](./examples/threejs-glb-3d-builder.tsx) — Three.js + GLB 3D progressive construction example.
- [`examples/zero-react-tick-custom-stage.tsx`](./examples/zero-react-tick-custom-stage.tsx) — High-performance custom stage using `SwarmEngine`, `FastCursorLayerController`, and `FastOverlayCanvasController`.
