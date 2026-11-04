# Bắt đầu nhanh trong 60 giây

Dưới đây là 6 cách sử dụng phổ biến nhất của **SwarmCursor 2.0**:

---

## Cách 1: Đàn chuột đuổi theo trỏ chuột & xoay vòng khi dừng (`<SwarmFollower />`)

```tsx
import { SwarmFollower } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function App() {
  return (
    <>
      {/* Mặc định hiện đàn chuột đuổi & xoay vòng Boids Vortex quanh trỏ chuột */}
      {/* Khai báo thêm agentPill={true} nếu muốn hiện thanh 5 icon AI + "36 agents" ở bottom bar */}
      <SwarmFollower count={36} radiusScale={1} agentPill={true} />
      <main>Nội dung trang của bạn...</main>
    </>
  );
}
```

---

## Cách 2: Đàn chuột tự động vẽ DOM, Deep DOM, `<Swarm3D>` & `<SwarmImage>` (`<SwarmProvider />`)

```tsx
import {
  SwarmProvider,
  SwarmElement,
  Swarm3D,
  SwarmImage,
  SwarmControls,
} from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function LandingPage() {
  return (
    <SwarmProvider
      scrollMode="hybrid"
      deepScan={true}
      useFastRenderers={true}
      agentPill={{ maxIcons: 5 }}
    >
      {/* 1. Gõ chữ với caret + bôi đen phóng to cỡ chữ + kéo thước đỏ trục X */}
      <SwarmElement id="hero-title" tool="text" grow snapAxis="x">
        <h1>SwarmCursor 2.0 Engine</h1>
      </SwarmElement>

      {/* 2. Container tự động quét đệ quy các thẻ h3, p, button, svg bên trong */}
      <article
        id="feature-card"
        data-swarm="rect"
        data-swarm-deep="true"
        data-swarm-deps="t:hero-title"
      >
        <h3>Deep DOM Auto-DAG</h3>
        <p>Đàn chuột mở khóa các thẻ con ngay khi khung cha đạt 60% tiến độ.</p>
        <button type="button">Explore</button>
      </article>

      {/* 3. Xây dựng hình ảnh 2D qua 3 pha (mosaic -> halftone -> scanline) */}
      <SwarmImage
        id="project-cover"
        src="/images/cover.webp"
        buildMode="all"
        deps={["r:feature-card"]}
        className="w-full h-64 rounded-2xl"
      />

      {/* 4. Đội 4 con trỏ AI điêu khắc mô hình 3D (extrude -> particles -> slice) */}
      <Swarm3D
        id="crystal-orb"
        src="/models/orb.glb"
        buildMode="all"
        squadSize={4}
        deps={["r:feature-card"]}
        className="w-80 h-80"
      >
        <canvas />
      </Swarm3D>

      <SwarmControls position="bottom-right" />
    </SwarmProvider>
  );
}
```

---

## Cách 3: Chạy Kịch bản Showcase dựng sẵn (`<SwarmCanvas />` + `buildSwarmLandingScene`)

Thư viện đi kèm sẵn kịch bản trang Landing hoàn chỉnh (`buildSwarmLandingScene`) trình diễn toàn bộ 6 công cụ Figma trên mặt phẳng `1280 × 4060`:

```tsx
import { buildSwarmLandingScene } from "swarm-cursor";
import { SwarmCanvas } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function ShowcasePage() {
  return (
    <SwarmCanvas
      scene={() => buildSwarmLandingScene(() => 18)}
      scrollMode="hybrid"
      controls={true}
      agentPill={{ maxIcons: 5, position: "bottom-center" }}
    />
  );
}
```

---

## Cách 4: Chỉ dùng thanh Bottom-Bar Queue 5 Icon AI (`<SwarmAgentPill />`)

```tsx
import { SwarmAgentPill } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export function BottomStatus() {
  return (
    <SwarmAgentPill
      count={30}
      maxIcons={5}
      intervalMs={650}
      position="bottom-center"
    />
  );
}
```

---

## Cách 5: Tăng tốc Biến dạng Lưới 3D / Boids bằng Lõi Rust/WASM SIMD128 (`swarm-cursor/kernel`)

```ts
import { wasmKernel } from "swarm-cursor/kernel";

// Biến dạng hàng nghìn đỉnh 3D + tính pháp tuyến mượt trong 1 lệnh gọi WASM duy nhất
wasmKernel.deformSculpturalMeshBatch(
  basePositionsFloat32,
  outPositionsFloat32,
  outNormalsFloat32,
  timeSeconds,
  pointerX,
  pointerY,
  extrudeWeight,
  sliceWeight,
  slicePlaneY
);
```
