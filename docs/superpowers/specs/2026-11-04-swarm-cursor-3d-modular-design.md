# SwarmCursor 2.0 — Modular 3D/GLB, Deep DOM, Multi-Action & Rust/WASM High-Performance Design Spec

- **Date:** 2026-11-04
- **Target Repository:** `/Users/hoangdieu/Projects/swarm-cursor` (and consumer integration in `/Users/hoangdieu/Projects/portfolio_ver3`)
- **Status:** Draft for Review

---

## 1. Mục tiêu & Phạm vi Thiết kế (Goals & Scope)

Nâng cấp thư viện `swarm-cursor` từ kiến trúc 2D đơn luồng (monolithic [`src/core/engine.ts`](../../../src/core/engine.ts)) lên kiến trúc **SwarmCursor 2.0 Modular High-Performance Engine**, đáp ứng 5 yêu cầu cốt lõi:

1. **Hỗ trợ vẽ 3D, Three.js & GLB/GLTF (`@swarm/three`)**:
   - Hỗ trợ đồng thời cả 3 thuật toán hiệu ứng xây dựng (Build Effects) trên GPU:
     1. **`extrude`**: 3D Gizmo Sculpt & Wireframe Bounding-Box Extrusion.
     2. **`particles`**: `MeshSurfaceSampler` (Cumulative Area Prefix-Sum CDF) + GPU Particle Swarm Assembly.
     3. **`slice`**: Holographic 3D Printing / Clipping Plane Laser Scan chuyển mượt từ khung dây (Wireframe) sang vật liệu thật (PBR / Liquid Glass / GLB Textures).
     4. **`all` (Multi-Pass Choreography)**: Kết hợp liên hoàn cả 3 pha `extrude` $\rightarrow$ `particles` $\rightarrow$ `slice`.
   - Cung cấp cả 2 chế độ API:
     - Declarative React Component `<Swarm3D src="/model.glb" mode="all" />`.
     - Imperative Hook / Bridge `useSwarm3D()` & `registerSwarm3D()` để gắn trực tiếp vào các Three.js `Scene` / `Mesh` / `Camera` có sẵn (như `CrystalOrb3D`).

2. **Quét sâu các DOM bên trong Component (`@swarm/scanner` — Auto Deep DOM Traversal)**:
   - Chỉ cần gắn `data-swarm-deep` trên component cha hoặc bật `deepScan={true}` trên `<SwarmProvider>`, bộ quét tự động duyệt đệ quy (DFS/BFS) các phần tử con (`h1..h6`, `p`, `span`, `button`, `input`, `img`, `svg`, `path`, `canvas`, `[data-swarm-3d]`).
   - Tự động xây dựng đồ thị phụ thuộc có hướng (DAG: `Parent Container` $\rightarrow$ `Inner Layout` $\rightarrow$ `Leaf Text / SVG / 3D`) với cơ chế mở khóa sớm (*Pipeline Overlapping* khi khung cha đạt `60%`).

3. **Đa thao tác & Phối hợp Đa Tác Nhân (`@swarm/tools` — Multi-Agent Squad Choreography)**:
   - Một component phức tạp hoặc vật thể 3D được phân rã thành nhiều sub-task song song và tuần tự để **2–6 con trỏ phối hợp cùng lúc**:
     - Ví dụ trên Card UI: Cursor 1 kéo khung wireframe, Cursor 2 kéo đường gióng thước đo (`Snap Guide`), Cursor 3 gõ tiêu đề (`ibeam`), Cursor 4 đồ đường viền icon SVG (`pen`), Cursor 5 tô vật liệu/bo góc (`style`).
     - Ví dụ trên Model 3D/GLB: Cursor 1 & 2 kéo trục Gizmo X/Y/Z dựng khung hộp 3D, Cursor 3 & 4 bay quanh bề mặt phun hạt (`particles`), Cursor 5 & 6 cầm 2 đầu tia Laser quét mặt phẳng cắt (`slice`).

