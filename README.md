# SwarmCursor 2.0

**Compiled Rust/WASM Multi-Agent Figma Cursor Choreography, 3D / Three.js / GLB Builder (`extrude` · `particles` · `slice`), Auto Deep DOM Scanner & Zero-React-Tick 60fps Renderer for React & Vanilla TypeScript.**

Repository: **[https://github.com/CoderFake/SwarmCursor](https://github.com/CoderFake/SwarmCursor)**

---

## Tính năng nổi bật trong SwarmCursor 2.0

### 1. Hỗ trợ vẽ 3D / Three.js / GLB (`@swarm/three`)
Hỗ trợ đầy đủ **3 thuật toán hiệu ứng xây dựng 3D** (có thể dùng riêng lẻ hoặc kết hợp cả 3 qua `buildMode="all"`):
- **`extrude` (3D Gizmo Sculpt & Wireframe Extrusion)**: Con trỏ trưởng nhóm (Lead Cursor) kéo trục tọa độ 3D Gizmo `X / Y / Z` dựng lồng khung dây (Wireframe Bounding Cage), chiếu trực tiếp đỉnh 3D sang màn hình 2D.
- **`particles` (Mesh Surface Area CDF Sampling + GPU Particle Swarm)**: Lấy mẫu bề mặt lưới tam giác theo diện tích tích lũy (`CumulativeAreaSampler` $O(\log M)$ binary search) và hội tụ hàng nghìn hạt phát sáng trên GPU (`PARTICLE_BUILD_VERTEX_SHADER`).
- **`slice` (Holographic 3D Printing / Laser Clipping Plane)**: Quét mặt phẳng cắt laser (`THREE.Plane` + `HOLOGRAPHIC_SLICE_FRAGMENT_CHUNK`) từ đáy lên đỉnh để chuyển khối 3D từ khung dây/hạt sang vật liệu PBR/Liquid Glass hoàn chỉnh.

### 2. Quét đệ quy các DOM bên trong Component (`@swarm/scanner`)
- **`scanDeepDOM(root)` & `LayoutReadCache`**: Tự động đi sâu vào bên trong các component (`[data-swarm-deep="true"]` hoặc `deepScan={true}`) để tách các thẻ con (`h1..h6`, `p`, `span`, `button`, `input`, `svg/path`, `canvas[data-swarm-3d]`) thành đồ thị phụ thuộc **DAG Cha $\rightarrow$ Con**.
- **Mở khóa sớm theo đường ống (`DAGScheduler` @ `60%`)**: Ngay khi khung container cha vừa kéo được `60%`, đàn chuột con lập tức lao vào gõ chữ, đồ nét vector SVG và dựng khối 3D bên trong mà không phải chờ cha xong `100%`.

### 3. Đa thao tác / Phối hợp Đội nhóm (`@swarm/tools` — Multi-Agent Squad)
- **`SquadCoordinator` (Work-Stealing)**: Cho phép **2–6 con trỏ AI** hợp tác cùng lúc trên một vật thể 3D hoặc một container phức tạp (`squadSize` / `data-swarm-squad="4"`):
  - **1 Lead Cursor**: Kéo trục 3D Gizmo X/Y/Z hoặc dựng khung chính.
  - **N Assistant Cursors**: Bay quanh các đỉnh 3D được chiếu lên màn hình, bắn tia hàn hạt (`3d-extrude-beam`) và quét tia laser cắt lớp (`active3DLasers`).

### 4. Hiệu ứng Xây dựng Hình ảnh 2D (`<SwarmImage>` / `data-swarm="image"`)
Cung cấp **3 thuật toán hiệu ứng xây ảnh (Image Construction)** lấy cảm hứng từ Progressive JPEG/Quadtree Subdivisions, Holographic CRT Rasterization và Halftone Screen-Printing (có thể dùng riêng hoặc kết hợp cả 3 qua `buildMode="all"`):
- **`mosaic` (Progressive Quadtree / Macro-Block Pixelation Refinement)**: Khởi tạo ảnh từ lưới ô vuông thô (`32px` $\rightarrow$ `16px` $\rightarrow$ `8px` $\rightarrow$ `4px` $\rightarrow$ `0px`) kết hợp con trỏ quét chéo tinh chỉnh độ nét.
- **`scanline` (Holographic Laser Raster Scan)**: Con trỏ kéo tia laser ngang màu xanh/tím quét từ đỉnh xuống đáy ảnh (`clip-path: inset(...)` + `IMG·SCAN` badge), để lộ ảnh thật bên dưới đường quét kèm lưới blueprint phía trước.
- **`halftone` (Halftone Dot-Matrix Screen-Printing)**: Tái tạo ảnh qua ma trận chấm bi in lụa tăng dần bán kính và độ tương phản trước khi hội tụ thành ảnh gốc sắc nét.
- **`all` (Multi-Pass Image Synthesis)**: Kết hợp cả 3 pha (`mosaic` dựng bố cục màu $\rightarrow$ `scanline` quét tia laser $\rightarrow$ `halftone` khóa nét).

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

### 5. Tối ưu Hiệu năng bằng Rust/WASM & Render Zero-React-Tick (`@swarm/kernel` & `@swarm/renderers`)
- **Lõi biên dịch Rust $\rightarrow$ WebAssembly (`crates/swarm-kernel-wasm`)**:
  - Lưu trữ toàn bộ trạng thái con trỏ trong `Float32Array` phẳng (`SoACursorBuffer`, 16 floats/cursor).
  - Thuật toán **Uniform Spatial Hash Grid Boids $O(N)$** và phép chiếu **Batch 4x4 Matrix 3D $\rightarrow$ 2D** chạy trong WASM (kèm JS TypedArray fallback tự động).
- **Render 60fps không kích hoạt React Re-render (`@swarm/renderers`)**:
  - `FastCursorLayerController`: DOM Pool cố định cập nhật vị trí chuột bằng `transform: translate3d(x, y, 0)`.
  - `FastOverlayCanvasController`: Vẽ toàn bộ khung chọn xanh `#0D99FF`, đường gióng đỏ `#F24822`, trục 3D Gizmo X/Y/Z và tia laser trên một `<canvas>` 2D duy nhất.

---

## Cài đặt nhanh

```bash
npm install git+https://github.com/CoderFake/SwarmCursor.git
```

---

## Hướng dẫn sử dụng nhanh

### 1. Chế độ DOM-Driven + Deep DOM + `<Swarm3D>` (React)

```tsx
import {
  SwarmProvider,
  SwarmElement,
  Swarm3D,
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
        <button>Explore Architecture</button>
      </article>

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

### 2. Tích hợp vào Scene Three.js / WebGL có sẵn (`registerSwarm3D` + Shaders)

Khi bạn đã có sẵn một scene Three.js (như `CrystalOrb3D`), hãy đăng ký qua `registerSwarm3D` để nhận tiến độ `progress` và trọng số 3 giai đoạn `weights` (`extrude`, `particles`, `slice`) ở mỗi frame:

```tsx
import * as THREE from "three";
import {
  registerSwarm3D,
  CumulativeAreaSampler,
  PARTICLE_BUILD_VERTEX_SHADER,
  PARTICLE_BUILD_FRAGMENT_SHADER,
} from "swarm-cursor";

// 1. Lấy mẫu 3,200 hạt phân bố đều theo diện tích bề mặt Mesh 3D (O(log M))
const sampler = new CumulativeAreaSampler(
  positionsFloat32,
  indicesUint32,
  [-2.1, -2.1, -2.1],
  [2.1, 2.1, 2.1]
);
const { targets, seeds } = sampler.sampleBatch(3200);

// 2. Tạo hệ hạt GPU lắp ráp khối 3D
const particleMat = new THREE.ShaderMaterial({
  vertexShader: PARTICLE_BUILD_VERTEX_SHADER,
  fragmentShader: PARTICLE_BUILD_FRAGMENT_SHADER,
  uniforms: {
    uBuildProgress: { value: 0 },
    uTime: { value: 0 },
    uPointSize: { value: 6.5 },
  },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

// 3. Đăng ký với SwarmEngine để đội 4 con trỏ điều khiển 3 giai đoạn build
const unregister = registerSwarm3D("dom-orb-sphere", {
  buildMode: "all",
  squadSize: 4,
  boundingBox: { min: [-2.1, -2.1, -2.1], max: [2.1, 2.1, 2.1] },
  onProgress: (progress, weights) => {
    wireframeCage.material.opacity = weights.extrude * 0.65;
    particleMat.uniforms.uBuildProgress.value = Math.max(weights.particles, progress);
    // Quét mặt phẳng cắt laser từ đáy lên đỉnh ở giai đoạn slice
    slicePlane.constant = -2.3 + weights.slice * 4.7;
  },
});
```

---

## Tài liệu chi tiết (`docs/`)

- **Bắt đầu (`docs/getting-started/`)**
  - [Cài đặt & Thiết lập](./docs/getting-started/installation.md)
  - [Bắt đầu nhanh trong 60 giây](./docs/getting-started/quick-start.md)
- **React Components (`docs/components/`)**
  - [`<SwarmProvider>`, `<SwarmElement>` & `<Swarm3D>`](./docs/components/swarm-provider.md)
  - [`<SwarmFollower>` (Mouse Follow & Circular Vortex Orbit)](./docs/components/swarm-follower.md)
  - [`<SwarmAgentPill>` (Bottom-Bar 5 AI Icons Queue + `{N} agents`)](./docs/components/swarm-agent-pill.md)
  - [`<SwarmCanvas>` & `SceneBuilder`](./docs/components/swarm-canvas.md)
  - [`<SwarmControls>` & `useSwarm()` Hook](./docs/components/swarm-controls.md)
- **Vanilla JS / TS & Modular Subsystems API (`docs/vanilla-api/`)**
  - [API Reference (`@swarm/kernel`, `@swarm/scanner`, `@swarm/three`, `@swarm/tools`, `@swarm/renderers`)](./docs/vanilla-api/reference.md)
- **Tùy biến (`docs/customization/`)**
  - [HTML Attributes `data-swarm-*` & CSS Variables](./docs/customization/theming-and-attributes.md)

---

## License

MIT © [CoderFake](https://github.com/CoderFake/SwarmCursor)
