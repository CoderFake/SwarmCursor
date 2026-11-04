# `<SwarmImage>` & `computeImageBuildState` (`swarm-cursor/react` & `swarm-cursor/tools`)

**Progressive 2D Image Construction (`mosaic` · `scanline` · `halftone` · `all`).**

---

## 1. Three Image Synthesis Algorithms (`buildMode`)

- **`mosaic` (Progressive Quadtree Macro-Block Refinement)**: Initializes the image from coarse macro-blocks (`32px` $\rightarrow$ `16px` $\rightarrow$ `8px` $\rightarrow$ `4px` $\rightarrow$ `0px`) while the cursor sweeps diagonally across the frame.
- **`scanline` (Holographic Laser Raster Scan)**: The cursor drags a glowing horizontal laser line (`IMG·SCAN` badge) from top to bottom over a blueprint grid (`clip-path: inset(...)`).
- **`halftone` (Halftone Dot-Matrix Screen-Printing)**: Reconstructs the image through a screen-printed dot matrix before converging to full resolution.
- **`all` (Multi-Pass Image Synthesis)**: Chains `mosaic` $\rightarrow$ `halftone` $\rightarrow$ `scanline`.

---

## 2. React Usage (`<SwarmImage>`)

```tsx
import { SwarmImage } from "swarm-cursor/react";

<SwarmImage
  id="project-cover"
  src="/images/architecture-cover.webp"
  buildMode="mosaic" // "mosaic" | "scanline" | "halftone" | "all"
  deps={["r:project-card"]}
  className="w-full h-64 rounded-2xl"
/>
```

---

## 3. Vanilla HTML & State Helper (`computeImageBuildState`)

```html
<img
  id="hero-img"
  src="/images/hero.webp"
  data-swarm="image"
  data-swarm-image="all"
/>
```

```ts
import { computeImageBuildState } from "swarm-cursor/tools";

const state = computeImageBuildState("all", 0.5);
// state = { activePhase, pixelBlockSize, scanlineRatio, halftoneRadiusScale, blurPx }
```
