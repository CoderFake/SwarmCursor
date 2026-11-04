import type { DocSection } from "../../types";

export const VI_SUBSYSTEMS: DocSection[] = [
  {
    id: "wasm-kernel",
    category: "subsystems",
    badge: "08 · LÕI SONG SONG RUST / WASM SIMD128",
    title: "swarm-cursor/kernel — 5 Đường ống Song song Rust/WASM SIMD128",
    summary:
      "Lõi Rust (`crates/swarm-kernel-wasm/src/`) được biên dịch với tập lệnh vector `wasm32` SIMD128 (`f32x4`) trên bộ nhớ tuyến tính phẳng (`SoACursorBuffer`, 16 floats/cursor), loại bỏ hoàn toàn cấp phát rác (Zero-GC) ở tần số 60–120fps.",
    steps: [
      {
        badge: "SIMD 1 & 2",
        title: "stepBoidsSpatialHash & stepBezierPathsBatch",
        body: "Lưới băm không gian O(N) cho Boids Vortex và bộ giải 4 đường cong Cubic Bezier cùng lúc bằng thanh ghi `f32x4`.",
      },
      {
        badge: "SIMD 3 & 4",
        title: "projectPoints3DBatch & auctionTasksBatch (Tối ưu Luồng con)",
        body: "Nhân ma trận 4×4 MVP chiếu đỉnh 3D -> 2D và đấu giá giao việc song song trong Rust/WASM (`MAX_TASKS = 1024`, ưu tiên luồng con `priority` & `parentGroup` + `assistSubtaskCoroutine` hỗ trợ gõ/vẽ song song).",
      },
      {
        badge: "SIMD 5",
        title: "deformSculpturalMeshBatch",
        body: "Biến dạng mặt cầu 3D đa tầng sóng hài (xấp xỉ đa thức không nhánh) trực tiếp trong bộ nhớ tuyến tính WASM.",
      },
    ],
    codeExamples: [
      {
        title: "Sử dụng trực tiếp 5 phép toán SIMD128 trong swarm-cursor/kernel",
        filename: "kernel-demo.ts",
        code: `import {
  wasmKernel,
  SoACursorBuffer,
  DAGScheduler,
} from "swarm-cursor/kernel";

// 1. Flat Structure-of-Arrays buffer (16 floats per cursor)
const buffer = new SoACursorBuffer(64);

// 2. O(N) Spatial Hash Grid Boids & 4-wide f32x4 Cubic Bezier flight
wasmKernel.stepBoidsSpatialHash(dt, buffer, 36, { x: mouseX, y: mouseY }, 1.0);
wasmKernel.stepBezierPathsBatch(dt, 1.0, buffer, bezierCoeffs, 18);

// 3. Batch 4x4 MVP 3D -> 2D screen projection
wasmKernel.projectPoints3DBatch(mvpMatrix16, points3D, outScreenXY, vpWidth, vpHeight);

// 4. Parallel Cursor-to-Task Auction
const assignments = wasmKernel.auctionTasksBatch(cursorPositions, tasks, viewTop, viewBot);

// 5. Real-time 3D Sculptural Mesh Deformation
wasmKernel.deformSculpturalMeshBatch(basePositions, outPositions, timeSeconds);`,
      },
    ],
    propsTable: {
      title: "Cấu trúc Module trong crates/swarm-kernel-wasm & src/kernel",
      rows: [
        {
          name: "boids.rs / boids-ops.ts",
          type: "stepBoidsSpatialHash()",
          defaultVal: "O(N) Grid + f32x4",
          desc: "3 quy tắc Reynolds (Separation, Alignment, Cohesion) + lực xoáy tiếp tuyến Vortex.",
        },
        {
          name: "bezier.rs / bezier-ops.ts",
          type: "stepBezierPathsBatch()",
          defaultVal: "4 cursors / cycle",
          desc: "Tính tọa độ đường cong Bezier bậc 3, góc xoay mũi tên theo vận tốc và giảm chấn lò xo.",
        },
        {
          name: "projection.rs / projection-ops.ts",
          type: "projectPoints3DBatch()",
          defaultVal: "f32x4 4x4 MVP",
          desc: "Chiếu hàng loạt đỉnh 3D sang tọa độ màn hình 2D phục vụ con trỏ bám đỉnh khối 3D.",
        },
        {
          name: "auction.rs / auction-ops.ts",
          type: "auctionTasksBatch()",
          defaultVal: "MAX_TASKS = 1024 (8 f32/task)",
          desc: "Đấu giá không gian song song kèm ưu tiên luồng con (`priority` & `parentGroup` locality boost) để đàn chuột rảnh dồn lực build hết text nhỏ, bullet point và badge trong từng card.",
        },
        {
          name: "mesh.rs / mesh-ops.ts",
          type: "deformSculpturalMeshBatch()",
          defaultVal: "Zero-copy WASM",
          desc: "Biến dạng lưới đỉnh 3D qua các tần số sóng hài trong 1 lần gọi WASM duy nhất.",
        },
      ],
    },
  },
  {
    id: "engine-and-attributes",
    category: "subsystems",
    badge: "09 · ENGINE, VANILLA API & THUỘC TÍNH HTML",
    title: "swarm-cursor/engine, Vanilla Helpers & Thuộc tính data-swarm-*",
    summary:
      "Sử dụng trực tiếp `createSwarm()`, `createSwarmFollower()`, `createSwarmAgentPill()` hoặc các hàm điều phối của `swarm-cursor/engine` trong mọi dự án Vanilla TypeScript/JavaScript cùng hệ thống thuộc tính HTML `data-swarm-*` và biến CSS `--swarm-*`.",
    codeExamples: [
      {
        title: "Vanilla JS / TS API & Modular Engine Imports",
        filename: "vanilla-main.ts",
        code: `import {
  createSwarm,
  createSwarmFollower,
  createSwarmAgentPill,
} from "swarm-cursor";
import {
  SwarmEngine,
  getAvailableTasks,
  pickBestTaskForCursor,
} from "swarm-cursor/engine";
import "swarm-cursor/styles.css";

// Mount DOM-driven swarm in Vanilla JS/TS
const swarm = createSwarm({
  container: document.body,
  mode: "dom",
  scrollMode: "hybrid",
  autoScrollSpeed: 180,
  agentPill: { maxIcons: 5, intervalMs: 650, position: "bottom-center" },
});`,
      },
      {
        title: "HTML Attributes (data-swarm-*) & CSS Variables",
        filename: "index.html / theme.css",
        code: `<!-- Declarative HTML attributes -->
<h1 id="title" data-swarm="text" data-swarm-grow="true" data-swarm-snap="x">
  SwarmCursor 2.0
</h1>

<article id="card" data-swarm="rect" data-swarm-deep="true" data-swarm-deps="title">
  <h2>Auto-DAG Deep Container</h2>
  <img src="/cover.webp" data-swarm="image" data-swarm-image="mosaic" />
</article>

<div id="orb" data-swarm="3d" data-swarm-3d="all" data-swarm-squad="4">
  <canvas id="webgl"></canvas>
</div>

/* CSS Custom Properties */
:root {
  --paper: #F8F9FA;
  --ink: #121417;
  --swarm-blue: #0D99FF;
  --swarm-red: #F24822;
}`,
      },
    ],
    propsTable: {
      title: "Bảng tra cứu đầy đủ thuộc tính HTML data-swarm-*",
      rows: [
        {
          name: "data-swarm",
          type: '"rect" | "text" | "path" | "3d" | "image"',
          defaultVal: "—",
          desc: "Khai báo công cụ Figma mà chuột AI sẽ dùng để vẽ phần tử.",
        },
        {
          name: "data-swarm-deep",
          type: '"true"',
          defaultVal: '"false"',
          desc: "Tự động quét đệ quy toàn bộ các thẻ con bên trong và nối đồ thị DAG Cha -> Con (mở khóa ở 60%).",
        },
        {
          name: "data-swarm-3d",
          type: '"extrude" | "particles" | "slice" | "all"',
          defaultVal: '"all"',
          desc: "Chọn thuật toán điêu khắc cho phần tử 3D / Three.js / GLB.",
        },
        {
          name: "data-swarm-image",
          type: '"mosaic" | "scanline" | "halftone" | "all"',
          defaultVal: '"all"',
          desc: "Chọn thuật toán tổng hợp cho phần tử hình ảnh 2D.",
        },
        {
          name: "data-swarm-squad",
          type: '"2" .. "6"',
          defaultVal: '"4"',
          desc: "Số lượng con trỏ AI hợp tác đồng thời (Work-Stealing Squad) trên vật thể 3D hoặc container.",
        },
        {
          name: "data-swarm-grow / data-swarm-snap",
          type: '"true" / "x" | "y" | "xy"',
          defaultVal: "undefined",
          desc: "Phóng to cỡ chữ sau khi bôi đen (`grow`) và kéo đường gióng đỏ từ thanh Ruler (`snap`).",
        },
      ],
    },
  },
];
