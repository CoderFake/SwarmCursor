# SwarmCursor 2.0 Documentation

Chào mừng bạn đến với tài liệu chính thức của **SwarmCursor 2.0** (`https://github.com/CoderFake/SwarmCursor`) — thư viện hiệu ứng đàn chuột AI đa tác tử (Multi-Agent Figma Cursor Choreography, Rust/WASM SIMD128 Kernel, 3D / Three.js / GLB Builder `extrude` · `particles` · `slice`, 2D `<SwarmImage>` `mosaic` · `scanline` · `halftone`, Auto Deep DOM Scanner & Zero-React-Tick 60fps Renderer) cho **React 18/19** và **Vanilla TypeScript / JavaScript**.

---

## Cấu trúc Tài liệu

### 1. Bắt đầu (`getting-started/`)
- [Cài đặt, Sub-Packages & Thiết lập (`installation.md`)](./getting-started/installation.md) — Cài qua GitHub/NPM, bảng 8 Subpath Exports (`swarm-cursor/engine`, `/kernel`, `/three`, `/scanner`, `/renderers`, `/tools`, `/react`), cấu hình CSS và biên dịch Rust/WASM SIMD128.
- [Bắt đầu nhanh trong 60 giây (`quick-start.md`)](./getting-started/quick-start.md) — 6 mẫu tích hợp phổ biến nhất: `<SwarmFollower>`, `<SwarmProvider>` + `<Swarm3D>` + `<SwarmImage>`, `<SwarmCanvas>` + `buildSwarmLandingScene`, `<SwarmAgentPill>`, và `wasmKernel`.

### 2. React Components (`components/`)
- [`<SwarmProvider>`, `<SwarmElement>`, `<Swarm3D>` & `<SwarmImage>` (`swarm-provider.md`)](./components/swarm-provider.md) — Chế độ DOM-Driven, quét sâu `deepScan`, dựng mô hình 3D (`extrude` · `particles` · `slice`) và tổng hợp ảnh 2D (`mosaic` · `scanline` · `halftone`).
- [`<SwarmFollower>` (`swarm-follower.md`)](./components/swarm-follower.md) — Đàn chuột đuổi theo con trỏ người dùng khi di chuyển và **xoay vòng tròn (Boids Vortex Orbit)** khi chuột dừng.
- [`<SwarmAgentPill>` (`swarm-agent-pill.md`)](./components/swarm-agent-pill.md) — Thanh Bottom-Bar kiểu Figma hiển thị tối đa **5 icon AI ngẫu nhiên** đẩy liên tục kiểu hàng đợi (queue) từ trái qua phải kèm `{N} agents` *(chỉ hiện khi khai báo)*.
- [`<SwarmCanvas>`, `SceneBuilder` & `buildSwarmLandingScene` (`swarm-canvas.md`)](./components/swarm-canvas.md) — Chế độ Artboard ảo: dựng kịch bản vẽ chi tiết bằng đầy đủ các phương thức của `SceneBuilder` (`addGuide`, `addText`, `addRect`, `addPath`, `addDupGroup`, `add3D`, `addImage`) hoặc chạy kịch bản mẫu `buildSwarmLandingScene`.
- [`<SwarmControls>` & `useSwarm()` (`swarm-controls.md`)](./components/swarm-controls.md) — Thanh điều khiển nổi & React Hook điều khiển tiến trình.

### 3. Vanilla JS / TS, Modular Engine & Rust/WASM API (`vanilla-api/`)
- [Vanilla & Sub-Packages API Reference (`reference.md`)](./vanilla-api/reference.md) — Hướng dẫn chi tiết 8 Sub-Packages:
  - `swarm-cursor/engine`: `SwarmEngine`, `hydrateEngineScene`, `getAvailableTasks`, `pickBestTaskForCursor`, `moveToCoroutine`, `drawRectCoroutine`, `duplicateGroupCoroutine`, `computeElementBounds`, `computeSpacingMeasure`.
  - `swarm-cursor/kernel`: Lõi Rust/WASM SIMD128 (`stepBoids`, `stepBezierPathsBatch`, `project3DBatch`, `auctionTasksBatch`, `deformSculpturalMeshBatch`), `SoACursorBuffer`, `DAGScheduler`.
  - `swarm-cursor/three`: `CumulativeAreaSampler`, `compute3DPhaseWeights`, `registerSwarm3D`, `ProjectionBridge`, `SwarmGLBController`, GLSL Shaders.
  - `swarm-cursor/scanner`: `scanDeepDOM`, `LayoutReadCache`.
  - `swarm-cursor/tools`: `ToolRegistry`, `SquadCoordinator`, `computeImageBuildState`.
  - `swarm-cursor/renderers`: `FastCursorLayerController`, `FastOverlayCanvasController`.

### 4. Tùy biến & Thuộc tính (`customization/`)
- [HTML Attributes & CSS Variables (`theming-and-attributes.md`)](./customization/theming-and-attributes.md) — Bảng tra cứu đầy đủ `data-swarm-*` (`data-swarm-deep`, `data-swarm-3d`, `data-swarm-image`, `data-swarm-squad`, `data-swarm-glb`, ...), biến CSS `--swarm-*`, và danh sách 9 AI Agent Icons tích hợp.
