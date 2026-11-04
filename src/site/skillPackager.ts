import { EN_LOCALE_BUNDLE } from "./locales/en";
import type { DocSection } from "./types";

export interface SkillArchiveFile {
  path: string;
  content: string;
}

function formatSectionMarkdown(sec: DocSection): string {
  const lines: string[] = [];
  lines.push(`# ${sec.title}`);
  lines.push("");
  lines.push(`> **Module Badge:** \`${sec.badge}\` · **Section ID:** \`${sec.id}\``);
  lines.push("");
  lines.push(sec.summary);
  lines.push("");

  if (sec.steps && sec.steps.length > 0) {
    lines.push("## Key Concepts & Workflow");
    lines.push("");
    for (const step of sec.steps) {
      lines.push(`### [${step.badge}] ${step.title}`);
      lines.push(step.body);
      lines.push("");
    }
  }

  if (sec.propsTable && sec.propsTable.rows.length > 0) {
    lines.push(`## ${sec.propsTable.title}`);
    lines.push("");
    lines.push("| Prop / Attribute | Type | Default | Description |");
    lines.push("| :--- | :--- | :--- | :--- |");
    for (const row of sec.propsTable.rows) {
      const safeType = row.type.replace(/\|/g, "\\|");
      const safeDesc = row.desc.replace(/\|/g, "\\|");
      lines.push(
        `| \`${row.name}\` | \`${safeType}\` | \`${row.defaultVal}\` | ${safeDesc} |`
      );
    }
    lines.push("");
  }

  if (sec.codeExamples && sec.codeExamples.length > 0) {
    lines.push("## Code Examples");
    lines.push("");
    for (const ex of sec.codeExamples) {
      lines.push(`### ${ex.title} (\`${ex.filename}\`)`);
      lines.push("");
      const ext = ex.filename.split(".").pop() || "tsx";
      const langTag =
        ext === "sh"
          ? "bash"
          : ext === "css"
            ? "css"
            : ext === "ts"
              ? "ts"
              : "tsx";
      lines.push(`\`\`\`${langTag}`);
      lines.push(ex.code.trim());
      lines.push("```");
      lines.push("");
    }
  }

  return lines.join("\n");
}

