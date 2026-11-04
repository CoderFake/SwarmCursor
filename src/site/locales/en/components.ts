import type { DocSection } from "../../types";

export const EN_COMPONENTS: DocSection[] = [
  {
    id: "swarm-provider",
    category: "components",
    badge: "03 · DOM-DRIVEN & DEEP SCAN",
    title: "<SwarmProvider> & <SwarmElement> (DOM-Driven & Deep DOM DAG)",
    summary:
      "Preserves your existing React/Tailwind markup. With `deepScan={true}`, `scanDeepDOM` traverses child nodes (`h1..h6`, `p`, `span`, `button`, `svg/path`, `canvas`) in a single layout read pass and unlocks child tasks as soon as the parent container reaches 60% progress.",
    steps: [
      {
        badge: "TOOL: TEXT",
        title: "Type Tool + Grow + Snap",
        body: "`tool=\"text\"` types with a blinking caret; `grow` selects all and drags font size; `snapAxis` pulls a red ruler guide.",
      },
      {
        badge: "TOOL: RECT",
        title: "Rectangle Wireframe + Deep DAG",
        body: "`data-swarm=\"rect\" data-swarm-deep=\"true\"` drags a wireframe box with W×H badge and auto-schedules child nodes.",
      },
      {
        badge: "TOOL: PATH",
        title: "Vector Pen Anchor Tool",
        body: "`tool=\"path\"` places `5×5` vector anchor points along `<svg>` paths and closes the contour.",
      },
    ],
    codeExamples: [
      {
        title: "Configuring <SwarmProvider> & <SwarmElement>",
        filename: "PortfolioStage.tsx",
        code: `import { SwarmProvider, SwarmElement, SwarmControls } from "swarm-cursor/react";

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
}`,
      },
    ],
    propsTable: {
      title: "<SwarmProvider> & <SwarmElement> Props Reference",
      rows: [
        {
          name: "scrollMode",
          type: '"manual" | "auto" | "hybrid"',
          defaultVal: '"manual"',
          desc: "Scroll mode: user-driven (`manual`), automatic (`auto`), or auto-scroll that yields on user wheel (`hybrid`).",
        },
        {
          name: "deepScan",
          type: "boolean",
          defaultVal: "false",
          desc: "Enables `scanDeepDOM` recursive child traversal inside `[data-swarm-deep=\"true\"]` containers.",
        },
        {
          name: "fastMode",
          type: "boolean",
          defaultVal: "true",
          desc: "Uses `FastCursorLayerController` + `FastOverlayCanvasController` for 60fps zero-React-tick rendering.",
        },
        {
          name: "tool (SwarmElement)",
          type: '"rect" | "text" | "path"',
          defaultVal: '"rect"',
          desc: "Figma cursor tool used to construct the element (`rect`, `text`, or `path`).",
        },
        {
          name: "grow / snapAxis",
          type: 'boolean / "x" | "y" | "xy"',
          defaultVal: "false / undefined",
          desc: "`grow`: types small then selects all to scale up. `snapAxis`: drags red alignment guides from rulers.",
        },
      ],
    },
  },
  {
    id: "swarm-3d",
    category: "components",
    badge: "04 · 3D / THREE.JS / GLB BUILDER",
    title: "<Swarm3D> & registerSwarm3D (extrude · particles · slice)",
    summary:
      "Provides 3 sculptural 3D / Three.js / GLB construction algorithms powered by 2–6 collaborating AI cursors (`SquadCoordinator`): 3D Gizmo wireframe extrusion (`extrude`), O(log M) surface triangle particle sampling (`particles`), and holographic laser clipping (`slice`).",
    sandbox: "3d",
    steps: [
      {
        badge: "PHASE 1 · EXTRUDE",
        title: "3D Gizmo & Wireframe Cage",
        body: "Lead Cursor drags the X/Y/Z 3D Gizmo axes to extrude the wireframe bounding cage, projecting 3D vertices to 2D.",
      },
      {
        badge: "PHASE 2 · PARTICLES",
        title: "CDF Surface Particle Swarm",
        body: "`CumulativeAreaSampler` uniformly samples mesh triangles in O(log M) for GPU particle convergence.",
      },
      {
        badge: "PHASE 3 · SLICE",
        title: "Holographic Laser Slice",
        body: "Assistant Cursors sweep holographic laser clipping planes (`active3DLasers`) from bottom to top.",
      },
    ],
    codeExamples: [
      {
        title: "Integrating <Swarm3D> & registerSwarm3D with Three.js + wasmKernel",
        filename: "CrystalOrb3D.tsx",
        code: `import { Swarm3D } from "swarm-cursor/react";
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
});`,
      },
    ],
    propsTable: {
      title: "<Swarm3D> & registerSwarm3D Options",
      rows: [
        {
          name: "id",
          type: "string (required)",
          defaultVal: "—",
          desc: "Unique 3D task identifier (registers `3d:${id}` in the DAG).",
        },
        {
          name: "buildMode",
          type: '"extrude" | "particles" | "slice" | "all"',
          defaultVal: '"all"',
          desc: "Single 3D build algorithm or multi-phase pipeline (`all`).",
        },
        {
          name: "squadSize",
          type: "number (2..6)",
          defaultVal: "4",
          desc: "Number of AI cursors collaborating simultaneously (`1` Lead + `N-1` Assistants).",
        },
        {
          name: "onProgress",
          type: "(progress: number, weights: Phase3DWeights) => void",
          defaultVal: "undefined",
          desc: "Per-frame callback providing `progress` (0..1) and `{ extrude, particles, slice }` weights.",
        },
      ],
    },
  },
  {
    id: "swarm-image",
    category: "components",
    badge: "05 · 2D IMAGE SYNTHESIS",
    title: "<SwarmImage> (mosaic · scanline · halftone · all)",
    summary:
      "Provides 3 progressive 2D image synthesis algorithms inspired by Quadtree Subdivisions (`mosaic`), Holographic CRT Laser Rasterization (`scanline`), and Halftone Screen-Printing (`halftone`), or all 3 combined via `buildMode=\"all\"`.",
    sandbox: "image",
    steps: [
      {
        badge: "MODE: MOSAIC",
        title: "Quadtree Pixelation Refinement",
        body: "Refines macro-blocks (`32px -> 16px -> 8px -> 4px -> 0px`) as the cursor sweeps diagonally across the image.",
      },
      {
        badge: "MODE: SCANLINE",
        title: "Holographic Laser Raster Scan",
        body: "Cursor drags a horizontal laser beam with `IMG·SCAN` badge from top to bottom over a blueprint grid.",
      },
      {
        badge: "MODE: HALFTONE",
        title: "Dot-Matrix Screen Printing",
        body: "Synthesizes the image through a screen-printed dot matrix before converging to full clarity.",
      },
    ],
    codeExamples: [
      {
        title: "Using <SwarmImage> in React or data-swarm=\"image\" in HTML",
        filename: "ProjectGallery.tsx",
        code: `import { SwarmImage } from "swarm-cursor/react";
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
}`,
      },
    ],
    propsTable: {
      title: "<SwarmImage> Props Reference",
      rows: [
        {
          name: "id / src",
          type: "string (required)",
          defaultVal: "—",
          desc: "Unique image task ID (`img:${id}`) and source URL.",
        },
        {
          name: "buildMode",
          type: '"mosaic" | "scanline" | "halftone" | "all"',
          defaultVal: '"all"',
          desc: "Image synthesis algorithm: Quadtree blocks (`mosaic`), laser sweep (`scanline`), dot matrix (`halftone`), or all 3 (`all`).",
        },
        {
          name: "deps",
          type: "string[]",
          defaultVal: "undefined",
          desc: "Prerequisite task IDs before image construction begins.",
        },
      ],
    },
  },
  {
    id: "swarm-canvas",
    category: "components",
    badge: "06 · VIRTUAL ARTBOARD & SCENEBUILDER",
    title: "<SwarmCanvas>, SceneBuilder & buildSwarmLandingScene",
    summary:
      "Virtual Artboard Mode mounts a responsive Figma design surface (1280px reference width) supporting `addGuide`, `addRect`, `addText`, `addPath`, `addDupGroup` (`Alt+Drag` grid cloning), `add3D`, `addImage`, and the built-in `buildSwarmLandingScene` showcase.",
    codeExamples: [
      {
        title: "Authoring a Custom Scene with SceneBuilder or Using buildSwarmLandingScene",
        filename: "ArtboardDemo.tsx",
        code: `import { SceneBuilder, TYPE_STYLES, PALETTE, buildSwarmLandingScene } from "swarm-cursor";
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
);`,
      },
    ],
    propsTable: {
      title: "SceneBuilder Methods Reference",
      rows: [
        {
          name: "b.addGuide(id, axis, pos, triggerY)",
          type: 'returns `"g:" + id`',
          defaultVal: 'axis: "x" | "y"',
          desc: "Drags a `#F24822` red alignment guide from the top or left ruler.",
        },
        {
          name: "b.addRect(id, x, y, w, h, opts?)",
          type: 'returns `"r:" + id`',
          defaultVal: "r, fill, stroke",
          desc: "Drags a rectangle with `#0D99FF` `W × H` dimension badge, fill, radius, and stroke.",
        },
        {
          name: "b.addText(id, x, y, text, style, opts?)",
          type: 'returns `"t:" + id`',
          defaultVal: "grow, snap, dyn",
          desc: "Types text character-by-character with caret; supports `grow: true` and guide `snap`.",
        },
        {
          name: "b.addDupGroup(id, sourceIds, copies)",
          type: 'returns `"d:" + id + ":2"`',
          defaultVal: "dx, dy, edits[]",
          desc: "Clones elements across a grid (`Alt+Drag`) and dispatches I-Beam cursors for `edits`.",
        },
        {
          name: "b.add3D / b.addImage",
          type: '`"3d:" + id` / `"img:" + id`',
          defaultVal: 'buildMode: "all"',
          desc: "Registers a 3D sculptural task or 2D image synthesis task on the Artboard.",
        },
      ],
    },
  },
  {
    id: "follower-and-pill",
    category: "components",
    badge: "07 · FOLLOWER, AGENT PILL & CONTROLS",
    title: "<SwarmFollower>, <SwarmAgentPill>, <SwarmControls> & useSwarm()",
    summary:
      "Three standalone interaction & status components: `<SwarmFollower>` (Boids pointer chase & circular vortex orbit when idle), `<SwarmAgentPill>` (5-AI-icon left-to-right queue with `{N} agents`), and `<SwarmControls>` / `useSwarm()`.",
    codeExamples: [
      {
        title: "Using <SwarmFollower>, <SwarmAgentPill>, and useSwarm() Hook",
        filename: "InteractiveWidgets.tsx",
        code: `import {
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
}`,
      },
    ],
    propsTable: {
      title: "<SwarmFollower> & <SwarmAgentPill> Props",
      rows: [
        {
          name: "count",
          type: "number",
          defaultVal: "36",
          desc: "Number of AI cursors in the flock or displayed in `{N} agents`.",
        },
        {
          name: "radiusScale (SwarmFollower)",
          type: "number",
          defaultVal: "1",
          desc: "Multiplier for the circular vortex orbit radius when pointer is idle (`1` ~ `135px`).",
        },
        {
          name: "maxIcons / intervalMs (SwarmAgentPill)",
          type: "number",
          defaultVal: "5 / 650",
          desc: "Maximum queued icons (`1..5`) and interval (ms) for pushing a new AI icon from left to right.",
        },
        {
          name: "icons (SwarmAgentPill)",
          type: "AgentIconId[]",
          defaultVal: "All 9 AI icons",
          desc: "`claude`, `cohere`, `deepseek`, `gemini`, `grok`, `kimi`, `mistral`, `ollama`, `openai`.",
        },
      ],
    },
  },
];