4. **Tối ưu Hiệu năng Cực đại với Ngôn ngữ Biên dịch Rust $\rightarrow$ WebAssembly + GPU Shaders (`@swarm/kernel` & `@swarm/renderers`)**:
   - **Zero-React-Tick Rendering**: Loại bỏ hoàn toàn `setTick(t => t + 1)` 60fps trong React. Con trỏ được cập nhật qua Direct-DOM Pool (`translate3d`), và mọi khung chọn 2D/3D Gizmo được vẽ trên **1 thẻ `<canvas>` 2D duy nhất** có cắt tỉa theo khung nhìn (Viewport Frustum Culling).
   - **Lõi Biên dịch Rust $\rightarrow$ WebAssembly (`wasm32-unknown-unknown`)**:
     - Lưu trữ dữ liệu theo cấu trúc **SoA (Structure of Arrays)** trên `Float32Array` / `Uint32Array` chia sẻ bộ nhớ **Zero-Copy** giữa Rust WASM, JS và WebGL.
     - Chạy thuật toán **Uniform Spatial Hash Grid $O(N)$** cho Boids Flocking, phép chiếu ma trận 3D $\rightarrow$ 2D (`Matrix4` $\times$ `Vector4`), và bộ lập lịch **DAG Kahn's Topological Sort + Spatial Auction Work-Stealing** trong WASM (kèm fallback sang JS TypedArray nếu môi trường không hỗ trợ WASM).

5. **Kiến trúc Module Hóa Dễ Mở Rộng (Modular & Scalable Architecture)**:
   - Tách `engine.ts` thành 6 module độc lập, sử dụng Plugin Registry cho các công cụ vẽ (`SwarmToolPlugin`) để dễ dàng thêm công cụ mới hoặc thuật toán mới mà không sửa đổi lõi điều phối.

---

## 2. Kiến trúc Module Hóa Tổng thể (Modular Architecture)

Cấu trúc thư mục mới của `/Users/hoangdieu/Projects/swarm-cursor`:

```text
swarm-cursor/
├── crates/
│   └── swarm-kernel-wasm/          # Lõi Rust biên dịch ra wasm32-unknown-unknown
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs              # Quản lý bộ nhớ tuyến tính SoA & C-ABI exports
│           ├── spatial_grid.rs     # Thuật toán Uniform Spatial Hash Grid O(N) cho Boids
│           ├── projection.rs       # Phép nhân hàng loạt Matrix4 * Vec3 chiếu 3D -> 2D
│           └── scheduler.rs        # Đấu giá khoảng cách (Spatial Auction) & Work-Stealing
├── src/
│   ├── kernel/                     # Module 1: Cầu nối WASM + SoA TypedArray Fallback
│   │   ├── soa-buffer.ts           # Cấp phát & ánh xạ Zero-Copy Float32Array / Uint32Array
│   │   ├── wasm-kernel.ts          # Nạp inline WASM binary + fallback JS SIMD-style
│   │   ├── dag-scheduler.ts        # Đồ thị DAG Kahn's Topological Sort + Ready Queue
│   │   └── index.ts
│   ├── scanner/                    # Module 2: Quét sâu DOM & 3D Discovery
│   │   ├── deep-dom-scanner.ts     # Duyệt cây DFS/BFS, phân loại ngữ nghĩa, tạo Sub-DAG
│   │   ├── layout-cache.ts         # ResizeObserver + Scroll/Viewport Frustum Culling
│   │   └── index.ts
│   ├── tools/                      # Module 3: Plugin Registry cho Công cụ & Đa thao tác
│   │   ├── registry.ts             # SwarmToolPlugin interface & ToolRegistry
│   │   ├── squad-coordinator.ts    # Điều phối nhóm 2-6 con trỏ làm việc chung trên 1 phần tử
│   │   ├── dom-tools.ts            # rect, text, svg-path, guide, dup, style-polish
│   │   ├── three-tools.ts          # 3d-extrude, 3d-particles, 3d-slice, 3d-all
│   │   └── index.ts
│   ├── three/                      # Module 4: Tích hợp Three.js & GLB Build Shaders
│   │   ├── surface-sampler.ts      # Cumulative Area Prefix-Sum (CDF) O(log M) + Decimation
│   │   ├── build-shaders.ts        # GLSL Vertex/Fragment Shaders & onBeforeCompile Injector
│   │   ├── projection-bridge.ts    # Ánh xạ 3D Box3/Slice/Waypoints sang màn hình 2D
│   │   ├── glb-controller.ts       # Quản lý vòng đời load GLB & tiến độ build
│   │   └── index.ts
│   ├── renderers/                  # Module 5: Lớp hiển thị Zero-React-Tick 60-120fps
│   │   ├── fast-cursors-layer.ts   # Direct-DOM Pool (will-change: transform, translate3d)
│   │   ├── fast-overlay-canvas.ts  # Single 2D Canvas vẽ Selection, Rulers, 3D Gizmo, Laser
│   │   ├── dom-reveal-sync.ts      # Đồng bộ CSS clip-path / opacity cho Deep DOM nodes
│   │   └── index.ts
│   ├── core/                       # Module 6: Facade tương thích ngược (v1 API Adapter)
│   └── react/                      # React Wrappers (<SwarmProvider>, <Swarm3D>, useSwarm3D)
```

