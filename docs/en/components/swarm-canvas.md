# `<SwarmCanvas>`, `SceneBuilder` & `buildSwarmLandingScene` (Virtual Artboard Mode)

**Virtual Artboard Mode** mounts a proportionally scaled design canvas (default `1280px` width) where AI cursors execute all Figma choreography tools:
1. **Rectangle Tool (`cross` -> `arrow`)**: Drags a `#D9D9D9` wireframe box with `#0D99FF` `W × H` dimensions, then applies fill, radius, and stroke.
2. **Type Tool (`ibeam` -> `ew`)**: Types character-by-character with a blinking caret, or types small, selects all (`.text-sel`), and drags to grow font size (`grow: true`).
3. **Duplicate Group (`arrow` -> `dup`)**: Clones elements across a grid (`Alt+Drag`) and dispatches I-Beam cursors to edit each clone's copy.
4. **Vector Pen Tool (`pen` -> `pen-add` -> `pen-close`)**: Places `5×5` vector anchor points and closes SVG paths.
5. **Ruler Guide Drag (`ns` / `ew`)**: Pulls `#F24822` red alignment guides from the top/left rulers and flashes on snap.
6. **3D & Image Builders (`3d` / `image`)**: Multi-cursor squads sculpt 3D stages and laser-scan 2D images.
7. **Boids Vortex Flock**: Once all tasks finish, cursors converge into a circular vortex around the user's pointer.

---

## 1. Built-in Showcase Landing Scene (`buildSwarmLandingScene`)

```tsx
import { buildSwarmLandingScene } from "swarm-cursor";
import { SwarmCanvas } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function BuiltInLandingDemo() {
  return (
    <SwarmCanvas
      scene={() => buildSwarmLandingScene(() => 18)}
      scrollMode="hybrid"
      controls={true}
      agentPill={true}
    />
  );
}
```

---

## 2. Authoring a Custom Scene with `SceneBuilder`

```tsx
import { SceneBuilder, TYPE_STYLES, PALETTE } from "swarm-cursor";
import { SwarmCanvas } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

function createCustomScene() {
  const b = new SceneBuilder(1280);

  // 1. Drag vertical red ruler guide at X = 120 (returns task ID "g:g-left")
  const guideLeft = b.addGuide("g-left", "x", 120, 100);

  // 2. Type H1 heading (snaps to guide + grows font size)
  const heading = b.addText(
    "hero-h1",
    120,
    140,
    "Autonomous UI & 3D Engine.",
    TYPE_STYLES.h1,
    {
      w: 640,
      grow: true,
      snap: "g-left",
      deps: [guideLeft],
    }
  );

  // 3. Draw first card (returns task ID "r:card-0")
  const card = b.addRect("card-0", 120, 300, 320, 180, {
    fill: PALETTE.card,
    stroke: PALETTE.line,
    r: 14,
    deps: [heading],
  });
  b.addText("card-0-title", 148, 332, "Rust/WASM SIMD128", TYPE_STYLES.h3, {
    deps: [card],
  });

  // 4. Alt+Drag duplicate across 2 columns (addDupGroup)
  b.addDupGroup(
    "feature-cards",
    ["card-0", "card-0-title"],
    [
      { dx: 350, dy: 0, edits: ["3D Extrude & Slice"] },
      { dx: 700, dy: 0, edits: ["2D <SwarmImage>"] },
    ]
  );

  // 5. Add 3D and 2D Image tasks
  b.add3D("orb-stage", 120, 520, 320, 240, {
    buildMode: "all",
    squadSize: 4,
    deps: ["d:feature-cards:2"],
  });

  b.addImage("cover-img", 470, 520, 670, 240, {
    src: "/images/cover.webp",
    buildMode: "mosaic",
    deps: ["d:feature-cards:2"],
  });

  return b.build(840);
}
```

---

## 3. `SceneBuilder` Methods Reference

| Method | Description | Returned Task ID |
| :--- | :--- | :--- |
| `b.addGuide(id, axis, pos, triggerY)` | Drags a red alignment guide (`"x"` or `"y"`) from the top/left ruler. | `"g:" + id` |
| `b.addRect(id, x, y, w, h, opts?)` | Draws a rectangle with corner radius `r`, `fill`, and `stroke`. | `"r:" + id` |
| `b.addText(id, x, y, text, style, opts?)` | Types text with caret; supports `grow: true`, `snap`, `dyn`. | `"t:" + id` |
| `b.addPath(id, pts, opts?)` | Places SVG vector anchor points with Pen Tool (`closed`, `fill`, `stroke`). | `"p:" + id` |
| `b.addDupGroup(id, sourceIds, copies, extraDeps?)` | Clones a group via `Alt+Drag` and dispatches I-Beam cursors for `edits`. | `"d:" + id + ":2"` |
| `b.add3D(id, x, y, w, h, opts?)` | Registers a 3D build task (`extrude` · `particles` · `slice` · `all`, `squadSize`). | `"3d:" + id` |
| `b.addImage(id, x, y, w, h, opts?)` | Registers a 2D image build task (`mosaic` · `scanline` · `halftone` · `all`). | `"img:" + id` |
| `b.addSectionFrame(name, y1, y2, hatch?)` | Adds section divider lines and optional architectural side hatching. | `string` |
| `b.addHLine(id, y, deps?)` / `b.addVLine(id, x, y1, y2, deps?)` | Draws horizontal or vertical grid lines. | `"p:" + id` |
| `b.markStickyFrom(startIndex)` | Marks elements from `startIndex` as belonging to the sticky navigation bar. | `void` |
| `b.build(height)` | Finalizes and returns the `SwarmScene`. | `SwarmScene` |
