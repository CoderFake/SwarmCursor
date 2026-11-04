# SwarmCursor 2.0

**Compiled Rust/WASM SIMD128 Multi-Agent Figma Cursor Choreography, 3D / Three.js / GLB Builder (`extrude` · `particles` · `slice`), 2D `<SwarmImage>` Builder (`mosaic` · `scanline` · `halftone`), Auto Deep DOM Scanner & Zero-React-Tick 60fps Renderer for React & Vanilla TypeScript.**

Repository: **[https://github.com/CoderFake/SwarmCursor](https://github.com/CoderFake/SwarmCursor)**

---

## Tính năng nổi bật trong SwarmCursor 2.0

### 1. Hỗ trợ vẽ 3D / Three.js / GLB (`swarm-cursor/three`)
Hỗ trợ đầy đủ **3 thuật toán hiệu ứng xây dựng 3D** (có thể dùng riêng lẻ hoặc kết hợp cả 3 qua `buildMode="all"`):
- **`extrude` (3D Gizmo Sculpt & Wireframe Extrusion)**: Con trỏ trưởng nhóm (Lead Cursor) kéo trục tọa độ 3D Gizmo `X / Y / Z` dựng lồng khung dây (Wireframe Bounding Cage), chiếu trực tiếp đỉnh 3D sang màn hình 2D.
- **`particles` (Mesh Surface Area CDF Sampling + GPU Particle Swarm)**: Lấy mẫu bề mặt lưới tam giác theo diện tích tích lũy (`CumulativeAreaSampler` $O(\log M)$ binary search) và hội tụ hàng nghìn hạt phát sáng trên GPU (`PARTICLE_BUILD_VERTEX_SHADER`).
- **`slice` (Holographic 3D Printing / Laser Clipping Plane)**: Quét mặt phẳng cắt laser (`THREE.Plane` + `HOLOGRAPHIC_SLICE_FRAGMENT_CHUNK`) từ đáy lên đỉnh để chuyển khối 3D từ khung dây/hạt sang vật liệu PBR/Liquid Glass hoàn chỉnh.

### 2. Quét đệ quy các DOM bên trong Component (`swarm-cursor/scanner`)
- **`scanDeepDOM(root)` & `LayoutReadCache`**: Tự động đi sâu vào bên trong các component (`[data-swarm-deep="true"]` hoặc `deepScan={true}`) để tách các thẻ con (`h1..h6`, `p`, `span`, `button`, `input`, `svg/path`, `canvas[data-swarm-3d]`, `img[data-swarm-image]`) thành đồ thị phụ thuộc **DAG Cha $\rightarrow$ Con**.
- **Mở khóa sớm theo đường ống (`DAGScheduler` @ `60%`)**: Ngay khi khung container cha vừa kéo được `60%`, đàn chuột con lập tức lao vào gõ chữ, đồ nét vector SVG, dựng ảnh và điêu khắc khối 3D bên trong mà không phải chờ cha xong `100%`.

### 3. Đa thao tác / Phối hợp Đội nhóm (`swarm-cursor/tools` — Multi-Agent Squad)
- **`SquadCoordinator` (Work-Stealing)**: Cho phép **2–6 con trỏ AI** hợp tác cùng lúc trên một vật thể 3D hoặc một container phức tạp (`squadSize` / `data-swarm-squad="4"`):
  - **1 Lead Cursor**: Kéo trục 3D Gizmo X/Y/Z hoặc dựng khung chính.
  - **N Assistant Cursors**: Bay quanh các đỉnh 3D được chiếu lên màn hình, bắn tia hàn hạt (`3d-extrude-beam`) và quét tia laser cắt lớp (`active3DLasers`).

### 4. Hiệu ứng Xây dựng Hình ảnh 2D (`<SwarmImage>` / `data-swarm="image"`)
Cung cấp **3 thuật toán hiệu ứng xây ảnh (Image Construction)** lấy cảm hứng từ Progressive JPEG/Quadtree Subdivisions, Holographic CRT Rasterization và Halftone Screen-Printing (có thể dùng riêng hoặc kết hợp cả 3 qua `buildMode="all"`):
- **`mosaic` (Progressive Quadtree / Macro-Block Pixelation Refinement)**: Khởi tạo ảnh từ lưới ô vuông thô (`32px` $\rightarrow$ `16px` $\rightarrow$ `8px` $\rightarrow$ `4px` $\rightarrow$ `0px`) kết hợp con trỏ quét chéo tinh chỉnh độ nét.
- **`scanline` (Holographic Laser Raster Scan)**: Con trỏ kéo tia laser ngang màu xanh/tím quét từ đỉnh xuống đáy ảnh (`clip-path: inset(...)` + `IMG·SCAN` badge), để lộ ảnh thật bên dưới đường quét kèm lưới blueprint phía trước.
- **`halftone` (Halftone Dot-Matrix Screen-Printing)**: Tái tạo ảnh qua ma trận chấm bi in lụa tăng dần bán kính và độ tương phản trước khi hội tụ thành ảnh gốc sắc nét.
- **`all` (Multi-Pass Image Synthesis)**: Kết hợp cả 3 pha (`mosaic` dựng bố cục màu $\rightarrow$ `halftone` lên hạt $\rightarrow$ `scanline` quét tia laser khóa nét).

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

### 5. Lõi Rust/WASM SIMD128 Song song & Render Zero-React-Tick (`swarm-cursor/kernel` & `swarm-cursor/renderers`)
- **5 đường ống tính toán song song trong Rust $\rightarrow$ WebAssembly SIMD128 (`crates/swarm-kernel-wasm/src/`)**:
  1. `stepBoids`: Thuật toán **Uniform Spatial Hash Grid Boids $O(N)$** trên bộ đệm phẳng `SoACursorBuffer` (16 floats/cursor).
  2. `stepBezierPathsBatch`: Giải đồng thời **4 đường cong Cubic Bezier mỗi chu kỳ lệnh (`f32x4`)** khi đàn chuột bay chuyển tiếp giữa các tác vụ.
  3. `project3DBatch`: Nhân ma trận `4×4 MVP` bằng thanh ghi `f32x4` và chia phối cảnh cho hàng nghìn đỉnh 3D $\rightarrow$ 2D.
  4. `auctionTasksBatch`: Đấu giá giao việc song song giữa các con trỏ rảnh và hàng đợi tác vụ theo khoảng cách & độ ưu tiên khung nhìn.
  5. `deformSculpturalMeshBatch`: Biến dạng lưới đỉnh 3D đa tầng sóng hài + tính pháp tuyến giải tích (`analytical normals`) trực tiếp trong bộ nhớ tuyến tính WASM.
- **Render 60fps không kích hoạt React Re-render (`swarm-cursor/renderers`)**:
  - `FastCursorLayerController`: DOM Pool cố định cập nhật vị trí chuột bằng `transform: translate3d(x, y, 0)`.
  - `FastOverlayCanvasController`: Vẽ toàn bộ khung chọn xanh `#0D99FF`, đường gióng đỏ `#F24822`, trục 3D Gizmo X/Y/Z và tia laser trên một `<canvas>` 2D duy nhất.

---

## Cài đặt nhanh & Kiến trúc 8 Sub-Packages

```bash
npm install git+https://github.com/CoderFake/SwarmCursor.git
```

SwarmCursor 2.0 được chia thành các **Sub-Packages độc lập (Tree-Shakeable Subpath Exports)** để dễ dàng mở rộng và chỉ import đúng phần cần dùng:

| Sub-package Import | Nội dung & Trách nhiệm |
|---|---|
| `swarm-cursor` | Barrel export đầy đủ toàn bộ Core, Engine, Kernel, 3D, Scanner, Renderers, Tools & `buildSwarmLandingScene` |
| `swarm-cursor/engine` | Lõi điều phối `SwarmEngine` đã tách nhỏ (`SwarmEngine`, `scheduler`, `cursor-motion`, `tool-coroutines`, `bounds-and-overlays`, `scene-loader`) |
| `swarm-cursor/kernel` | Lõi biên dịch **Rust/WASM SIMD128** (`SwarmKernel`, `wasmKernel`, `SoACursorBuffer`, `DAGScheduler`, `boids-ops`, `bezier-ops`, `projection-ops`, `auction-ops`, `mesh-ops`) |
| `swarm-cursor/three` | Tích hợp 3D / Three.js / GLB (`CumulativeAreaSampler`, `ProjectionBridge`, `PARTICLE_BUILD_*_SHADER`, `SwarmGLBController`) |
| `swarm-cursor/scanner` | Quét đệ quy DOM & bộ đệm đo kích thước (`scanDeepDOM`, `LayoutReadCache`) |
| `swarm-cursor/renderers` | Render 60fps không tốn React tick (`FastCursorLayerController`, `FastOverlayCanvasController`) |
| `swarm-cursor/tools` | Hệ thống Plugin công cụ & Điều phối đội nhóm (`ToolRegistry`, `SquadCoordinator`, `three-tools`, `image-tools`) |
| `swarm-cursor/react` | Các React Component (`<SwarmProvider>`, `<SwarmElement>`, `<Swarm3D>`, `<SwarmImage>`, `<SwarmFollower>`, `<SwarmAgentPill>`, `<SwarmCanvas>`, `<SwarmControls>`) |
| `swarm-cursor/styles.css` | Stylesheet chuẩn cho con trỏ, khung chọn, kính mờ và hiệu ứng 3D/Image |

---

## Hướng dẫn sử dụng nhanh

### 1. Chế độ DOM-Driven + Deep DOM + `<Swarm3D>` + `<SwarmImage>` (React)

```tsx
import {
  SwarmProvider,
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
      useFastRenderers={true}
      agentPill={{ maxIcons: 5, position: "bottom-center" }}
    >
      {/* Container tự động quét sâu các thẻ h2, p, button, svg bên trong */}
      <article id="hero-card" data-swarm="rect" data-swarm-deep="true">
        <h2>Autonomous 3D & UI Engineering</h2>
        <p>Đàn chuột AI tự động dựng khung, gõ chữ và điêu khắc mô hình 3D.</p>
        <button type="button">Explore Architecture</button>
      </article>

      {/* Ảnh 2D được tổng hợp qua Quadtree Mosaic / Laser Scanline / Halftone */}
      <SwarmImage
        id="hero-cover"
        src="/images/architecture-cover.webp"
        buildMode="mosaic"
        deps={["r:hero-card"]}
        className="w-full h-64 rounded-2xl"
      />

      {/* Khối 3D / GLB được đội 4 chuột AI phối hợp điêu khắc qua 3 giai đoạn */}
      <Swarm3D
        id="crystal-orb-3d"
        src="/models/crystal-orb.glb"
        buildMode="all"
        squadSize={4}
        deps={["r:hero-card"]}
        className="w-96 h-96"
      >
        <canvas />
      </Swarm3D>

      <SwarmControls position="bottom-right" />
    </SwarmProvider>
  );
}
```

### 2. Tích hợp vào Scene Three.js / WebGL có sẵn (`registerSwarm3D` + `wasmKernel`)

Khi bạn đã có sẵn một scene Three.js (như `CrystalOrb3D`), hãy đăng ký qua `registerSwarm3D` và tăng tốc biến dạng lưới đỉnh bằng `wasmKernel.deformSculpturalMeshBatch`:

```tsx
import * as THREE from "three";
import {
  registerSwarm3D,
  CumulativeAreaSampler,
  PARTICLE_BUILD_VERTEX_SHADER,
  PARTICLE_BUILD_FRAGMENT_SHADER,
} from "swarm-cursor/three";
import { wasmKernel } from "swarm-cursor/kernel";

// 1. Lấy mẫu 3,200 hạt phân bố đều theo diện tích bề mặt Mesh 3D (O(log M))
const sampler = new CumulativeAreaSampler(
  positionsFloat32,
  indicesUint32,
  [-2.1, -2.1, -2.1],
  [2.1, 2.1, 2.1]
);
const { targets, seeds } = sampler.sampleBatch(3200);

// 2. Đăng ký với SwarmEngine để đội 4 con trỏ điều khiển 3 giai đoạn build
const unregister = registerSwarm3D("dom-orb-sphere", {
  buildMode: "all",
  squadSize: 4,
  boundingBox: { min: [-2.1, -2.1, -2.1], max: [2.1, 2.1, 2.1] },
  onProgress: (progress, weights) => {
    wireframeCage.material.opacity = weights.extrude * 0.65;
    particleMat.uniforms.uBuildProgress.value = Math.max(weights.particles, progress);
    slicePlane.constant = -2.3 + weights.slice * 4.7;
  },
});

// 3. Trong vòng lặp animation: biến dạng toàn bộ đỉnh & pháp tuyến bằng Rust/WASM SIMD128
wasmKernel.deformSculpturalMeshBatch(
  basePositions,
  posAttr.array as Float32Array,
  normAttr.array as Float32Array,
  time,
  pointerX,
  pointerY,
  weights.extrude,
  weights.slice,
  slicePlane.constant
);
```

### 3. Chạy Kịch bản Showcase dựng sẵn (`buildSwarmLandingScene`)

```tsx
import { buildSwarmLandingScene } from "swarm-cursor";
import { SwarmCanvas } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export function ShowcaseLanding() {
  return (
    <SwarmCanvas
      scene={() => buildSwarmLandingScene(() => 18)}
      scrollMode="hybrid"
      controls={true}
      agentPill={{ maxIcons: 5 }}
    />
  );
}
```

---

## Tài liệu chi tiết (`docs/vi/` & `docs/en/`)

- **Tổng quan Song ngữ (EN / VI)**: [Mục lục Tài liệu (`docs/README.md`)](./docs/README.md)
- **🇬🇧 English Documentation (`docs/en/`)**: [English Docs Index (`docs/en/README.md`)](./docs/en/README.md)
- **🇻🇳 Tài liệu Tiếng Việt (`docs/vi/`)**: [Mục lục Tiếng Việt (`docs/vi/README.md`)](./docs/vi/README.md)
  - [Cài đặt, 8 Sub-Packages & Thiết lập](./docs/vi/getting-started/installation.md)
  - [Bắt đầu nhanh trong 60 giây](./docs/vi/getting-started/quick-start.md)
  - [`<SwarmProvider>` & `<SwarmElement>`](./docs/vi/components/swarm-provider.md)
  - [`<Swarm3D>` & `registerSwarm3D` (`extrude` · `particles` · `slice`)](./docs/vi/components/swarm-3d.md)
  - [`<SwarmImage>` (`mosaic` · `scanline` · `halftone`)](./docs/vi/components/swarm-image.md)
  - [`<SwarmFollower>` (Mouse Follow & Circular Vortex Orbit)](./docs/vi/components/swarm-follower.md)
  - [`<SwarmAgentPill>` (Bottom-Bar 5 AI Icons Queue + `{N} agents`)](./docs/vi/components/swarm-agent-pill.md)
  - [`<SwarmCanvas>`, `SceneBuilder` & `buildSwarmLandingScene`](./docs/vi/components/swarm-canvas.md)
  - [`<SwarmControls>` & `useSwarm()` Hook](./docs/vi/components/swarm-controls.md)
  - [API Reference (`swarm-cursor/engine`, `/kernel`, `/three`, `/scanner`, `/tools`, `/renderers`)](./docs/vi/subsystems/reference.md)
  - [HTML Attributes `data-swarm-*` & CSS Variables](./docs/vi/customization/theming-and-attributes.md)

---

## License

MIT © [CoderFake](https://github.com/CoderFake/SwarmCursor)
