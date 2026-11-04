# `<Swarm3D>` & `registerSwarm3D` (`swarm-cursor/three`)

**3D Sculptural Mesh, Three.js & GLB Builder (`extrude` · `particles` · `slice`) with Multi-Agent Squads.**

---

## 1. Three Construction Algorithms (`buildMode`)

- **`extrude` (3D Gizmo Sculpt & Wireframe Extrusion)**: The Lead Cursor drags the `X / Y / Z` 3D Gizmo axes to extrude a wireframe bounding cage, projecting 3D vertices to 2D screen coordinates (`projectPoints3DBatch`).
- **`particles` (Mesh Surface Area CDF Sampling + GPU Particle Swarm)**: Samples mesh triangles uniformly by area in $O(\log M)$ (`CumulativeAreaSampler`) and converges thousands of glowing GPU particles (`PARTICLE_BUILD_VERTEX_SHADER`).
- **`slice` (Holographic 3D Printing / Laser Clipping Plane)**: Assistant Cursors sweep a horizontal laser plane (`THREE.Plane` + `HOLOGRAPHIC_SLICE_FRAGMENT_CHUNK`) from bottom to top, revealing the final PBR / Liquid Glass material.
- **`all` (Multi-Phase Pipeline)**: Sequentially chains `extrude` $\rightarrow$ `particles` $\rightarrow$ `slice`.

---

## 2. Declarative React Component (`<Swarm3D>`)

```tsx
import { Swarm3D } from "swarm-cursor/react";

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
```

---

## 3. Integrating with Custom Three.js / WebGL Scenes (`registerSwarm3D`)

```tsx
import {
  registerSwarm3D,
  CumulativeAreaSampler,
  PARTICLE_BUILD_VERTEX_SHADER,
  PARTICLE_BUILD_FRAGMENT_SHADER,
} from "swarm-cursor/three";
import { wasmKernel } from "swarm-cursor/kernel";

const sampler = new CumulativeAreaSampler(positionsFloat32, indicesUint32);
const { targets, seeds } = sampler.sampleBatch(3200);

const unregister = registerSwarm3D("crystal-orb-3d", {
  buildMode: "all",
  squadSize: 4,
  boundingBox: { min: [-2.1, -2.1, -2.1], max: [2.1, 2.1, 2.1] },
  onProgress: (progress, weights) => {
    wireframeCage.material.opacity = weights.extrude * 0.65;
    particleMat.uniforms.uBuildProgress.value = Math.max(weights.particles, progress);
    slicePlane.constant = -2.3 + weights.slice * 4.7;
  },
});
```