---

## 3. Thiết kế Chi tiết Từng Module & Thuật toán

### 3.1. Module 1: `@swarm/kernel` (Rust WASM + SoA Memory + DAG Scheduler)

#### A. Bố cục Bộ nhớ Tuyến tính SoA (`SoACursorBuffer`)
Mỗi con trỏ $i \in [0, N_{\max})$ được lưu trong một khối bộ nhớ phẳng `Float32Array` có bước nhảy `STRIDE = 16 floats (64 bytes, căn lề cache line CPU)`:
- `offset + 0`: `x` (tọa độ thế giới 2D X)
- `offset + 1`: `y` (tọa độ thế giới 2D Y)
- `offset + 2`: `vx` (vận tốc X)
- `offset + 3`: `vy` (vận tốc Y)
- `offset + 4`: `angle` (góc xoay con trỏ)
- `offset + 5`: `speed` (tốc độ tối đa)
- `offset + 6`: `force` (lực lái tối đa)
- `offset + 7`: `orbit` (bán kính quỹ đạo xoáy)
- `offset + 8`: `phase` (pha dao động riêng)
- `offset + 9`: `curl` (hướng xoáy)
- `offset + 10`: `press` (độ nhấn chuột `0..1`)
- `offset + 11`: `targetX` (đích đến hiện tại X)
- `offset + 12`: `targetY` (đích đến hiện tại Y)
- `offset + 13..15`: dự phòng cho nội suy đường cong Bezier (`startX, startY, progress`).

#### B. Thuật toán Spatial Hash Grid $O(N)$ trong Rust WASM (`spatial_grid.rs`)
- Chia không gian màn hình thành lưới ô vuông kích thước `CELL_SIZE = 96.0px` (bằng bán kính tương tác Boids).
- Sử dụng 2 mảng nguyên tĩnh:
  - `cell_head: [i32; NUM_CELLS]` (khởi tạo `-1` mỗi bước bằng lệnh `fill(-1)` siêu nhanh).
  - `boid_next: [i32; MAX_CURSORS]` (danh sách liên kết tĩnh theo chỉ số).
- **Bước 1 (Chèn - $O(N)$)**: Tính `hash = ((x / CELL_SIZE) as usize * 73856093 ^ (y / CELL_SIZE) as usize * 19349663) & (NUM_CELLS - 1)`. Gán `boid_next[i] = cell_head[hash]; cell_head[hash] = i`.
- **Bước 2 (Truy vấn lân cận - $O(1)$ trung bình)**: Mỗi con trỏ chỉ duyệt đúng $3 \times 3 = 9$ ô xung quanh nó thông qua `cell_head` và `boid_next`, tính lực Separation, Alignment, Cohesion và Vortex Orbit.

