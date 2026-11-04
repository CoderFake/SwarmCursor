# `swarm-cursor`

Multi-agent Figma cursor page-building animation engine for **Vanilla JS / TypeScript** and **React 18 / 19 (Next.js SSR-safe)**, extracted and generalized from `califa.github.io/swarm-site`.

## Features

- **6 Figma Tool Choreographies (ES6 Generator Coroutines)**:
  - `*drawPath` & `*drawLogo`: Pen tool vertex placement, `#0D99FF` vector preview line, vertex handles, and fill transitions.
  - `*drawRect`: Crosshair wireframe drag (`#D9D9D9`) with `W × H` dimensions badge and smooth transition to styled card.
  - `*dragGuide`: Slides out `#2c2c2c` top/left Figma rulers and pulls out `#F24822` red alignment guides.
  - `*drawText`: Crosshair text-box drag, `ibeam` human-cadence typing with blinking caret, stepped font-size growth, and drag-to-snap alignment that flashes the red guide on snap.
  - `*duplicate`: Option-drag group cloning with `dup` double-arrow cursor and live red spacing measurement badges.
  - `*editText`: Double-click select-all (`#0d99ff47`) and retyping on cloned elements.
- **Boids Vortex Flocking & 48px Mouse Repulsion Physics**: Cursors orbit in a 3-lobed vortex before start and after completion, repelling elastically from the user's pointer.
- **3 Scroll Modes**: `'manual'`, `'auto'` (Director autopilot), and `'hybrid'` (autopilot that yields on user scroll and resumes after inactivity).
- **3 Integration Modes**:
  1. **React / Next.js DOM Mode (`<SwarmProvider>` + `<SwarmElement>`)**
  2. **React Virtual Artboard Mode (`<SwarmCanvas>`)**
  3. **Vanilla JS / HTML Mode (`createSwarm()` + `data-swarm`)**

---

## Usage

### 1. React / Next.js (`<SwarmProvider>` + `<SwarmElement>`)

```tsx
import { SwarmProvider, SwarmElement, SwarmControls } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function PortfolioPage() {
  return (
    <SwarmProvider scrollMode="hybrid" controls>
      <SwarmElement id="hero-title" tool="text" grow snapAxis="x">
        <h1 className="text-6xl font-bold">Hoang Dieu — Fullstack Engineer</h1>
      </SwarmElement>

      <SwarmElement id="project-card" tool="rect" deps={["hero-title"]}>
        <div className="p-6 rounded-xl bg-white shadow">Project 1</div>
      </SwarmElement>
    </SwarmProvider>
  );
}
```

### 2. React Virtual Artboard (`<SwarmCanvas>`)

```tsx
import { SwarmCanvas } from "swarm-cursor/react";
import { buildSwarmLandingScene } from "swarm-cursor";
import "swarm-cursor/styles.css";

export default function SwarmLandingDemo() {
  return (
    <SwarmCanvas
      scene={buildSwarmLandingScene}
      scrollMode="hybrid"
      controls={true}
    />
  );
}
```

### 3. Vanilla HTML / JS (`createSwarm`)

```html
<link rel="stylesheet" href="node_modules/swarm-cursor/dist/styles.css" />

<div id="app">
  <h1 id="title" data-swarm="text" data-swarm-grow="true" data-swarm-snap="x">
    Built by AI Agents
  </h1>
  <div id="card" data-swarm="rect" data-swarm-deps="title">Card Body</div>
</div>

<script type="module">
  import { createSwarm } from "swarm-cursor";

  const swarm = createSwarm({
    container: document.getElementById("app"),
    mode: "dom",
    scrollMode: "hybrid",
  });
</script>
```
