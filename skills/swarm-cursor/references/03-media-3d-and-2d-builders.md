# SwarmCursor 2.0 — 3D (Three.js / GLB) & 2D Image Builders Reference
---


---

# <Swarm3D> & registerSwarm3D (extrude · particles · slice)

> **Module Badge:** `04 · 3D / THREE.JS / GLB BUILDER` · **Section ID:** `swarm-3d`

Provides 3 sculptural 3D / Three.js / GLB construction algorithms powered by 2–6 collaborating AI cursors (`SquadCoordinator`): 3D Gizmo wireframe extrusion (`extrude`), O(log M) surface triangle particle sampling (`particles`), and holographic laser clipping (`slice`).

## Key Concepts & Workflow

### [PHASE 1 · EXTRUDE] 3D Gizmo & Wireframe Cage
Lead Cursor drags the X/Y/Z 3D Gizmo axes to extrude the wireframe bounding cage, projecting 3D vertices to 2D.

### [PHASE 2 · PARTICLES] CDF Surface Particle Swarm
`CumulativeAreaSampler` uniformly samples mesh triangles in O(log M) for GPU particle convergence.

### [PHASE 3 · SLICE] Holographic Laser Slice
Assistant Cursors sweep holographic laser clipping planes (`active3DLasers`) from bottom to top.

## <Swarm3D> & registerSwarm3D Options

| Prop / Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string (required)` | `—` | Unique 3D task identifier (registers `3d:${id}` in the DAG). |
| `buildMode` | `"extrude" \| "particles" \| "slice" \| "all"` | `"all"` | Single 3D build algorithm or multi-phase pipeline (`all`). |
| `squadSize` | `number (2..6)` | `4` | Number of AI cursors collaborating simultaneously (`1` Lead + `N-1` Assistants). |
| `onProgress` | `(progress: number, weights: Phase3DWeights) => void` | `undefined` | Per-frame callback providing `progress` (0..1) and `{ extrude, particles, slice }` weights. |

## Code Examples

### Integrating <Swarm3D> & registerSwarm3D with Three.js + wasmKernel (`CrystalOrb3D.tsx`)

```tsx
import { Swarm3D } from "swarm-cursor/react";
import { registerSwarm3D, CumulativeAreaSampler } from "swarm-cursor/three";
import { wasmKernel } from "swarm-cursor/kernel";

// 1. Declarative React Wrapper
<Swarm3D
  id="crystal-orb-3d"
  src="/models/crystal-orb.glb"
  buildMode="all" // "extrude" | "particles" | "slice" | "all"
  squadSize={4}
  deps={["r:hero-card"]}
  className="w-96 h-96"
>
  <canvas ref={canvasRef} />
</Swarm3D>

// 2. Inside Three.js useEffect: receive live phase weights & deform mesh in WASM SIMD128
const unregister = registerSwarm3D("crystal-orb-3d", {
  buildMode: "all",
  squadSize: 4,
  onProgress: (progress, weights) => {
    wireframeCage.material.opacity = weights.extrude * 0.65;
    particleUniforms.uBuildProgress.value = Math.max(weights.particles, progress);
    slicePlane.constant = -2.3 + weights.slice * 4.7;
  },
});
```

---

# <SwarmImage> (mosaic · scanline · halftone · all)

> **Module Badge:** `05 · 2D IMAGE SYNTHESIS` · **Section ID:** `swarm-image`

Provides 3 progressive 2D image synthesis algorithms inspired by Quadtree Subdivisions (`mosaic`), Holographic CRT Laser Rasterization (`scanline`), and Halftone Screen-Printing (`halftone`), or all 3 combined via `buildMode="all"`.

## Key Concepts & Workflow

### [MODE: MOSAIC] Quadtree Pixelation Refinement
Refines macro-blocks (`32px -> 16px -> 8px -> 4px -> 0px`) as the cursor sweeps diagonally across the image.

### [MODE: SCANLINE] Holographic Laser Raster Scan
Cursor drags a horizontal laser beam with `IMG·SCAN` badge from top to bottom over a blueprint grid.

### [MODE: HALFTONE] Dot-Matrix Screen Printing
Synthesizes the image through a screen-printed dot matrix before converging to full clarity.

## <SwarmImage> Props Reference

| Prop / Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id / src` | `string (required)` | `—` | Unique image task ID (`img:${id}`) and source URL. |
| `buildMode` | `"mosaic" \| "scanline" \| "halftone" \| "all"` | `"all"` | Image synthesis algorithm: Quadtree blocks (`mosaic`), laser sweep (`scanline`), dot matrix (`halftone`), or all 3 (`all`). |
| `deps` | `string[]` | `undefined` | Prerequisite task IDs before image construction begins. |

## Code Examples

### Using <SwarmImage> in React or data-swarm="image" in HTML (`ProjectGallery.tsx`)

```tsx
import { SwarmImage } from "swarm-cursor/react";
import { computeImageBuildState } from "swarm-cursor/tools";

export function ProjectGallery() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <SwarmImage
        id="img-mosaic"
        src="/images/project-1.webp"
        buildMode="mosaic"
        className="w-full h-56 rounded-2xl"
      />
      <SwarmImage
        id="img-scanline"
        src="/images/project-2.webp"
        buildMode="scanline"
        deps={["img:img-mosaic"]}
        className="w-full h-56 rounded-2xl"
      />
      <SwarmImage
        id="img-all"
        src="/images/project-3.webp"
        buildMode="all"
        deps={["img:img-scanline"]}
        className="w-full h-56 rounded-2xl"
      />
    </div>
  );
}
```
