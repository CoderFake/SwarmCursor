# Swarm Cursor Library (`swarm-cursor`) — Design Specification

**Date**: 2026-11-04  
**Package Path**: `/Users/hoangdieu/Projects/swarm-cursor`  
**Reference Implementation**: Decompiled `https://califa.github.io/swarm-site/` (`index-BcWSe1v5.js`, `index-DaDOAYTB.css`)

---

## 1. Goal & Scope

Build a production-grade, zero-dependency Vanilla TypeScript + CSS + React NPM library (`swarm-cursor`) that reproduces 100% of the visual, physics, and Figma-tool choreography effects from `califa.github.io/swarm-site/`, while adding:
1. **3 Input Modes**:
   - **Virtual Artboard / Scene-Graph Mode (`SceneBuilder` / `<SwarmCanvas>`)**: Exact 1:1 coordinate-driven canvas (`1280px` scalable artboard) with sticky header synchronization, SVG paths, rects, texts, guides, and duplicate groups.
   - **Real DOM Mode (`DOMScanner` / `data-swarm` / `<SwarmElement>`)**: Automatically measures live HTML/React elements via `getBoundingClientRect()` & `ResizeObserver`, hides or wireframes them initially, and orchestrates AI cursors to draw/type/duplicate/snap them before revealing the live interactive DOM nodes.
   - **Hybrid Mode**: Combines live DOM elements with virtual SVG dividers, connectors, and Figma alignment guides.
2. **3 Scroll Modes (`manual` | `auto` | `hybrid`)**:
   - `manual`: Scroll-driven frontier (`viewBot`) with scroll velocity tempo boost (`2.1x` to `4.5x`).
   - `auto`: Smooth director autopilot that scrolls the viewport automatically to follow active tasks and advance the frontier.
   - `hybrid`: Autopilot scroll that immediately yields to user wheel/touch/keyboard input and resumes after `2.8s` of inactivity.
3. **Complete Figma Tool Choreography & Physics**:
   - **9 SVG Cursor Shapes**: `arrow`, `dup`, `pen`, `pen-add`, `pen-close`, `cross`, `ibeam`, `ew`, `ns` with exact SVG paths, hotspots, click-press scale (`1 - press * 0.12`), and velocity-aligned rotation.
   - **6 Generator Coroutines (`function*`)**:
     - `*drawPath` & `*drawLogo`: Pen tool vertex placement, blue vector preview line (`#0D99FF`) tracking the active cursor, vertex circles (`r=3.6`), path closing, and `strokeDashoffset` / `fillOpacity` transitions.
     - `*drawRect`: Crosshair marquee drag from `(0,0)` to `(w,h)` in `#D9D9D9` wireframe with live `W × H` badge and ruler projection lines, transitioning smoothly (`220ms ease`) to final background, border-radius, and inset border shadow.
     - `*dragGuide`: Slides in top & left `#2c2c2c` Figma rulers (`20px` thick), moves cursor to the ruler, switches to `ew`/`ns` resize cursor, pulls out a `#F24822` red alignment guide, and fades it out `1.2s` after dependent elements finish snapping.
     - `*drawText`: Crosshair text-box drag or click, `ibeam` cursor typing with human-like cadence (random `12–40ms` per char, space/newline pauses, `2.5%` thinking pause) and blinking caret, stepped font-size growth (`18 -> 24 -> 32 -> 40 -> 48 -> 56 -> 64 -> target`), and drag-to-snap alignment that triggers a red glow flash (`drop-shadow(0 0 5px #F24822)`) on the guide when within `9px`.
     - `*duplicate`: Selects nearest completed source group, switches to `dup` double-arrow cursor, drags a clone into position while rendering red bounding boxes and a live red distance measurement line + badge (`spacing()`), then releases.
     - `*editText`: Double-clicks duplicated text, highlights all text in Figma selection blue (`#0d99ff47`), and types replacement text.
   - **Boids Vortex Flocking & Mouse Repulsion (`follow`, `flock`)**:
     - 3-lobed flower vortex orbit around target/center (`1 + 0.3 * sin(3*theta + 0.7*t)`), smooth tangential direction reversal (`tanh(cos(t * 0.11) * 3)`), neighbor velocity alignment within `90px`, and `48px` mouse repulsion bubble with elastic velocity reflection.
4. **Playback & Debug Control Bar (`SwarmControls`)**:
   - Floating glassmorphic toolbar to toggle Play/Pause, Restart, Scroll Mode (`Manual` / `Auto` / `Hybrid`), Tempo multiplier (`0.5x` – `5x`), Rulers visibility, and live Agent/Task counters.

---

## 2. Package Architecture & Exports