#### C. Đồ thị Phụ thuộc DAG Kahn's Algorithm & Spatial Auction (`dag-scheduler.ts`)
- Mỗi Task $T_k$ có:
  - `inDegree: number` (số lượng task cha chưa hoàn thành hoặc chưa đạt ngưỡng kích hoạt sớm).
  - `earlyUnlockRatio: number` (mặc định `0.6` cho phép con trỏ con bắt đầu vẽ phần tử bên trong khi khung cha đã kéo được 60%).
  - `dependents: string[]` (danh sách task con).
  - `maxSquadSize: number` (số con trỏ tối đa có thể cùng tham gia hỗ trợ task này, từ `1` đến `6`).
- Khi một Task cha đạt `progress >= earlyUnlockRatio` (hoặc `done`), nó giảm `inDegree` của các `dependents`. Ngay khi `inDegree === 0`, task con được đẩy vào `readyQueue`.
- **Spatial Auction & Work-Stealing**:
  - Hàm chi phí đấu giá của con trỏ $c$ đối với task $T$:
    $$\text{Cost}(c, T) = w_{\text{viewport}} \cdot \text{Bucket}(T.y) + w_{\text{dist}} \cdot \|c.\text{pos} - T.\text{anchor}\|_2 + w_{\text{load}} \cdot T.\text{activeWorkers}$$
  - Nếu `readyQueue` rỗng nhưng vẫn còn các task phức tạp (như `3d-all`, `deep-container`, hoặc `svg-complex`) đang chạy với `activeWorkers < maxSquadSize`, các con trỏ rảnh sẽ thực hiện **Work-Stealing** (nhảy vào hỗ trợ với vai trò Assistant Cursor: cầm phụ đầu tia laser, phun thêm hạt 3D, hoặc gõ song song các dòng chữ/path bên trong).

---

### 3.2. Module 2: `@swarm/scanner` (Quét Sâu DOM Bên Trong Component)

Khi người dùng bọc giao diện trong `<SwarmProvider deepScan={true}>` hoặc gắn `data-swarm-deep` lên một Component bất kỳ:

1. **Duyệt Cây Phân Cấp (Bounded DFS Traversal)**:
   - Bỏ qua các node ẩn (`display: none`, `visibility: hidden`, kích thước `< 4x4px`) hoặc các node thuộc lớp phủ của chính SwarmCursor (`.swarm-overlay`, `.cursors`).
   - Giới hạn độ sâu mặc định `maxDepth = 5` và tự động gộp (coalesce) các thẻ inline nhỏ (`<span>`, `<strong>`, `<i>` nằm trong `<p>`) vào thẻ văn bản cha để tránh sinh ra hàng nghìn task vụn vặt.
2. **Bảng Phân Loại Ngữ Nghĩa Tự Động (`SemanticClassifier`)**:
   - **3D / WebGL (`kind: "3d"`)**: Thẻ `<canvas>` có thuộc tính `data-swarm-3d` hoặc được đăng ký qua `useSwarm3D` / `<Swarm3D>`.
   - **Vector / Icon (`kind: "path"`)**: Thẻ `<svg>` hoặc `<path>`, `<circle>`, `<polygon>` bên trong biểu đồ (như `TechSphere` radar, lucide icons). Trích xuất đường bao hoặc `getTotalLength()` để con trỏ `pen` đồ nét.
   - **Typography (`kind: "text"`)**: Các thẻ `h1..h6`, `p`, `label`, `code`, `blockquote`, `li`, hoặc `span` độc lập có text thực sự.
   - **Interactive Controls (`kind: "rect"` + `subKind: "button" | "input" | "pill" | "image"`)**: Các thẻ `button`, `a`, `input`, `textarea`, `img`, badge.
   - **Layout Container (`kind: "rect"` + `subKind: "container"`)**: Các thẻ `section`, `article`, `div` có background, border, backdrop-filter (Liquid Glass) hoặc `grid`/`flex` chứa nhiều phần tử con.
