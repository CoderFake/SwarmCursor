# SwarmCursor 2.0 — DOM & React Components Reference
---


---

# <SwarmProvider> & <SwarmElement> (DOM-Driven & Deep DOM DAG)

> **Module Badge:** `03 · DOM-DRIVEN & DEEP SCAN` · **Section ID:** `swarm-provider`

Preserves your existing React/Tailwind markup. With `deepScan={true}`, `scanDeepDOM` traverses child nodes (`h1..h6`, `p`, `span`, `button`, `svg/path`, `canvas`) in a single layout read pass and unlocks child tasks as soon as the parent container reaches 60% progress.

## Key Concepts & Workflow

### [TOOL: TEXT] Type Tool + Grow + Snap
`tool="text"` types with a blinking caret; `grow` selects all and drags font size; `snapAxis` pulls a red ruler guide.

### [TOOL: RECT] Rectangle Wireframe + Deep DAG
`data-swarm="rect" data-swarm-deep="true"` drags a wireframe box with W×H badge and auto-schedules child nodes.

### [TOOL: PATH] Vector Pen Anchor Tool
`tool="path"` places `5×5` vector anchor points along `<svg>` paths and closes the contour.

## <SwarmProvider> & <SwarmElement> Props Reference

| Prop / Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `scrollMode` | `"manual" \| "auto" \| "hybrid"` | `"manual"` | Scroll mode: user-driven (`manual`), automatic (`auto`), or auto-scroll that yields on user wheel (`hybrid`). |
| `deepScan` | `boolean` | `false` | Enables `scanDeepDOM` recursive child traversal inside `[data-swarm-deep="true"]` containers. |
| `fastMode` | `boolean` | `true` | Uses `FastCursorLayerController` + `FastOverlayCanvasController` for 60fps zero-React-tick rendering. |
| `tool (SwarmElement)` | `"rect" \| "text" \| "path"` | `"rect"` | Figma cursor tool used to construct the element (`rect`, `text`, or `path`). |
| `grow / snapAxis` | `boolean / "x" \| "y" \| "xy"` | `false / undefined` | `grow`: types small then selects all to scale up. `snapAxis`: drags red alignment guides from rulers. |

## Code Examples

### Configuring <SwarmProvider> & <SwarmElement> (`PortfolioStage.tsx`)

```tsx
import { SwarmProvider, SwarmElement, SwarmControls } from "swarm-cursor/react";

export function PortfolioStage() {
  return (
    <SwarmProvider
      scrollMode="hybrid"
      autoScrollSpeed={180}
      deepScan={true}
      fastMode={true}
      showCursorLabels={true}
      agentPill={{ maxIcons: 5, position: "bottom-center" }}
    >
      <SwarmElement id="sec-title" tool="text" grow snapAxis="x">
        <h2>Creative Systems Engineering</h2>
      </SwarmElement>

      <div
        id="bento-card"
        data-swarm="rect"
        data-swarm-deep="true"
        data-swarm-deps="t:sec-title"
      >
        <h3>Zero-Layout-Thrashing Deep Scanner</h3>
        <p>Every heading, paragraph, and button inside is auto-scheduled.</p>
        <button type="button">Inspect DAG</button>
      </div>

      <SwarmControls position="bottom-right" />
    </SwarmProvider>
  );
}
```

---

# <SwarmCanvas>, SceneBuilder & buildSwarmLandingScene

> **Module Badge:** `06 · VIRTUAL ARTBOARD & SCENEBUILDER` · **Section ID:** `swarm-canvas`

Virtual Artboard Mode mounts a responsive Figma design surface (1280px reference width) supporting `addGuide`, `addRect`, `addText`, `addPath`, `addDupGroup` (`Alt+Drag` grid cloning), `add3D`, `addImage`, and the built-in `buildSwarmLandingScene` showcase.

## SceneBuilder Methods Reference

| Prop / Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `b.addGuide(id, axis, pos, triggerY)` | `returns `"g:" + id`` | `axis: "x" | "y"` | Drags a `#F24822` red alignment guide from the top or left ruler. |
| `b.addRect(id, x, y, w, h, opts?)` | `returns `"r:" + id`` | `r, fill, stroke` | Drags a rectangle with `#0D99FF` `W × H` dimension badge, fill, radius, and stroke. |
| `b.addText(id, x, y, text, style, opts?)` | `returns `"t:" + id`` | `grow, snap, dyn` | Types text character-by-character with caret; supports `grow: true` and guide `snap`. |
| `b.addDupGroup(id, sourceIds, copies)` | `returns `"d:" + id + ":2"`` | `dx, dy, edits[]` | Clones elements across a grid (`Alt+Drag`) and dispatches I-Beam cursors for `edits`. |
| `b.add3D / b.addImage` | ``"3d:" + id` / `"img:" + id`` | `buildMode: "all"` | Registers a 3D sculptural task or 2D image synthesis task on the Artboard. |

