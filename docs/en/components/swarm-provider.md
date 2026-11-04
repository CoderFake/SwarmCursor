# `<SwarmProvider>`, `<SwarmElement>`, `<Swarm3D>` & `<SwarmImage>` (DOM-Driven, 3D & Image Build Mode)

**DOM-Driven Mode** preserves your existing HTML/React/Tailwind layout, 2D images, and Three.js/WebGL canvases. As the user scrolls (or during hybrid auto-scroll), `<SwarmProvider>` scans the bounding boxes of `<SwarmElement>`, `<Swarm3D>`, `<SwarmImage>`, or recursively traverses child DOM elements (`deepScan={true}`) and dispatches AI cursors to construct each element before revealing the real DOM node.

---

## Combined 2D + Deep DOM + 3D/GLB + Image Example

```tsx
import {
  SwarmProvider,
  SwarmElement,
  Swarm3D,
  SwarmImage,
  SwarmControls,
} from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function PortfolioSection() {
  return (
    <SwarmProvider
      scrollMode="hybrid"
      autoScrollSpeed={180}
      deepScan={true}
      useFastRenderers={true}
      showCursorLabels={true}
      agentPill={{
        maxIcons: 5,
        intervalMs: 600,
        position: "bottom-center",
      }}
    >
      <section className="max-w-5xl mx-auto py-24 space-y-12">
        {/* 1. I-Beam typing + select-all font grow + X-axis red ruler guide */}
        <SwarmElement id="title" tool="text" grow snapAxis="x">
          <h1 className="text-5xl font-bold">Creative Engineering</h1>
        </SwarmElement>

        {/* 2. Recursive Deep DOM container (auto-builds child h3, p, button, svg) */}
        <div
          id="card-1"
          data-swarm="rect"
          data-swarm-deep="true"
          data-swarm-deps="t:title"
          className="p-8 rounded-2xl border bg-white shadow-sm"
        >
          <h3>Interactive Multi-Agent Systems</h3>
          <p>Child headings, paragraphs, buttons and SVGs are built automatically.</p>
          <button type="button">Launch Demo</button>
        </div>

        {/* 3. Progressive 2D Image Construction (mosaic | scanline | halftone | all) */}
        <SwarmImage
          id="arch-diagram"
          src="/images/diagram.webp"
          buildMode="mosaic"
          deps={["r:card-1"]}
          className="w-full h-64 rounded-2xl"
        />

        {/* 4. 3D / GLB Stage sculpted by a 4-cursor squad (extrude -> particles -> slice) */}
        <Swarm3D
          id="orb-3d"
          src="/models/orb.glb"
          buildMode="all"
          squadSize={4}
          deps={["r:card-1"]}
          className="w-80 h-80"
        >
          <canvas />
        </Swarm3D>
      </section>

      <SwarmControls position="bottom-right" />
    </SwarmProvider>
  );
}
```

---

## `<SwarmProvider>` Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `scrollMode` | `"manual" \| "auto" \| "hybrid"` | `"manual"` | `"manual"`: user scroll drives progress.<br>`"auto"`: auto-scrolls with build progress.<br>`"hybrid"`: auto-scrolls, yields on user wheel/touch, and resumes after 1.2s idle. |
| `autoScrollSpeed` | `number` | `180` | Maximum auto-scroll speed (`px/s`). |
| `deepScan` | `boolean` | `false` | Enables `scanDeepDOM` to recursively discover child elements and wire Parent $\rightarrow$ Child DAG dependencies. |
| `useFastRenderers` | `boolean` | `true` | Uses Zero-React-Tick 60fps renderers (`FastCursorLayerController` + `FastOverlayCanvasController`). |
| `controls` | `boolean` | `false` | Renders the built-in floating `<SwarmControls>` bar. |
| `showCursorLabels` | `boolean` | `false` | Displays AI agent role badges next to each cursor. |
| `designWidth` | `number` | `1280` | Reference design width in pixels. |
| `agentPill` | `boolean \| Omit<SwarmAgentPillProps, "engine">` | `false` | **Opt-in only.** Displays the bottom-bar 5-AI-icon queue pill + `{N} agents`. |

---

## `<Swarm3D>` Props & `useSwarm3D` Hook

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` *(required)* | — | Unique 3D stage ID (creates DAG task `3d:${id}`). |
| `src` | `string` | `undefined` | Optional path to `.glb` / `.gltf` model. |
| `buildMode` | `"extrude" \| "particles" \| "slice" \| "all"` | `"all"` | 3D construction algorithm (`"all"` chains wireframe extrusion, GPU surface particles, and holographic laser slicing). |
| `squadSize` | `number` | `4` | Number of AI cursors collaborating simultaneously (`1` Lead + `N-1` Assistants). |
| `deps` | `string[]` | `undefined` | Prerequisite task IDs before 3D sculpting begins. |
| `onProgress` | `(progress: number, weights: Phase3DWeights) => void` | `undefined` | Per-frame callback receiving overall progress `0..1` and `{ extrude, particles, slice }` weights. |

---

## `<SwarmImage>` Props (2D Image Construction)

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` *(required)* | — | Unique image ID (creates DAG task `img:${id}`). |
| `src` | `string` *(required)* | — | Image source URL. |
| `alt` | `string` | `""` | Image alt text. |
| `buildMode` | `"mosaic" \| "scanline" \| "halftone" \| "all"` | `"all"` | **`"mosaic"`**: Progressive Quadtree macro-block refinement (`32px -> 16px -> 8px -> 4px -> 0px`).<br>**`"scanline"`**: Horizontal holographic laser sweep with blueprint grid.<br>**`"halftone"`**: Screen-printed dot-matrix convergence.<br>**`"all"`**: Multi-pass synthesis (`mosaic` $\rightarrow$ `halftone` $\rightarrow$ `scanline`). |
| `deps` | `string[]` | `undefined` | Prerequisite task IDs before image construction starts. |

---

## `<SwarmElement>` Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` *(required)* | — | Unique element ID referenced in `deps`. |
| `tool` | `"rect" \| "text" \| "path"` | `"rect"` | Figma cursor tool used to construct this element. |
| `grow` | `boolean` | `false` | For `tool="text"`: types at small font size first, selects all (`.text-sel`), and scales up to final size. |
| `snapAxis` | `"x" \| "y" \| "xy"` | `undefined` | Dispatches a cursor to drag a red snap guide from the top/left ruler aligned to this element. |
| `deps` | `string[]` | `undefined` | Task IDs that must finish before this element unlocks. |
