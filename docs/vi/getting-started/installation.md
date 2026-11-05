# Cài đặt, Sub-Packages & Thiết lập (`SwarmCursor 2.0`)

Repository chính thức: **[https://github.com/CoderFake/SwarmCursor](https://github.com/CoderFake/SwarmCursor)**

---

## 1. Cài đặt Package

### Từ GitHub Release `v2.0.0` / GitHub Packages / Git Tag
```bash
# Cách 1 (Nhanh nhất — Gói prebuilt từ GitHub Release v2.0.0):
npm install https://github.com/CoderFake/SwarmCursor/releases/download/v2.0.0/swarm-cursor-2.0.0.tgz

# Cách 2 (Cài theo Git Release tag v2.0.0):
npm install git+https://github.com/CoderFake/SwarmCursor.git#v2.0.0

# Cách 3 (GitHub Packages — @coderfake/swarm-cursor):
npm install @coderfake/swarm-cursor --@coderfake:registry=https://npm.pkg.github.com
```

### Từ thư mục Local (Monorepo / Workspace)
```bash
npm install file:../swarm-cursor
```

---

## 2. Import Stylesheet

Import file CSS một lần duy nhất ở điểm khởi đầu ứng dụng (`main.tsx`, `App.tsx`, hoặc `app/layout.tsx`):

```tsx
import "swarm-cursor/styles.css";
```

---

## 3. Kiến trúc 8 Sub-Packages (Tree-Shakeable Subpath Exports)

SwarmCursor 2.0 được chia nhỏ thành các sub-package độc lập để bạn có thể import toàn bộ qua `swarm-cursor` hoặc chỉ import đúng phân hệ cần dùng:

| Đường dẫn Import | Nội dung & Các Export chính |
| :--- | :--- |
| `swarm-cursor` | Barrel export đầy đủ toàn bộ Core, Engine, Kernel, 3D, Scanner, Renderers, Tools & Presets (`buildSwarmLandingScene`) |
| `swarm-cursor/engine` | Lõi điều phối đã tách module: `SwarmEngine`, `hydrateEngineScene`, `getAvailableTasks`, `pickBestTaskForCursor`, `moveToCoroutine`, `drawRectCoroutine`, `duplicateGroupCoroutine`, `computeElementBounds`, `computeSpacingMeasure` |
| `swarm-cursor/kernel` | Lõi **Rust/WASM SIMD128** (`SwarmKernel`, `wasmKernel`, `SoACursorBuffer`, `DAGScheduler`, `stepBoids`, `stepBezierPathsBatch`, `project3DBatch`, `auctionTasksBatch`, `deformSculpturalMeshBatch`) |
| `swarm-cursor/three` | Tích hợp 3D / Three.js / GLB: `CumulativeAreaSampler`, `compute3DPhaseWeights`, `registerSwarm3D`, `ProjectionBridge`, `SwarmGLBController`, `PARTICLE_BUILD_*_SHADER`, `HOLOGRAPHIC_SLICE_*` |
| `swarm-cursor/scanner` | Quét đệ quy DOM & bộ đệm đo layout: `scanDeepDOM`, `LayoutReadCache` |
| `swarm-cursor/renderers` | Bộ vẽ 60fps Zero-React-Tick: `FastCursorLayerController`, `FastOverlayCanvasController` |
| `swarm-cursor/tools` | Hệ thống Plugin công cụ, Đội nhóm & Ảnh 2D: `ToolRegistry`, `SquadCoordinator`, `computeImageBuildState` |
| `swarm-cursor/react` | Các React Component & Hooks: `<SwarmProvider>`, `<SwarmElement>`, `<Swarm3D>`, `<SwarmImage>`, `<SwarmFollower>`, `<SwarmAgentPill>`, `<SwarmCanvas>`, `<SwarmControls>`, `useSwarm`, `useSwarm3D` |
| `swarm-cursor/styles.css` | Stylesheet chuẩn cho con trỏ, khung chọn, đường gióng đỏ, hiệu ứng 3D và hiệu ứng ảnh 2D |

---

## 4. Tương thích SSR (Next.js App Router / Remix / Astro)

Tất cả các component trong `swarm-cursor/react` và lõi `wasmKernel` đều an toàn với SSR (`typeof window !== "undefined"`). Nếu sử dụng trong Next.js App Router, bạn chỉ cần đặt `"use client"` ở đầu component bọc hiệu ứng hoặc import trực tiếp `<SwarmFollower />` / `<SwarmProvider />`.

---

## 5. Biên dịch lại Lõi Rust/WASM SIMD128 (Tùy chọn cho Contributors)

Gói `swarm-cursor` đã nhúng sẵn binary WebAssembly SIMD128 (`SWARM_KERNEL_WASM_BASE64`) nên **không yêu cầu cấu hình Vite/Webpack đặc biệt** khi sử dụng. Nếu bạn muốn chỉnh sửa mã nguồn Rust trong `crates/swarm-kernel-wasm/src/`:

```bash
# Biên dịch Rust sang WebAssembly với cờ nạp lệnh vector SIMD128
RUSTFLAGS="-C target-feature=+simd128" cargo build \
  --manifest-path crates/swarm-kernel-wasm/Cargo.toml \
  --target wasm32-unknown-unknown \
  --release

# Build lại toàn bộ các sub-packages TypeScript (ESM + CJS + d.ts)
npm run build
```
