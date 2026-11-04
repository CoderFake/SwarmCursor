# `<SwarmImage>` & `computeImageBuildState` (`swarm-cursor/react` & `swarm-cursor/tools`)

**Hiệu ứng Xây dựng Hình ảnh 2D Lũy tiến (`mosaic` · `scanline` · `halftone` · `all`).**

---

## 1. Ba Thuật toán Tổng hợp Ảnh 2D (`buildMode`)

- **`mosaic` (Progressive Quadtree Macro-Block Refinement)**: Khởi tạo ảnh từ lưới ô vuông thô (`32px` $\rightarrow$ `16px` $\rightarrow$ `8px` $\rightarrow$ `4px` $\rightarrow$ `0px`) kết hợp con trỏ quét chéo tinh chỉnh độ nét.
- **`scanline` (Holographic Laser Raster Scan)**: Con trỏ kéo tia laser ngang kèm nhãn `IMG·SCAN` quét từ đỉnh xuống đáy ảnh trên nền lưới blueprint (`clip-path: inset(...)`).
- **`halftone` (Halftone Dot-Matrix Screen-Printing)**: Tái tạo ảnh qua ma trận chấm bi in lụa tăng dần bán kính và độ tương phản trước khi hội tụ thành ảnh gốc sắc nét.
- **`all` (Multi-Pass Image Synthesis)**: Chuỗi hóa cả 3 pha `mosaic` $\rightarrow$ `halftone` $\rightarrow$ `scanline`.

---

## 2. Sử dụng trong React (`<SwarmImage>`)

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

## 3. Sử dụng trong HTML thuần & Hàm tính trạng thái (`computeImageBuildState`)

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