function buildMainSkillMarkdown(): string {
  return `---
name: swarm-cursor
description: Multi-agent AI cursor choreography library for React 18/19 DOM layouts, Three.js/GLB 3D meshes, and 2D images powered by Rust/WASM SIMD128. Activate this skill when installing, integrating, customizing, or optimizing swarm-cursor in any web or React application.
---

# SwarmCursor 2.0 — AI Coding Agent Skill

Use this skill whenever the user asks to integrate, configure, customize, or optimize **SwarmCursor 2.0** (\`swarm-cursor\`) — the compiled Rust/WASM SIMD128 multi-agent Figma cursor choreography engine for React DOM, Three.js/GLB 3D models, and progressive 2D image construction.

---

## 1. Installation & Required CSS

Install directly from GitHub:

\`\`\`bash
npm install git+https://github.com/CoderFake/SwarmCursor.git
# Optional peer dependency for 3D / GLB mesh construction:
npm install three @types/three
\`\`\`

Always import the core stylesheet once in the application entry file (\`main.tsx\`, \`App.tsx\`, or \`layout.tsx\`):

\`\`\`tsx
import "swarm-cursor/styles.css";
\`\`\`

---

## 2. Sub-Package Architecture (8 Entry Points)

Choose the most specific entry point for tree-shaking and clean modular architecture:

| Import Path | Exports & Purpose |
| :--- | :--- |
| \`swarm-cursor\` | Full bundle re-exporting all engines, kernels, tools, and React components |
| \`swarm-cursor/react\` | \`SwarmProvider\`, \`SwarmElement\`, \`SwarmCanvas\`, \`SwarmFollower\`, \`SwarmAgentPill\`, \`SwarmControls\`, \`Swarm3D\`, \`SwarmImage\`, \`RulersOverlay\`, \`useSwarm\` |
| \`swarm-cursor/three\` | \`Swarm3DBuilder\`, \`createSwarm3DStage\`, \`extractMeshTargets\`, \`loadGLBTargets\` (Three.js & GLB 3-stage pipeline) |
| \`swarm-cursor/tools\` | \`SwarmImageBuilder\`, \`PenPathTool\` (2D progressive image scanner & cubic Bezier pen tool) |
| \`swarm-cursor/kernel\` | \`SwarmKernel\`, \`wasmKernel\` (Compiled Rust/WASM SIMD128 Spatial Hash Boids & Hungarian O(n³) task assignment) |
| \`swarm-cursor/engine\` | \`SwarmEngine\`, \`AutoScrollController\`, \`isTaskDependencySatisfied\`, \`pickBestTaskForCursor\` |
| \`swarm-cursor/scanner\` | \`scanDeepDOMElements\`, \`DOMLayoutCache\` (Recursive DOM-to-DAG scanner) |
| \`swarm-cursor/renderers\` | \`FastCursorLayerController\`, \`FastOverlayCanvasController\` (Zero-React-tick 60–120fps direct DOM + 2D Canvas renderers) |

---

## 3. Choosing the Right Integration Mode

1. **Mode A — DOM-Driven React Wrapper (\`<SwarmProvider>\` + \`<SwarmElement>\` / \`data-swarm\`)** *(Recommended for websites & apps)*:
   - Wrap your existing React page in \`<SwarmProvider scrollMode="hybrid" deepScan={true} fastMode={true} controls={true}>\`.
   - Annotate key structural cards/containers/headings with \`data-swarm="rect"\`, \`data-swarm="text"\`, \`data-swarm="path"\`, \`data-swarm="3d"\`, or \`data-swarm="image"\` (or use \`<SwarmElement id="..." tool="rect">\`).
2. **Mode B — Fixed 1440px Artboard (\`<SwarmCanvas>\` + \`SceneBuilder\`)**:
   - Use when building a Figma-style interactive artboard showcase with explicit \`(x, y, w, h)\` scene coordinates.
3. **Mode C — Ambient Mouse Follower (\`<SwarmFollower>\`)**:
   - Lightweight decorative cursor flock that orbits the user's pointer without scanning or modifying DOM elements.
4. **Figma Alt+Drag Clone (\`dup\`) + Select-All Re-Type (\`edit\`) Choreography**:
   - Group sibling cards into a \`SwarmDupGroup\` (\`d:\${groupId}:\${k}\` task with \`duplicateGroupCoroutine\`) and wire each cloned card's title text to an \`edit\` task (\`e:\${titleId}\` with \`editTextCoroutine\` depending on \`d:\${groupId}:\${k}\`).
   - The cursor Alt+Drags (\`cursor.shape = "dup"\`) the cloned card from the source card with red Figma spacing guides (\`#F24822\`), then double-clicks the cloned title (\`el.selAll = true\` -> \`.text-sel\` highlight) and re-types the new title (\`engine.type(el, el.text, true)\`).

---

## 4. Critical Performance & Memory-Safety Rules for AI Agents

When writing custom integrations with \`SwarmEngine\`, \`SwarmKernel\`, or Three.js WebGL stages, ALWAYS follow these rules:

1. **Two-Tier Inner Subtask (\`luồng con\`) Promotion (Primary Title + Child Texts/Bullets/Badges)**:
   - Give each card's primary heading (\`h2\`/\`h3\`/\`strong\`) the ID \`\${cardId}-title\` so sibling cards wired into a \`SwarmDupGroup\` perform Figma Alt+Drag Clone (\`dup\`) + Double-Click Select-All (\`.text-sel\`) & Re-Type (\`edit\`) choreography.
   - Promote inner badges, pills, chips, and buttons (\`.badge\`, \`.pill\`, \`.chip\`, \`.tag\`, \`.btn\`) as child \`rect\` / \`glass-pill\` tasks (\`data-swarm-auto="true"\`, \`data-swarm-deps="r:\${cardId}"\`), and promote inner small texts, bullet list items (\`<li>\`), descriptions (\`<p>\`), kickers, and metrics as child \`text\` tasks (\`data-swarm-auto="true"\`, \`data-swarm-deps="r:\${cardId}"\`).
   - Update \`.textContent\` and \`.text-sel\` directly in \`requestAnimationFrame\` with zero React re-renders per character.
2. **Isolate \`MutationObserver\` & Evaluate DAG Dependencies Before \`getBoundingClientRect()\`**:
   - Observe ONLY the content container \`<div ref={contentRef}>{children}</div>\`, NEVER the parent wrapper containing \`.cursors\` or construction ghost layers.
   - In custom \`available()\` loops, always check \`t.deps.every(...)\` in memory BEFORE calling \`domEl.getBoundingClientRect()\` so locked child sub-tasks incur 0 DOM layout reads until their parent card unlocks them.
3. **Use Zero-React-Tick Renderers (\`FastCursorLayerController\` + \`FastOverlayCanvasController\`)**:
   - Never trigger React \`setState\` on every 60fps animation frame for cursor positions or rectangle drag progress. Cursor user name labels (\`.cursor-label\`) are hidden by default for a clean visual aesthetic.
4. **Parallel Rust/WASM \`wasmKernel.auctionTasksBatch\` with Child-Subtask Priority & Locality Boost**:
   - \`SwarmEngine\` uses the singleton \`wasmKernel\` (\`MAX_TASKS = 1024\`, \`TASK_STRIDE = 8\` in \`crates/swarm-kernel-wasm/src/auction.rs\`) to dispatch idle cursors in parallel.
   - Pass \`priority > 0\` (\`1.65\` for \`edit\`, \`1.35\` for child \`text\`, \`1.22\` for child \`rect\`) and \`parentGroup\` for child sub-tasks (\`luồng con\`) so idle cursors near an active/cloned card immediately swarm and finish all its inner small texts, bullet points, and badges in a top-to-bottom wave, while extra idle cursors assist on long paragraphs/cards via \`assistSubtaskCoroutine\` (\`role: "assistant"\`).
5. **Strict Viewport Entry Gating & Off-Screen Loop Pausing**:
   - Gate below-the-fold sections until the user actually scrolls (\`scrollY > 64\` and \`rect.top <= vh * 0.72\`) so off-screen sections never build prematurely while idle at the top of the page.
   - Pause \`requestAnimationFrame\` when \`engine.flocking === true\` (all tasks done), when \`document.hidden === true\`, or when a 3D WebGL canvas leaves the viewport (\`IntersectionObserver\`).

---

## 5. Detailed Reference Documentation & Examples

Read these reference files in this skill directory for complete prop tables, HTML attribute specs, and copy-pasteable code patterns:

- [\`references/01-getting-started.md\`](./references/01-getting-started.md) — Installation, 8 sub-packages, and Quick Start for all 3 integration modes.
- [\`references/02-dom-and-react-components.md\`](./references/02-dom-and-react-components.md) — \`SwarmProvider\`, \`SwarmElement\`, \`SwarmCanvas\`, \`SwarmFollower\`, \`SwarmAgentPill\`, and \`SwarmControls\`.
- [\`references/03-media-3d-and-2d-builders.md\`](./references/03-media-3d-and-2d-builders.md) — \`Swarm3D\` (Three.js & GLB 3-stage pipeline: wireframe, GPU particles, holographic slice) and \`SwarmImage\` (mosaic, scanline, halftone).
- [\`references/04-wasm-engine-and-theming.md\`](./references/04-wasm-engine-and-theming.md) — \`wasmKernel\` SIMD128 API, \`SwarmEngine\`, \`scanDeepDOMElements\`, \`data-swarm-*\` attributes, and CSS custom properties.
- [\`examples/dom-provider-quickstart.tsx\`](./examples/dom-provider-quickstart.tsx) — Complete React landing page using \`SwarmProvider\` and \`SwarmElement\`.
- [\`examples/threejs-glb-3d-builder.tsx\`](./examples/threejs-glb-3d-builder.tsx) — Three.js + GLB 3D progressive construction example.
- [\`examples/zero-react-tick-custom-stage.tsx\`](./examples/zero-react-tick-custom-stage.tsx) — High-performance custom stage using \`SwarmEngine\`, \`FastCursorLayerController\`, and \`FastOverlayCanvasController\`.
`;
}

