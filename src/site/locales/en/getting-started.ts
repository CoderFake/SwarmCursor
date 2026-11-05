import type { DocSection } from "../../types";

export const EN_GETTING_STARTED: DocSection[] = [
  {
    id: "installation",
    category: "getting-started",
    badge: "01 · SETUP & 8 SUB-PACKAGES",
    title: "Installation, 8 Sub-Packages & Rust/WASM SIMD128",
    summary:
      "SwarmCursor 2.0 is architected as 8 independent tree-shakeable sub-packages with an embedded WebAssembly SIMD128 binary that runs out-of-the-box in Vite, Next.js App Router, and Astro.",
    steps: [
      {
        badge: "STEP 1",
        title: "Install from GitHub / NPM",
        body: "Install the package into your React 18/19 or Vanilla TypeScript workspace.",
      },
      {
        badge: "STEP 2",
        title: "Import Stylesheet Once",
        body: "Import `swarm-cursor/styles.css` in `main.tsx` or `App.tsx` to enable cursors, Figma rulers, and 3D/Image shaders.",
      },
      {
        badge: "STEP 3",
        title: "Import Only What You Need",
        body: "Import the full barrel from `swarm-cursor` or cherry-pick `/engine`, `/kernel`, `/three`, `/scanner`, `/renderers`, `/tools`, `/react`.",
      },
    ],
    codeExamples: [
      {
        title: "Installation (GitHub Release v2.0.0 / GitHub Packages) & Stylesheet Import",
        filename: "terminal / main.tsx",
        code: `# Option 1 (Fastest — Prebuilt GitHub Release v2.0.0 tarball):
npm install https://github.com/CoderFake/SwarmCursor/releases/download/v2.0.0/swarm-cursor-2.0.0.tgz

# Option 2 (Install pinned v2.0.0 Git Release tag):
npm install git+https://github.com/CoderFake/SwarmCursor.git#v2.0.0

# Option 3 (GitHub Packages Registry — @coderfake/swarm-cursor):
npm install @coderfake/swarm-cursor --@coderfake:registry=https://npm.pkg.github.com

// In main.tsx or App.tsx:
import "swarm-cursor/styles.css";`,
      },
      {
        title: "Rebuilding the Rust/WASM SIMD128 Kernel (Optional)",
        filename: "crates/swarm-kernel-wasm",
        code: `RUSTFLAGS="-C target-feature=+simd128" cargo build \\
  --manifest-path crates/swarm-kernel-wasm/Cargo.toml \\
  --target wasm32-unknown-unknown \\
  --release

npm run build`,
      },
    ],
    propsTable: {
      title: "8 Modular Sub-Packages (Tree-Shakeable Subpath Exports)",
      rows: [
        {
          name: "swarm-cursor",
          type: "Barrel Export",
          defaultVal: "All modules",
          desc: "Full barrel export of Core, Engine, Kernel, 3D, Scanner, Renderers, Tools & `buildSwarmLandingScene`.",
        },
        {
          name: "swarm-cursor/engine",
          type: "Orchestrator",
          defaultVal: "6 modules",
          desc: "`SwarmEngine`, `hydrateEngineScene`, `getAvailableTasks`, `pickBestTaskForCursor`, `moveToCoroutine`, `drawRectCoroutine`, `duplicateGroupCoroutine`.",
        },
        {
          name: "swarm-cursor/kernel",
          type: "Rust/WASM SIMD128",
          defaultVal: "5 SIMD ops",
          desc: "`wasmKernel`, `SwarmKernel`, `SoACursorBuffer`, `DAGScheduler` (`stepBoids`, `stepBezierPathsBatch`, `project3DBatch`, `auctionTasksBatch`, `deformSculpturalMeshBatch`).",
        },
        {
          name: "swarm-cursor/three",
          type: "3D / GLB",
          defaultVal: "3 phases",
          desc: "`CumulativeAreaSampler`, `compute3DPhaseWeights`, `registerSwarm3D`, `ProjectionBridge`, `SwarmGLBController`, GLSL Shaders.",
        },
        {
          name: "swarm-cursor/scanner",
          type: "DOM Scanner",
          defaultVal: "Single-pass",
          desc: "`scanDeepDOM` & `LayoutReadCache` recursively scan DOM trees into a Parent -> Child DAG with zero layout thrashing.",
        },
        {
          name: "swarm-cursor/renderers",
          type: "60fps Renderers",
          defaultVal: "0 React ticks",
          desc: "`FastCursorLayerController` (DOM Pool) & `FastOverlayCanvasController` (2D Canvas).",
        },
        {
          name: "swarm-cursor/tools",
          type: "Tools & Squads",
          defaultVal: "Pluggable",
          desc: "`ToolRegistry`, `SquadCoordinator` (Work-Stealing 2..6 cursors) & `computeImageBuildState`.",
        },
        {
          name: "swarm-cursor/react",
          type: "React 18/19",
          defaultVal: "8 components",
          desc: "`<SwarmProvider>`, `<SwarmElement>`, `<Swarm3D>`, `<SwarmImage>`, `<SwarmFollower>`, `<SwarmAgentPill>`, `<SwarmCanvas>`, `<SwarmControls>`.",
        },
      ],
    },
  },
  {
    id: "quick-start",
    category: "getting-started",
    badge: "02 · QUICK START IN 60S",
    title: "5 Quick-Start Integration Patterns in 60 Seconds",
    summary:
      "Choose the pattern that fits your app: (1) Boids mouse follower & circular vortex, (2) Scroll-driven DOM/3D/Image builder, (3) Virtual Artboard canvas, (4) 5-AI-icon bottom queue bar, or (5) Direct Rust/WASM SIMD128 kernel calls.",
    steps: [
      {
        badge: "PATTERN 1",
        title: "Mouse Follower & Vortex",
        body: "Mount `<SwarmFollower count={36} />` for a flock that chases the pointer and orbits in a circular vortex when idle.",
      },
      {
        badge: "PATTERN 2",
        title: "DOM + Deep Scan + 3D + Image",
        body: "Wrap your page in `<SwarmProvider deepScan>` with `<Swarm3D>` and `<SwarmImage>` for full multi-agent choreography.",
      },
      {
        badge: "PATTERN 3",
        title: "Virtual Artboard Showcase",
        body: "Render `<SwarmCanvas scene={buildSwarmLandingScene} />` or author custom scenes with `SceneBuilder`.",
      },
    ],
    codeExamples: [
      {
        title: "Patterns 1 & 2: Combining <SwarmProvider>, Deep DOM, <Swarm3D> & <SwarmImage>",
        filename: "App.tsx",
        code: `import {
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
}`,
      },
      {
        title: "Patterns 3, 4 & 5: <SwarmFollower>, <SwarmAgentPill> & wasmKernel",
        filename: "StandaloneExamples.tsx",
        code: `import { SwarmFollower, SwarmAgentPill } from "swarm-cursor/react";
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
wasmKernel.deformSculpturalMeshBatch(basePositions, outPositions, timeSeconds);`,
      },
    ],
  },
];
