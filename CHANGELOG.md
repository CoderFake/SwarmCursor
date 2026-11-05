# Changelog

All notable changes to **SwarmCursor** (`swarm-cursor`) are documented in this file.

## [2.0.0] - 2026-11-05

### Highlights
- **Compiled Rust/WASM SIMD128 Compute Kernel (`swarm-cursor/kernel`)**:
  - `stepBoidsSpatialHash`: $O(N)$ spatial hash Boids flocking in `wasm32-unknown-unknown +simd128`.
  - `stepBezierPathsBatch`: 4-cursor `f32x4` cubic Bézier flight integration.
  - `projectPoints3DBatch`: 4x4 MVP matrix + viewport projection for 3D wireframe and surface targets.
  - `auctionTasksBatch` (`TASK_STRIDE = 8`, `MAX_TASKS = 1024`): Parallel Lead + Assistant task auction with **child-subtask priority bonus** (`slot[6]`, `+380 * priority`) and **intra-card locality burst** (`slot[7]`, `dist < 540px`), ensuring idle cursors immediately swarm unlocked child texts, bullet points, and badges inside active or cloned cards.
  - `deformSculpturalMeshBatch`: Real-time cursor-repulsion + spring-damper + wave vertex deformation for custom Three.js `BufferGeometry`.
- **Choreographed UI & Subtask Coroutines (`swarm-cursor/engine`)**:
  - Authentic Figma `Alt+Drag` group duplication (`duplicateGroupCoroutine`) with live offset sliding (`dx`, `dy`) and double-click `select-all` (`el.selAll = true`) + character-by-character re-typing (`editTextCoroutine`).
  - Fast compact child-subtask drawing (`drawRectCoroutine` & `drawTextCoroutine`) for `data-swarm-auto="true"` badges, pills, and sub-texts.
  - Cooperative `assistSubtaskCoroutine` work-stealing for long text blocks (`>= 48` chars) and large cards (`>= 36,000 px²`) with safe slice-based `typeTextCoroutine` progression.
- **3D / GLB & 2D Image Multi-Agent Builders (`swarm-cursor/three`, `swarm-cursor/tools`)**:
  - `<Swarm3D>` and `GLBSwarmController` with 3 progressive phases: Wireframe Cage Extrusion, $O(\log M)$ CDF Surface Triangle Swarm, and Holographic Y-Axis Laser Slice.
  - `<SwarmImage>` progressive 2D image builder supporting `mosaic` (Quadtree blocks), `scanline` (CRT laser sweep), and `dither` (halftone dot matrix).
- **Deep DOM DAG Scanner & Zero-React-Tick 60fps Renderers (`swarm-cursor/scanner`, `swarm-cursor/renderers`, `swarm-cursor/react`)**:
  - `scanDeepDOM` single-pass layout reader (`LayoutReadCache`) with automatic parent-to-child DAG dependencies and 60% early child unlock.
  - `FastCursorLayerController` and `FastOverlayCanvasController` driving 60fps cursor transforms (`translate3d`) and selection/measure overlays with zero React re-renders per frame.
  - Cursor labels hidden by default for a clean, distraction-free canvas and mobile viewport frontier auto-progression.
- **AI Agent Skills Package (`skills/swarm-cursor` & `swarm-cursor-skills.zip`)**:
  - Bundled `SKILL.md` and 7 reference guides for Claude Code, Cursor, Antigravity, Windsurf, and Copilot.