export function buildSkillArchiveFiles(): SkillArchiveFile[] {
  const gettingStartedMd = [
    "# SwarmCursor 2.0 — Getting Started Reference",
    "",
    ...EN_LOCALE_BUNDLE.gettingStarted.map(formatSectionMarkdown),
  ].join("\n---\n\n");

  const domComponents = EN_LOCALE_BUNDLE.components.filter(
    (c) => c.id !== "swarm-3d" && c.id !== "swarm-image"
  );
  const mediaComponents = EN_LOCALE_BUNDLE.components.filter(
    (c) => c.id === "swarm-3d" || c.id === "swarm-image"
  );

  const domReactMd = [
    "# SwarmCursor 2.0 — DOM & React Components Reference",
    "",
    ...domComponents.map(formatSectionMarkdown),
  ].join("\n---\n\n");

  const mediaBuildersMd = [
    "# SwarmCursor 2.0 — 3D (Three.js / GLB) & 2D Image Builders Reference",
    "",
    ...mediaComponents.map(formatSectionMarkdown),
  ].join("\n---\n\n");

  const subsystemsMd = [
    "# SwarmCursor 2.0 — Rust/WASM SIMD128 Kernel, Engine & CSS Reference",
    "",
    ...EN_LOCALE_BUNDLE.subsystems.map(formatSectionMarkdown),
  ].join("\n---\n\n");

  const exampleDomProvider = `import React from "react";
import {
  SwarmProvider,
  SwarmElement,
  Swarm3D,
  SwarmImage,
} from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function App() {
  return (
    <SwarmProvider
      scrollMode="manual"
      deepScan={true}
      fastMode={true}
      controls={true}
      controlsPosition="bottom-left"
      showRulers={true}
      agentPill={{ position: "bottom-center", maxIcons: 5 }}
    >
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "72px 24px" }}>
        <SwarmElement id="hero-badge" tool="rect">
          <span>SwarmCursor 2.0 · Rust/WASM SIMD128</span>
        </SwarmElement>

        <SwarmElement id="hero-title" tool="text" grow snapAxis="x" deps={["hero-badge"]}>
          <h1>Multi-Agent UI Construction</h1>
        </SwarmElement>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 32 }}>
          <Swarm3D
            id="hero-3d-orb"
            buildMode="all"
            squadSize={4}
            deps={["hero-title"]}
          >
            <div style={{ height: 320, borderRadius: 24 }} />
          </Swarm3D>

          <SwarmImage
            id="hero-preview-img"
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=80"
            alt="Architecture Preview"
            buildMode="all"
            height={320}
            radius={24}
          />
        </div>
      </main>
    </SwarmProvider>
  );
}
`;

  const exampleThreeGlb = `import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createSwarm3DStage, loadGLBTargets } from "swarm-cursor/three";

export async function mountGlbSwarmBuilder(
  scene: THREE.Scene,
  camera: THREE.Camera
) {
  const targets = await loadGLBTargets(
    "/models/robot-arm.glb",
    new GLTFLoader(),
    { maxPoints: 1800, scale: 1.5 }
  );

  const stage3d = createSwarm3DStage(THREE, scene, camera, targets, {
    mode: "all", // Stage 1: Wireframe -> Stage 2: GPU Particles -> Stage 3: Holographic Slice
    wireframeColor: "#7c3aed",
    particleColor: "#6d5df6",
    sliceLaserColor: "#38bdf8",
  });

  return {
    update(progress0to1: number, dt: number) {
      stage3d.setProgress(progress0to1, dt);
    },
    dispose() {
      stage3d.dispose();
    },
  };
}
`;

  const exampleZeroTickStage = `import React, { useEffect, useRef } from "react";
import {
  DESIGN_WIDTH,
  FastCursorLayerController,
  FastOverlayCanvasController,
  SwarmEngine,
  scanDOMElements,
} from "swarm-cursor";
import "swarm-cursor/styles.css";

export function ZeroTickSwarmStage({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cursorsRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const rootEl = rootRef.current;
    const cursorsEl = cursorsRef.current;
    const canvasEl = canvasRef.current;
    if (!rootEl || !cursorsEl || !canvasEl) return;

    const scanned = scanDOMElements(rootEl, DESIGN_WIDTH);
    const engine = new SwarmEngine({
      scene: scanned.scene,
      designWidth: DESIGN_WIDTH,
      tempoMultiplier: 1.5,
    });
    engine.start();

    const cursorCtrl = new FastCursorLayerController(cursorsEl, { showLabels: false });
    const overlayCtrl = new FastOverlayCanvasController(canvasEl);

    let rafId = 0;
    let lastTime = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      engine.step(dt);
      cursorCtrl.sync(engine);
      overlayCtrl.sync(engine);
      if (!engine.flocking) {
        rafId = requestAnimationFrame(frame);
      }
    };
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      cursorCtrl.destroy();
      overlayCtrl.destroy();
    };
  }, []);

  return (
    <div ref={rootRef} className="swarm-root">
      {children}
      <canvas
        ref={canvasRef}
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 40 }}
      />
      <div ref={cursorsRef} className="cursors" style={{ zIndex: 42 }} />
    </div>
  );
}
`;

  return [
    { path: "swarm-cursor/SKILL.md", content: buildMainSkillMarkdown() },
    {
      path: "swarm-cursor/references/01-getting-started.md",
      content: gettingStartedMd,
    },
    {
      path: "swarm-cursor/references/02-dom-and-react-components.md",
      content: domReactMd,
    },
    {
      path: "swarm-cursor/references/03-media-3d-and-2d-builders.md",
      content: mediaBuildersMd,
    },
    {
      path: "swarm-cursor/references/04-wasm-engine-and-theming.md",
      content: subsystemsMd,
    },
    {
      path: "swarm-cursor/examples/dom-provider-quickstart.tsx",
      content: exampleDomProvider,
    },
    {
      path: "swarm-cursor/examples/threejs-glb-3d-builder.tsx",
      content: exampleThreeGlb,
    },
    {
      path: "swarm-cursor/examples/zero-react-tick-custom-stage.tsx",
      content: exampleZeroTickStage,
    },
  ];
}