## Code Examples

### Authoring a Custom Scene with SceneBuilder or Using buildSwarmLandingScene (`ArtboardDemo.tsx`)

```tsx
import { SceneBuilder, TYPE_STYLES, PALETTE, buildSwarmLandingScene } from "swarm-cursor";
import { SwarmCanvas } from "swarm-cursor/react";

function buildCustomScene() {
  const b = new SceneBuilder(1280);
  const gLeft = b.addGuide("g-left", "x", 120, 100);
  const title = b.addText("h1", 120, 140, "Autonomous UI Engine.", TYPE_STYLES.h1, {
    w: 640, grow: true, snap: "g-left", deps: [gLeft],
  });
  const card = b.addRect("card-0", 120, 300, 320, 180, {
    fill: PALETTE.card, stroke: PALETTE.line, r: 14, deps: [title],
  });
  b.addText("card-0-t", 148, 332, "Rust/WASM SIMD128", TYPE_STYLES.h3, { deps: [card] });

  // Alt+Drag duplicate across 2 columns and edit text in each clone
  b.addDupGroup("cards", ["card-0", "card-0-t"], [
    { dx: 350, dy: 0, edits: ["3D Extrude & Slice"] },
    { dx: 700, dy: 0, edits: ["2D <SwarmImage>"] },
  ]);
  return b.build(620);
}

// Switch to "Artboard Showcase" in the top navbar to watch buildSwarmLandingScene live!
export const Showcase = () => (
  <SwarmCanvas scene={buildSwarmLandingScene} scrollMode="hybrid" controls agentPill />
);
```

---

# <SwarmFollower>, <SwarmAgentPill>, <SwarmControls> & useSwarm()

> **Module Badge:** `07 · FOLLOWER, AGENT PILL & CONTROLS` · **Section ID:** `follower-and-pill`

Three standalone interaction & status components: `<SwarmFollower>` (Boids pointer chase & circular vortex orbit when idle), `<SwarmAgentPill>` (5-AI-icon left-to-right queue with `{N} agents`), and `<SwarmControls>` (Turbopack-style popover with automatic `localStorage` persistence via `swarm_cursor_settings_v1` and extensible `children` slot) / `useSwarm()`.

## <SwarmFollower> & <SwarmAgentPill> Props

| Prop / Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `count` | `number` | `36` | Number of AI cursors in the flock or displayed in `{N} agents`. |
| `radiusScale (SwarmFollower)` | `number` | `1` | Multiplier for the circular vortex orbit radius when pointer is idle (`1` ~ `135px`). |
| `maxIcons / intervalMs (SwarmAgentPill)` | `number` | `5 / 650` | Maximum queued icons (`1..5`) and interval (ms) for pushing a new AI icon from left to right. |
| `icons (SwarmAgentPill)` | `AgentIconId[]` | `All 9 AI icons` | `claude`, `cohere`, `deepseek`, `gemini`, `grok`, `kimi`, `mistral`, `ollama`, `openai`. |
| `position / children (SwarmControls)` | `"bottom-left" \| "bottom-right" \| "top-right" / ReactNode` | `"bottom-right"` | Automatically persists `scrollMode`, `tempoMultiplier`, `rulers`, `paused`, and `open` in `localStorage` (`swarm_cursor_settings_v1`) and supports custom settings rows via `children`. |

## Code Examples

### Using <SwarmFollower>, <SwarmAgentPill>, and useSwarm() Hook (`InteractiveWidgets.tsx`)

```tsx
import {
  SwarmFollower,
  SwarmAgentPill,
  useSwarm,
} from "swarm-cursor/react";

// 1. Boids Mouse Follower + Circular Vortex Orbit
export const MouseVortex = () => (
  <SwarmFollower
    count={36}
    radiusScale={1}
    tempoMultiplier={1}
    agentPill={{
      maxIcons: 5,
      intervalMs: 650,
      position: "bottom-center",
      icons: ["claude", "openai", "gemini", "deepseek", "grok", "kimi", "mistral"],
    }}
  />
);

// 2. Custom Toolbar via useSwarm() inside <SwarmProvider>
export function CustomToolbar() {
  const { engine, start, pause, resume, reset, setScrollMode } = useSwarm();
  return (
    <div className="flex gap-2">
      <button onClick={() => (!engine.started ? start() : engine.paused ? resume() : pause())}>
        Toggle Play
      </button>
      <button onClick={reset}>Replay Swarm</button>
      <button onClick={() => setScrollMode("hybrid")}>Hybrid Scroll</button>
    </div>
  );
}
```
