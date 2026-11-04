import type { DocSection } from "../../types";

export const VI_GETTING_STARTED: DocSection[] = [
  {
    id: "installation",
    category: "getting-started",
    badge: "01 · CÀI ĐẶT & 8 SUB-PACKAGES",
    title: "Cài đặt, 8 Sub-Packages & Rust/WASM SIMD128",
    summary:
      "SwarmCursor 2.0 được thiết kế theo kiến trúc 8 Sub-Packages độc lập (Tree-Shakeable Subpath Exports), nhúng sẵn binary WebAssembly SIMD128 để chạy ngay trên Vite, Next.js App Router và Astro mà không cần cấu hình bundler.",
    steps: [
      {
        badge: "BƯỚC 1",
        title: "Cài đặt từ GitHub / NPM",
        body: "Cài đặt package chính vào dự án React 18/19 hoặc Vanilla TypeScript của bạn.",
      },
      {
        badge: "BƯỚC 2",
        title: "Import Stylesheet 1 lần",
        body: "Nạp `swarm-cursor/styles.css` tại `main.tsx` hoặc `App.tsx` để kích hoạt con trỏ, thước đo Ruler và hiệu ứng 3D/Image.",
      },
      {
        badge: "BƯỚC 3",
        title: "Chọn Sub-Package cần dùng",
        body: "Import toàn bộ qua `swarm-cursor` hoặc tách lẻ `/engine`, `/kernel`, `/three`, `/scanner`, `/renderers`, `/tools`, `/react`.",
      },
    ],
    codeExamples: [
      {
        title: "Cài đặt & Import CSS chuẩn",
        filename: "terminal / main.tsx",
        code: `# Install via npm / pnpm / yarn
npm install git+https://github.com/CoderFake/SwarmCursor.git

// In main.tsx or App.tsx:
import "swarm-cursor/styles.css";`,
      },
      {
        title: "Biên dịch lại Lõi Rust/WASM SIMD128 (Tùy chọn cho Contributors)",
        filename: "crates/swarm-kernel-wasm",
        code: `RUSTFLAGS="-C target-feature=+simd128" cargo build \\
  --manifest-path crates/swarm-kernel-wasm/Cargo.toml \\
  --target wasm32-unknown-unknown \\
  --release

npm run build`,
      },
    ],
    propsTable: {
      title: "Bảng 8 Sub-Packages (Tree-Shakeable Subpath Exports)",
      rows: [
        {
          name: "swarm-cursor",
          type: "Barrel Export",
          defaultVal: "All modules",
          desc: "Export đầy đủ Core, Engine, Kernel, 3D, Scanner, Renderers, Tools & `buildSwarmLandingScene`.",
        },
        {
          name: "swarm-cursor/engine",
          type: "Orchestrator",
          defaultVal: "6 modules",
          desc: "`SwarmEngine`, `hydrateEngineScene`, `getAvailableTasks`, `pickBestTaskForCursor`, `moveToCoroutine`, `drawRectCoroutine`, `duplicateGroupCoroutine`.",
        },
        {
          name: "swarm-cursor/kernel",
          type: "Rust/WASM SIMD128",
          defaultVal: "5 SIMD ops",
          desc: "`wasmKernel`, `SwarmKernel`, `SoACursorBuffer`, `DAGScheduler` (`stepBoidsSpatialHash`, `stepBezierPathsBatch`, `projectPoints3DBatch`, `auctionTasksBatch`, `deformSculpturalMeshBatch`).",
        },
        {
          name: "swarm-cursor/three",
          type: "3D / GLB",
          defaultVal: "3 phases",
          desc: "`CumulativeAreaSampler`, `compute3DPhaseWeights`, `registerSwarm3D`, `ProjectionBridge`, `SwarmGLBController`, GLSL Shaders.",
        },
        {
          name: "swarm-cursor/scanner",
          type: "DOM Scanner",
          defaultVal: "Single-pass",
          desc: "`scanDeepDOM` & `LayoutReadCache` quét đệ quy cây DOM thành đồ thị DAG Cha -> Con không gây Layout Thrashing.",
        },
        {
          name: "swarm-cursor/renderers",
          type: "60fps Renderers",
          defaultVal: "0 React ticks",
          desc: "`FastCursorLayerController` (DOM Pool) & `FastOverlayCanvasController` (2D Canvas).",
        },
        {
          name: "swarm-cursor/tools",
          type: "Tools & Squads",
          defaultVal: "Pluggable",
          desc: "`ToolRegistry`, `SquadCoordinator` (Work-Stealing 2..6 cursors) & `computeImageBuildState`.",
        },
        {
          name: "swarm-cursor/react",
          type: "React 18/19",
          defaultVal: "8 components",
          desc: "`<SwarmProvider>`, `<SwarmElement>`, `<Swarm3D>`, `<SwarmImage>`, `<SwarmFollower>`, `<SwarmAgentPill>`, `<SwarmCanvas>`, `<SwarmControls>`.",
        },
      ],
    },
  },
  {
    id: "quick-start",
    category: "getting-started",
    badge: "02 · BẮT ĐẦU NHANH TRONG 60 GIÂY",
    title: "5 Mẫu Tích hợp Nhanh trong 60 Giây",
    summary:
      "Tùy theo nhu cầu: (1) Đàn chuột đuổi & xoay vòng quanh trỏ chuột, (2) Đàn chuột tự động vẽ giao diện DOM/3D/Image khi cuộn trang, (3) Mặt phẳng Artboard ảo, (4) Thanh Bottom-Bar 5 icon AI, hoặc (5) Gọi trực tiếp lõi Rust/WASM SIMD128.",
    steps: [
      {
        badge: "MẪU 1",
        title: "Mouse Follower & Vortex",
        body: "Dùng `<SwarmFollower count={36} />` để tạo đàn chuột đuổi theo chuột thật và xoay vòng tròn khi dừng.",
      },
      {
        badge: "MẪU 2",
        title: "DOM + Deep Scan + 3D + Image",
        body: "Bọc trang bằng `<SwarmProvider deepScan>` kèm `<Swarm3D>` và `<SwarmImage>` để đàn chuột dựng toàn bộ UI.",
      },
      {
        badge: "MẪU 3",
        title: "Virtual Artboard Showcase",
        body: "Dùng `<SwarmCanvas scene={buildSwarmLandingScene} />` hoặc tự tạo kịch bản bằng `SceneBuilder`.",
      },
    ],
    codeExamples: [
      {
        title: "Mẫu 1 & 2: Kết hợp <SwarmProvider>, Deep DOM, <Swarm3D> & <SwarmImage>",
        filename: "App.tsx",
        code: `import {
  SwarmProvider,
  SwarmElement,
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
      fastMode={true}
      agentPill={{ maxIcons: 5, position: "bottom-center" }}
    >
      <SwarmElement id="hero-title" tool="text" grow snapAxis="x">
        <h1>SwarmCursor 2.0 Engine</h1>
      </SwarmElement>

      <article id="card" data-swarm="rect" data-swarm-deep="true" data-swarm-deps="t:hero-title">
        <h3>Deep DOM Auto-DAG</h3>
        <p>Child elements unlock at 60% parent progress.</p>
        <button type="button">Explore</button>
      </article>

      <SwarmImage
        id="cover"
        src="/images/cover.webp"
        buildMode="all"
        deps={["r:card"]}
      />

      <Swarm3D id="orb" buildMode="all" squadSize={4} deps={["r:card"]}>
        <canvas />
      </Swarm3D>

      <SwarmControls position="bottom-right" />
    </SwarmProvider>
  );
}`,
      },
      {
        title: "Mẫu 3, 4 & 5: <SwarmFollower>, <SwarmAgentPill> & wasmKernel",
        filename: "StandaloneExamples.tsx",
        code: `import { SwarmFollower, SwarmAgentPill } from "swarm-cursor/react";
import { wasmKernel } from "swarm-cursor/kernel";

// 1. Standalone Boids Mouse Follower + Bottom 5-AI-Icon Queue Pill
export const FollowerDemo = () => (
  <SwarmFollower count={36} radiusScale={1} agentPill={{ maxIcons: 5 }} />
);

// 2. Standalone Bottom-Bar AI Queue Pill
export const PillOnlyDemo = () => (
  <SwarmAgentPill count={30} maxIcons={5} intervalMs={650} position="bottom-center" />
);

// 3. Direct Rust/WASM SIMD128 Sculptural Mesh Deformation
wasmKernel.deformSculpturalMeshBatch(basePositions, outPositions, timeSeconds);`,
      },
    ],
  },
];