3. **Tự động Sinh Cây Phụ Thuộc Cha $\rightarrow$ Con**:
   - Container cha được gán task dựng khung trước (`r:card-1`).
   - Các phần tử con trực tiếp bên trong (`t:card-1-title`, `p:card-1-icon`, `r:card-1-btn`) tự động nhận `deps: ["r:card-1@0.6"]` (mở khóa ngay khi khung cha kéo đạt 60%).

---

### 3.3. Module 3: `@swarm/three` (Ba Thuật Toán Hiệu Ứng Build 3D / GLB / Three.js)

Module `@swarm/three` làm việc trực tiếp với đối tượng `THREE.Object3D` / `THREE.Scene` (từ file `.glb` tải qua `GLTFLoader` hoặc từ scene tùy chỉnh như [`CrystalOrb3D.tsx`](../../../../portfolio_ver3/frontend/src/components/sections/CrystalOrb3D.tsx)).

#### Thuật toán 1: `extrude` — 3D Gizmo Sculpt & Wireframe Cage
1. Tính hộp giới hạn thế giới `THREE.Box3().setFromObject(rootObject)`. Lấy 8 đỉnh $(v_0 \dots v_7)$ và tâm của 3 trục Gizmo $(X, Y, Z)$.
2. Tạo một lớp khung dây phụ (`Wireframe Helper Mesh`) dùng `THREE.EdgesGeometry` hoặc `wireframe: true` với màu `#0D99FF` / `#7C3AED`.
3. **Diễn hoạt Đa Con Trỏ**:
   - Cursor chính (`cross` $\rightarrow$ `ns`) kéo đáy hộp từ phẳng (`scaleY = 0.02`) vươn cao lên `scaleY = 1.0`.
   - Cursor phụ (`ew`) kéo rộng trục ngang (`scaleX`, `scaleZ`) và xoay nhẹ góc nhìn khởi tạo.
   - Trong suốt quá trình kéo, `FastOverlayCanvas` vẽ khung hộp phối cảnh 8 đỉnh nối với nhau bằng nét đứt CAD và hiển thị nhãn kích thước 3 chiều `W × H × D`.

#### Thuật toán 2: `particles` — `MeshSurfaceSampler` (CDF Prefix-Sum) + GPU Particle Swarm
1. **Lấy mẫu bề mặt $O(\log M)$**:
   - Duyệt toàn bộ `THREE.Mesh` trong model `.glb` / scene, tính diện tích từng tam giác $A_k = \frac{1}{2} \| (B - A) \times (C - A) \|$ và lập mảng cộng dồn (Prefix-Sum CDF).
   - Dùng tìm kiếm nhị phân (Binary Search) lấy mẫu $P \in [4000, 20000]$ điểm `aTargetPosition` phân bố đều trên bề mặt vật thể 3D kèm pháp tuyến `aNormal` và độ trễ `aDelay`.
2. **GPU Vertex & Fragment Shader (`particle-swarm.glsl.ts`)**:
   - Khởi tạo một `THREE.Points` duy nhất (1 draw call).
   - Vị trí xuất phát `aSourcePosition` của các nhóm hạt được gắn với tọa độ 3D tương ứng với vị trí của 2–4 con trỏ đang bay lượn quanh model.
   - Trong Vertex Shader:
     ```glsl
     float delayed = clamp((uParticleProgress - aDelay * 0.35) / 0.65, 0.0, 1.0);
     float eased = smoothstep(0.0, 1.0, delayed);
     vec3 swirl = vec3(
       sin(uTime * 6.0 + aDelay * 12.0),
       cos(uTime * 5.0 + aDelay * 9.0),
       sin(uTime * 7.0 - aDelay * 11.0)
     ) * 0.18 * (1.0 - eased) * sin(eased * 3.14159);
     vec3 pos = mix(aSourcePosition, aTargetPosition, eased) + swirl;
     ```
   - Khi `uParticleProgress` tiến về `1.0`, các hạt lấp lánh hội tụ khít vào bề mặt mesh.