// ── Zero-Dependency PKZIP (Store / UTF-8) Archive Builder ──
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function createZipArchiveBytes(files: SkillArchiveFile[]): Uint8Array {
  const encoder = new TextEncoder();
  const entries = files.map((f) => {
    const nameBytes = encoder.encode(f.path);
    const dataBytes = encoder.encode(f.content);
    const checksum = crc32(dataBytes);
    return { nameBytes, dataBytes, checksum };
  });

  let localSize = 0;
  let centralSize = 0;
  for (const e of entries) {
    localSize += 30 + e.nameBytes.length + e.dataBytes.length;
    centralSize += 46 + e.nameBytes.length;
  }

  const totalSize = localSize + centralSize + 22;
  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer);

  let localOffset = 0;
  const offsets: number[] = [];

  for (const e of entries) {
    offsets.push(localOffset);
    // Local file header signature (0x04034b50)
    view.setUint32(localOffset, 0x04034b50, true);
    view.setUint16(localOffset + 4, 20, true); // version needed (2.0)
    view.setUint16(localOffset + 6, 0x0800, true); // UTF-8 flag
    view.setUint16(localOffset + 8, 0, true); // compression method: Store (0)
    view.setUint16(localOffset + 10, 0, true); // mod time
    view.setUint16(localOffset + 12, 0x5421, true); // mod date
    view.setUint32(localOffset + 14, e.checksum, true);
    view.setUint32(localOffset + 18, e.dataBytes.length, true);
    view.setUint32(localOffset + 22, e.dataBytes.length, true);
    view.setUint16(localOffset + 26, e.nameBytes.length, true);
    view.setUint16(localOffset + 28, 0, true);
    out.set(e.nameBytes, localOffset + 30);
    out.set(e.dataBytes, localOffset + 30 + e.nameBytes.length);
    localOffset += 30 + e.nameBytes.length + e.dataBytes.length;
  }

  const centralStart = localOffset;
  let centralOffset = centralStart;

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    // Central directory file header signature (0x02014b50)
    view.setUint32(centralOffset, 0x02014b50, true);
    view.setUint16(centralOffset + 4, 20, true); // version made by
    view.setUint16(centralOffset + 6, 20, true); // version needed
    view.setUint16(centralOffset + 8, 0x0800, true); // UTF-8 flag
    view.setUint16(centralOffset + 10, 0, true); // Store
    view.setUint16(centralOffset + 12, 0, true);
    view.setUint16(centralOffset + 14, 0x5421, true);
    view.setUint32(centralOffset + 16, e.checksum, true);
    view.setUint32(centralOffset + 20, e.dataBytes.length, true);
    view.setUint32(centralOffset + 24, e.dataBytes.length, true);
    view.setUint16(centralOffset + 28, e.nameBytes.length, true);
    view.setUint16(centralOffset + 30, 0, true);
    view.setUint16(centralOffset + 32, 0, true);
    view.setUint16(centralOffset + 34, 0, true);
    view.setUint16(centralOffset + 36, 0, true);
    view.setUint32(centralOffset + 38, 0, true);
    view.setUint32(centralOffset + 42, offsets[i], true);
    out.set(e.nameBytes, centralOffset + 46);
    centralOffset += 46 + e.nameBytes.length;
  }

  // End of central directory record (0x06054b50)
  view.setUint32(centralOffset, 0x06054b50, true);
  view.setUint16(centralOffset + 4, 0, true);
  view.setUint16(centralOffset + 6, 0, true);
  view.setUint16(centralOffset + 8, entries.length, true);
  view.setUint16(centralOffset + 10, entries.length, true);
  view.setUint32(centralOffset + 12, centralOffset - centralStart, true);
  view.setUint32(centralOffset + 16, centralStart, true);
  view.setUint16(centralOffset + 20, 0, true);

  return out;
}

export function downloadSwarmCursorSkillsZip(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const files = buildSkillArchiveFiles();
  const zipBytes = createZipArchiveBytes(files);
  const blob = new Blob([zipBytes.buffer as ArrayBuffer], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "swarm-cursor-skills.zip";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
