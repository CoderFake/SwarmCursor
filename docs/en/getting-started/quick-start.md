# Quick Start in 60 Seconds

Here are the 5 most common integration patterns for **SwarmCursor 2.0**:

---

## Pattern 1: Boids Mouse Follower & Circular Vortex Orbit (`<SwarmFollower />`)

```tsx
import { SwarmFollower } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function App() {
  return (
    <>
      {/* Chases the user's pointer and orbits in a circular vortex when idle */}
      {/* Pass agentPill={true} to display the 5-AI-icon bottom queue bar */}
      <SwarmFollower count={36} radiusScale={1} agentPill={true} />
      <main>Your page content...</main>
    </>
  );
}
```

---

## Pattern 2: Scroll-Driven DOM, Deep DOM, `<Swarm3D>` & `<SwarmImage>` (`<SwarmProvider />`)

```tsx
import {
  SwarmProvider,
  SwarmElement,
  Swarm3D,
  SwarmImage,
  SwarmControls,
} from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function LandingPage() {
  return (
    <SwarmProvider
      scrollMode="hybrid"
      deepScan={true}
      useFastRenderers={true}
      agentPill={{ maxIcons: 5 }}
    >
      {/* 1. Type text with caret + select-all font grow + X-axis red ruler snap */}
      <SwarmElement id="hero-title" tool="text" grow snapAxis="x">
        <h1>SwarmCursor 2.0 Engine</h1>
      </SwarmElement>

      {/* 2. Container recursively scans child h3, p, button, svg into a Parent->Child DAG */}
      <article
        id="feature-card"
        data-swarm="rect"
        data-swarm-deep="true"
        data-swarm-deps="t:hero-title"
      >
        <h3>Deep DOM Auto-DAG</h3>
        <p>Child elements unlock as soon as the parent container reaches 60% progress.</p>
        <button type="button">Explore</button>
      </article>

      {/* 3. Progressive 2D Image Synthesis (mosaic -> halftone -> scanline) */}
      <SwarmImage
        id="project-cover"
        src="/images/cover.webp"
        buildMode="all"
        deps={["r:feature-card"]}
        className="w-full h-64 rounded-2xl"
      />

      {/* 4. 4-Cursor AI Squad sculpts 3D mesh (extrude -> particles -> slice) */}
      <Swarm3D
        id="crystal-orb"
        src="/models/orb.glb"
        buildMode="all"
        squadSize={4}
        deps={["r:feature-card"]}
        className="w-80 h-80"
      >
        <canvas />
      </Swarm3D>

      <SwarmControls position="bottom-right" />
    </SwarmProvider>
  );
}
```

---

## Pattern 3: Built-in Showcase Landing Scene (`<SwarmCanvas />` + `buildSwarmLandingScene`)

```tsx
import { buildSwarmLandingScene } from "swarm-cursor";
import { SwarmCanvas } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function ShowcasePage() {
  return (
    <SwarmCanvas
      scene={() => buildSwarmLandingScene(() => 18)}
      scrollMode="hybrid"
      controls={true}
      agentPill={{ maxIcons: 5, position: "bottom-center" }}
    />
  );
}
```

---

## Pattern 4: Standalone Bottom-Bar 5-AI-Icon Queue (`<SwarmAgentPill />`)

```tsx
import { SwarmAgentPill } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export function BottomStatus() {
  return (
    <SwarmAgentPill
      count={30}
      maxIcons={5}
      intervalMs={650}
      position="bottom-center"
    />
  );
}
```

---

## Pattern 5: High-Speed 3D Mesh Deformation & Boids in Rust/WASM SIMD128 (`swarm-cursor/kernel`)

```ts
import { wasmKernel } from "swarm-cursor/kernel";

// Deform thousands of 3D vertices + analytical normals in a single WASM call
wasmKernel.deformSculpturalMeshBatch(
  basePositionsFloat32,
  outPositionsFloat32,
  outNormalsFloat32,
  timeSeconds,
  pointerX,
  pointerY,
  extrudeWeight,
  sliceWeight,
  slicePlaneY
);
```