#### Thuật toán 3: `slice` — Holographic 3D Printing & Laser Clipping Plane
1. **Tiêm Shader Không Phá Hủy (`Shader Injector`)**:
   - Giữ nguyên vật liệu gốc của model `.glb` hoặc `CrystalOrb3D` (`MeshPhysicalMaterial`, `MeshStandardMaterial`, hoặc `ShaderMaterial` tùy chỉnh).
   - Gắn `clippingPlanes: [slicePlane]` của Three.js (với `renderer.localClippingEnabled = true`) **kết hợp** một dải sáng Laser (`Laser Rim Band` / `Wireframe Cap`) chạy dọc theo tọa độ cắt $y_{\text{slice}} = \text{mix}(y_{\min}, y_{\max}, u_{\text{slice}})$.
2. **Diễn hoạt Đa Con Trỏ Hàn Laser**:
   - Tính 2 điểm đầu mút trái/phải của mặt phẳng cắt tại độ cao $y_{\text{slice}}$ trong không gian 3D: $L_{3D} = (x_{\min}, y_{\text{slice}}, z_{\text{center}})$ và $R_{3D} = (x_{\max}, y_{\text{slice}}, z_{\text{center}})$.
   - Chiếu $L_{3D}, R_{3D}$ sang tọa độ màn hình 2D bằng `vec3.project(camera)`.
   - **2 con trỏ Swarm** bám sát 2 đầu mút $L_{2D}, R_{2D}$ (hoặc chạy zíc-zắc dọc theo đường cắt như đầu in 3D nozzle), phát tia sáng Laser nối giữa 2 mũi trỏ. Mặt phẳng cắt đi tới đâu, lớp khung dây/hạt phía trên biến thành vật liệu 3D đặc (Liquid Glass / PBR) phía dưới tới đó.

---

### 3.4. Module 4: `@swarm/renderers` (Zero-React-Tick Fast Layer)

1. **`FastCursorsLayer` (Direct-DOM Pool)**:
   - Thay vì để React render `<CursorView>` mỗi frame, component chỉ mount một `<div className="swarm-fast-cursors-root" ref={containerRef} />`.
   - Class `FastCursorPool` quản lý các phần tử DOM con. Mỗi frame sau khi `kernel.step(dt)` chạy xong, vòng lặp đọc trực tiếp từ `SoACursorBuffer`:
     ```ts
     const x = left + buf[offset + 0] * s;
     const y = (buf[offset + 1] + stickyOffset) * s;
     const angle = buf[offset + 4];
     const press = buf[offset + 10];
     const scale = 1 - press * 0.14;
     domNode.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${angle.toFixed(1)}deg) scale(${scale.toFixed(2)})`;
     ```
   - Không tạo bất kỳ đối tượng VDOM nào của React trong suốt quá trình chạy 60–120fps.

2. **`FastOverlayCanvas` (Single Viewport-Culled 2D Canvas)**:
   - Một thẻ `<canvas>` kích thước đúng bằng `window.innerWidth × window.innerHeight` (`position: fixed; inset: 0; pointer-events: none; z-index: 25`).
   - Vẽ trong 1 lượt (`< 0.4ms` mỗi frame):
     - Khung chọn 2D (`Selection Box`, 4 nút vuông `handles`, nhãn kích thước `W × H`).
     - Đường gióng đỏ (`Snap Guides`) và thước đo (`Rulers`).
     - **3D Wireframe Box Gizmo** (8 đỉnh chiếu từ `Box3` của Three.js), **Trục tọa độ 3D X/Y/Z** (Đỏ / Lá / Dương), và **Tia Laser Hàn 3D** nối từ mũi con trỏ vào đường cắt `slicePlane`.

---

## 4. Thiết kế API Công khai (Public API)

Đảm bảo **tương thích ngược 100%** với API v1 hiện tại (`<SwarmProvider>`, `<SwarmFollower>`, `<SwarmAgentPill>`, `SwarmEngine`), đồng thời bổ sung các API mới:

### 4.1. Declarative `<Swarm3D>` Component (Dành cho file `.glb` / `.gltf` hoặc Custom Mesh)
```tsx
import { Swarm3D } from "swarm-cursor/react";