```text
/Users/hoangdieu/Projects/swarm-cursor/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── src/
│   ├── core/
│   │   ├── constants.ts      # Agent names, colors, cursor SVG paths, hotspots, default palette & typography
│   │   ├── types.ts          # All TypeScript interfaces for elements, tasks, cursors, overlays, options
│   │   ├── text-measure.ts   # Offscreen Canvas 2D text measurement with caching + YAML code highlighter
│   │   ├── scene-builder.ts  # Fluent & functional builder for paths, rects, texts, guides, dupGroups, frames
│   │   ├── dom-scanner.ts    # Scans [data-swarm] DOM nodes, syncs coordinates, manages reveal state
│   │   ├── physics.ts        # Boids vortex flocking & 48px mouse repulsion physics
│   │   ├── autoscroll.ts     # Director auto-scroll & hybrid user-interrupt controller
│   │   ├── engine.ts         # SwarmEngine class: DAG scheduler, 6 generator coroutines, worker lifecycle
│   │   └── vanilla-mount.ts  # Pure DOM/SVG renderer for non-React usage (createSwarm)
│   ├── react/
│   │   ├── CursorSvg.tsx     # 9-state SVG cursor component
│   │   ├── Overlays.tsx      # Selection boxes, handles, badges, path preview, red guides, rulers
│   │   ├── SwarmCanvas.tsx   # Full Virtual Artboard component (memoized Text/Rect/Path + StickyNav)
│   │   ├── SwarmProvider.tsx # Hybrid/DOM mode provider + useSwarm() hook + <SwarmElement> wrapper
│   │   ├── SwarmControls.tsx # Interactive playback, auto-scroll, and tempo control bar
│   │   └── index.ts          # React entry point
│   ├── presets/
│   │   └── swarm-landing.ts  # Complete original califa/swarm-site scene preset for instant demo/testing
│   ├── styles/
│   │   └── swarm-cursor.css  # Complete stylesheet (artboard, rulers, cursors, selection, controls)
│   └── index.ts              # Core entry point
└── tests/
    ├── engine.test.ts        # Unit tests for DAG scheduling, coroutines, spacing, flocking, autoscroll
    └── scene-builder.test.ts # Unit tests for scene graph & DOM scanner
```

### `package.json` Subpath Exports
- `swarm-cursor`: Core Vanilla TS classes (`SwarmEngine`, `SceneBuilder`, `DOMScanner`, `AutoScrollController`, `createSwarm`, `buildSwarmLandingScene`)
- `swarm-cursor/react`: React 18/19 components & hooks (`SwarmCanvas`, `SwarmProvider`, `SwarmElement`, `SwarmControls`, `useSwarm`)
- `swarm-cursor/styles.css`: Complete CSS stylesheet

---

## 3. Data Flow & State Management

1. **Initialization**:
   - Fonts are preloaded (`document.fonts.load`) with a fallback timeout (`2500ms`).
   - Either `SceneBuilder` constructs virtual elements (`els`, `tasks`, `groups`) OR `DOMScanner` inspects `[data-swarm]` DOM nodes and registers corresponding tasks and bounding boxes.
   - `SwarmEngine` spawns `18` initial cursors in an orbital ring (`r = 160px`) with `follow = true`.
2. **Frame Tick (`engine.step(dt)`)**:
   - `AutoScrollController.update(dt, engine)` advances `window.scrollY` smoothly toward the active task cluster when in `auto` or `hybrid` mode (unless paused by user wheel/touch interaction).
   - `engine.step(dt)` updates scroll velocity `vel`, calculates `tempo`, interpolates `rulers.t`, fades completed guides, spawns/retires worker cursors (`6` to `48`), assigns ready DAG tasks from `available()` via `pick()`, advances each cursor's generator coroutine (`c.gen.next(dt)`), and increments `el.v++` on mutated elements.
3. **Rendering**:
   - In React (`<SwarmCanvas>` / `<SwarmProvider>`), `React.memo` compares `prev.v === next.v` so only mutated elements re-render during the 60fps loop.
   - In Vanilla JS (`createSwarm`), a lightweight keyed DOM/SVG reconciler updates element styles and attributes only when `el.v` changes.

---

## 4. Error Handling & Edge Cases

- **SSR Compatibility (Next.js 16 / React 19)**: `text-measure.ts` lazily creates the offscreen `<canvas>` only when `typeof document !== "undefined"`, falling back to deterministic character-width estimation during SSR.
- **Tab Backgrounding**: `dt` is clamped to `Math.min(dt, 0.05)` so returning from an inactive browser tab never causes physics explosions or teleporting cursors.
- **Window Resizing**: Viewport scale `s = Math.min(1, clientWidth / designWidth)` and `left` offset are recalculated on `resize`; in DOM mode, `ResizeObserver` updates target coordinates dynamically.