<Swarm3D
  id="hero-robot-glb"
  src="/models/cyber-orb.glb"
  buildMode="all" // "extrude" | "particles" | "slice" | "all"
  squadSize={4}   // Số lượng con trỏ phối hợp dựng vật thể 3D này
  autoRotate={true}
  cameraPosition={[0, 0.5, 5]}
  className="w-[480px] h-[480px]"
/>
```

### 4.2. Imperative Hook / Bridge `useSwarm3D` & `registerSwarm3D` (Dành cho Three.js có sẵn như `CrystalOrb3D`)
```tsx
import { registerSwarm3D } from "swarm-cursor";

// Bên trong useEffect khởi tạo Three.js của CrystalOrb3D.tsx:
const handle = registerSwarm3D({
  id: "dom-orb-sphere",
  container: container,
  scene: scene,
  camera: camera,
  renderer: renderer,
  targetObject: crystalShell, // Hoặc group chứa innerCore + backHaloSphere + crystalShell
  buildMode: "all",           // Chạy đủ 3 pha: Gizmo Extrude -> Particle Swarm -> Laser Slice
  squadSize: 4,
});

// Trong hàm animate() của Three.js:
handle.update(clock.getElapsedTime());
```

### 4.3. Deep DOM & Multi-Action Attributes
- `<SwarmProvider deepScan={true} maxSquadSize={4}>`: Tự động quét sâu toàn bộ cây DOM bên trong và điều phối nhóm con trỏ đa thao tác.
- Hoặc bật từng khu vực với `data-swarm-deep="true"`, `data-swarm-squad="3"`, `data-swarm-3d="all"`.

---

## 5. Xử lý Lỗi & Kiểm thử (Error Handling & Testing Strategy)

1. **An toàn WebGL / GLB & Fallback**:
   - Nếu trình duyệt mất ngữ cảnh WebGL (`webglcontextlost`) hoặc đường dẫn `.glb` lỗi, `glb-controller` tự động giải phóng task (`state = "done"`) để không bao giờ làm treo hàng đợi DAG của trang web.
   - Nếu trình duyệt chặn `WebAssembly.instantiate`, `@swarm/kernel` tự động chuyển sang thực thi trên cùng bộ đệm `SoACursorBuffer` bằng hàm JS TypedArray tối ưu mà không đổi bất kỳ API nào.
2. **Chiến lược Kiểm thử (Vitest + Integration)**:
   - **Unit Tests cho `@swarm/kernel`**: Kiểm tra độ chính xác của Spatial Hash Grid $O(N)$, bộ nhớ SoA (Rust WASM & JS Fallback), và thuật toán Kahn's DAG + Early Unlock + Work-Stealing.
   - **Unit Tests cho `@swarm/scanner`**: Kiểm tra `DeepDOMScanner` quét đúng các phần tử con (`h1`, `p`, `svg`, `button`, `canvas[data-swarm-3d]`) và tạo đúng thứ tự phụ thuộc Cha $\rightarrow$ Con.
   - **Unit Tests cho `@swarm/three`**: Kiểm tra `CumulativeAreaSampler` lấy mẫu đều bề mặt `THREE.BufferGeometry`, phép chiếu `ProjectionBridge` ánh xạ đúng tọa độ 3D sang 2D, và tiến trình chuyển pha `extrude` $\rightarrow$ `particles` $\rightarrow$ `slice`.
   - **Tích hợp thực tế vào `portfolio_ver3`**: Áp dụng ngay hiệu ứng build 3D (`all` 3 thuật toán) và Deep DOM Đa thao tác vào [`CrystalOrb3D.tsx`](../../../../portfolio_ver3/frontend/src/components/sections/CrystalOrb3D.tsx) và [`PortfolioSwarmStages.tsx`](../../../../portfolio_ver3/frontend/src/components/PortfolioSwarmStages.tsx).
