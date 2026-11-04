import type { DocSection } from "../../types";

export const VI_COMPONENTS: DocSection[] = [
  {
    id: "swarm-provider",
    category: "components",
    badge: "03 · DOM-DRIVEN & QUÉT SÂU DAG",
    title: "<SwarmProvider> & <SwarmElement> (Quét sâu DOM & Đồ thị DAG)",
    summary:
      "Giữ nguyên giao diện React/Tailwind có sẵn của bạn. Khi bật `deepScan={true}`, `scanDeepDOM` tự động đi sâu vào các thẻ con (`h1..h6`, `p`, `span`, `button`, `svg/path`, `canvas`) trong 1 lần đọc layout duy nhất và mở khóa thẻ con ngay khi khung cha đạt 60% tiến độ.",
    steps: [
      {
        badge: "TOOL: TEXT",
        title: "Type Tool + Grow + Snap",
        body: "`tool=\"text\"` gõ từng chữ với caret; `grow` bôi đen và kéo giãn cỡ chữ; `snapAxis` kéo thước đỏ từ Ruler.",
      },
      {
        badge: "TOOL: RECT",
        title: "Rectangle Wireframe + Deep DAG",
        body: "`data-swarm=\"rect\" data-swarm-deep=\"true\"` kéo khung xám + kích thước W×H rồi tự động chia việc vẽ các thẻ con.",
      },
      {
        badge: "TOOL: PATH",
        title: "Vector Pen Anchor Tool",
        body: "`tool=\"path\"` đặt từng điểm neo vector `5×5` trên các thẻ `<svg>` và khép kín đường path.",
      },
    ],
    codeExamples: [
      {
        title: "Cấu hình <SwarmProvider> & <SwarmElement>",
        filename: "PortfolioStage.tsx",
        code: `import { SwarmProvider, SwarmElement, SwarmControls } from "swarm-cursor/react";

export function PortfolioStage() {
  return (
    <SwarmProvider
      scrollMode="hybrid"
      autoScrollSpeed={180}
      deepScan={true}
      fastMode={true}
      showCursorLabels={true}
      agentPill={{ maxIcons: 5, position: "bottom-center" }}
    >
      <SwarmElement id="sec-title" tool="text" grow snapAxis="x">
        <h2>Creative Systems Engineering</h2>
      </SwarmElement>

      <div
        id="bento-card"
        data-swarm="rect"
        data-swarm-deep="true"
        data-swarm-deps="t:sec-title"
      >
        <h3>Zero-Layout-Thrashing Deep Scanner</h3>
        <p>Every heading, paragraph, and button inside is auto-scheduled.</p>
        <button type="button">Inspect DAG</button>
      </div>

      <SwarmControls position="bottom-right" />
    </SwarmProvider>
  );
}`,
      },
    ],
    propsTable: {
      title: "Bảng Props của <SwarmProvider> & <SwarmElement>",
      rows: [
        {
          name: "scrollMode",
          type: '"manual" | "auto" | "hybrid"',
          defaultVal: '"manual"',
          desc: "Chế độ cuộn: cuộn tay (`manual`), tự cuộn (`auto`), hoặc tự cuộn nhường quyền khi lăn chuột (`hybrid`).",
        },
        {
          name: "deepScan",
          type: "boolean",
          defaultVal: "false",
          desc: "Bật `scanDeepDOM` quét đệ quy các thẻ con bên trong `[data-swarm-deep=\"true\"]`.",
        },
        {
          name: "fastMode",
          type: "boolean",
          defaultVal: "true",
          desc: "Dùng `FastCursorLayerController` + `FastOverlayCanvasController` chạy 60fps không tốn React tick.",
        },
        {
          name: "tool (SwarmElement)",
          type: '"rect" | "text" | "path"',
          defaultVal: '"rect"',
          desc: "Công cụ Figma mà chuột AI dùng để dựng phần tử (`rect`, `text`, hoặc `path`).",
        },
        {
          name: "grow / snapAxis",
          type: 'boolean / "x" | "y" | "xy"',
          defaultVal: "false / undefined",
          desc: "`grow`: gõ chữ nhỏ rồi bôi đen phóng to. `snapAxis`: kéo đường gióng đỏ từ thanh Ruler.",
        },
      ],
    },
  },
  {
    id: "swarm-3d",
    category: "components",
    badge: "04 · BỘ ĐIÊU KHẮC 3D / THREE.JS / GLB",
    title: "<Swarm3D> & registerSwarm3D (extrude · particles · slice)",
    summary:
      "Hỗ trợ 3 thuật toán điêu khắc vật thể 3D / Three.js / GLB với đội nhóm 2–6 con trỏ AI (`SquadCoordinator`): dựng khung dây 3D Gizmo (`extrude`), lấy mẫu bề mặt lưới tam giác O(log M) (`particles`) và quét mặt phẳng cắt laser (`slice`).",
    sandbox: "3d",
    steps: [
      {
        badge: "PHA 1 · EXTRUDE",
        title: "3D Gizmo & Wireframe Cage",
        body: "Lead Cursor kéo trục tọa độ 3D Gizmo X/Y/Z để dựng khung dây bao quanh vật thể, chiếu đỉnh 3D sang màn hình 2D.",
      },
      {
        badge: "PHA 2 · PARTICLES",
        title: "CDF Surface Particle Swarm",
        body: "`CumulativeAreaSampler` lấy mẫu đều trên bề mặt tam giác (O(log M)) để hội tụ hàng nghìn hạt GPU.",
      },
      {
        badge: "PHA 3 · SLICE",
        title: "Holographic Laser Slice",
        body: "Đội Assistant Cursors quét tia laser cắt lớp (`active3DLasers`) từ đáy lên đỉnh để lộ vật liệu PBR/Liquid Glass.",
      },
    ],
    codeExamples: [
      {
        title: "Tích hợp <Swarm3D> & registerSwarm3D với Three.js + wasmKernel",
        filename: "CrystalOrb3D.tsx",
        code: `import { Swarm3D } from "swarm-cursor/react";
import { registerSwarm3D, CumulativeAreaSampler } from "swarm-cursor/three";
import { wasmKernel } from "swarm-cursor/kernel";

// 1. Declarative React Wrapper
<Swarm3D
  id="crystal-orb-3d"
  src="/models/crystal-orb.glb"
  buildMode="all" // "extrude" | "particles" | "slice" | "all"
  squadSize={4}
  deps={["r:hero-card"]}
  className="w-96 h-96"
>
  <canvas ref={canvasRef} />
</Swarm3D>

// 2. Inside Three.js useEffect: receive live phase weights & deform mesh in WASM SIMD128
const unregister = registerSwarm3D("crystal-orb-3d", {
  buildMode: "all",
  squadSize: 4,
  onProgress: (progress, weights) => {
    wireframeCage.material.opacity = weights.extrude * 0.65;
    particleUniforms.uBuildProgress.value = Math.max(weights.particles, progress);
    slicePlane.constant = -2.3 + weights.slice * 4.7;
  },
});`,
      },
    ],
    propsTable: {
      title: "Bảng Props của <Swarm3D> & Cấu hình registerSwarm3D",
      rows: [
        {
          name: "id",
          type: "string (required)",
          defaultVal: "—",
          desc: "ID duy nhất của tác vụ 3D (tạo node `3d:${id}` trong đồ thị DAG).",
        },
        {
          name: "buildMode",
          type: '"extrude" | "particles" | "slice" | "all"',
          defaultVal: '"all"',
          desc: "Chế độ điêu khắc 3D riêng lẻ hoặc kết hợp tuần tự cả 3 giai đoạn (`all`).",
        },
        {
          name: "squadSize",
          type: "number (2..6)",
          defaultVal: "4",
          desc: "Số con trỏ AI hợp tác đồng thời trên khối 3D (`1` Lead + `N-1` Assistants).",
        },
        {
          name: "onProgress",
          type: "(progress: number, weights: Phase3DWeights) => void",
          defaultVal: "undefined",
          desc: "Callback mỗi frame trả về `progress` (0..1) và trọng số `{ extrude, particles, slice }`.",
        },
      ],
    },
  },
  {
    id: "swarm-image",
    category: "components",
    badge: "05 · TỔNG HỢP HÌNH ẢNH 2D",
    title: "<SwarmImage> (mosaic · scanline · halftone · all)",
    summary:
      "Cung cấp 3 thuật toán xây dựng hình ảnh 2D lấy cảm hứng từ Progressive Quadtree Subdivisions (`mosaic`), Holographic CRT Laser Rasterization (`scanline`) và Halftone Dot-Matrix Screen-Printing (`halftone`), hoặc kết hợp cả 3 qua `buildMode=\"all\"`.",
    sandbox: "image",
    steps: [
      {
        badge: "MODE: MOSAIC",
        title: "Quadtree Pixelation Refinement",
        body: "Khởi tạo ảnh từ lưới ô vuông thô (`32px -> 16px -> 8px -> 4px -> 0px`) khi con trỏ quét chéo tinh chỉnh độ nét.",
      },
      {
        badge: "MODE: SCANLINE",
        title: "Holographic Laser Raster Scan",
        body: "Con trỏ kéo tia laser ngang kèm nhãn `IMG·SCAN` quét từ đỉnh xuống đáy ảnh trên nền lưới blueprint.",
      },
      {
        badge: "MODE: HALFTONE",
        title: "Dot-Matrix Screen Printing",
        body: "Tái tạo ảnh qua ma trận chấm bi in lụa tăng dần bán kính trước khi hội tụ thành ảnh gốc sắc nét.",
      },
    ],
    codeExamples: [
      {
        title: "Sử dụng <SwarmImage> trong React hoặc data-swarm=\"image\" trong HTML",
        filename: "ProjectGallery.tsx",
        code: `import { SwarmImage } from "swarm-cursor/react";
import { computeImageBuildState } from "swarm-cursor/tools";

export function ProjectGallery() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <SwarmImage
        id="img-mosaic"
        src="/images/project-1.webp"
        buildMode="mosaic"
        className="w-full h-56 rounded-2xl"
      />
      <SwarmImage
        id="img-scanline"
        src="/images/project-2.webp"
        buildMode="scanline"
        deps={["img:img-mosaic"]}
        className="w-full h-56 rounded-2xl"
      />
      <SwarmImage
        id="img-all"
        src="/images/project-3.webp"
        buildMode="all"
        deps={["img:img-scanline"]}
        className="w-full h-56 rounded-2xl"
      />
    </div>
  );
}`,
      },
    ],
    propsTable: {
      title: "Bảng Props của <SwarmImage>",
      rows: [
        {
          name: "id / src",
          type: "string (required)",
          defaultVal: "—",
          desc: "ID duy nhất của tác vụ ảnh (`img:${id}`) và đường dẫn URL của ảnh.",
        },
        {
          name: "buildMode",
          type: '"mosaic" | "scanline" | "halftone" | "all"',
          defaultVal: '"all"',
          desc: "Thuật toán dựng ảnh: ô vuông Quadtree (`mosaic`), tia laser (`scanline`), chấm bi (`halftone`) hoặc cả 3 (`all`).",
        },
        {
          name: "deps",
          type: "string[]",
          defaultVal: "undefined",
          desc: "Danh sách task ID cần hoàn thành trước khi bắt đầu dựng ảnh.",
        },
      ],
    },
  },
  {
    id: "swarm-canvas",
    category: "components",
    badge: "06 · VIRTUAL ARTBOARD & SCENEBUILDER",
    title: "<SwarmCanvas>, SceneBuilder & buildSwarmLandingScene",
    summary:
      "Chế độ Virtual Artboard dựng mặt phẳng thiết kế chuẩn Figma (mặc định 1280px, tự co giãn theo màn hình) hỗ trợ đầy đủ `addGuide`, `addRect`, `addText`, `addPath`, `addDupGroup` (`Alt+Drag` nhân bản theo lưới), `add3D`, `addImage` và kịch bản dựng sẵn `buildSwarmLandingScene`.",
    codeExamples: [
      {
        title: "Tự tạo kịch bản Artboard với SceneBuilder hoặc dùng buildSwarmLandingScene",
        filename: "ArtboardDemo.tsx",
        code: `import { SceneBuilder, TYPE_STYLES, PALETTE, buildSwarmLandingScene } from "swarm-cursor";
import { SwarmCanvas } from "swarm-cursor/react";

function buildCustomScene() {
  const b = new SceneBuilder(1280);
  const gLeft = b.addGuide("g-left", "x", 120, 100);
  const title = b.addText("h1", 120, 140, "Autonomous UI Engine.", TYPE_STYLES.h1, {
    w: 640, grow: true, snap: "g-left", deps: [gLeft],
  });
  const card = b.addRect("card-0", 120, 300, 320, 180, {
    fill: PALETTE.card, stroke: PALETTE.line, r: 14, deps: [title],
  });
  b.addText("card-0-t", 148, 332, "Rust/WASM SIMD128", TYPE_STYLES.h3, { deps: [card] });

  // Alt+Drag duplicate across 2 columns and edit text in each clone
  b.addDupGroup("cards", ["card-0", "card-0-t"], [
    { dx: 350, dy: 0, edits: ["3D Extrude & Slice"] },
    { dx: 700, dy: 0, edits: ["2D <SwarmImage>"] },
  ]);
  return b.build(620);
}

// Bấm tab "Artboard Showcase" trên thanh điều hướng để xem trực tiếp buildSwarmLandingScene!
export const Showcase = () => (
  <SwarmCanvas scene={buildSwarmLandingScene} scrollMode="hybrid" controls agentPill />
);`,
      },
    ],
    propsTable: {
      title: "Các phương thức của SceneBuilder",
      rows: [
        {
          name: "b.addGuide(id, axis, pos, triggerY)",
          type: 'returns `"g:" + id`',
          defaultVal: 'axis: "x" | "y"',
          desc: "Kéo đường gióng đỏ (`#F24822`) từ thanh thước đo trên hoặc trái.",
        },
        {
          name: "b.addRect(id, x, y, w, h, opts?)",
          type: 'returns `"r:" + id`',
          defaultVal: "r, fill, stroke",
          desc: "Kéo khung hình chữ nhật với badge kích thước `W × H` màu xanh `#0D99FF`.",
        },
        {
          name: "b.addText(id, x, y, text, style, opts?)",
          type: 'returns `"t:" + id`',
          defaultVal: "grow, snap, dyn",
          desc: "Gõ văn bản từng ký tự với caret; hỗ trợ `grow: true` và bắt điểm `snap`.",
        },
        {
          name: "b.addDupGroup(id, sourceIds, copies)",
          type: 'returns `"d:" + id + ":2"`',
          defaultVal: "dx, dy, edits[]",
          desc: "Nhân bản hàng loạt phần tử theo lưới (`Alt+Drag`) và cử chuột I-Beam sửa nội dung `edits`.",
        },
        {
          name: "b.add3D / b.addImage",
          type: '`"3d:" + id` / `"img:" + id`',
          defaultVal: 'buildMode: "all"',
          desc: "Đăng ký tác vụ dựng khối 3D hoặc tổng hợp ảnh 2D trên Artboard.",
        },
      ],
    },
  },
  {
    id: "follower-and-pill",
    category: "components",
    badge: "07 · FOLLOWER, AGENT PILL & CONTROLS",
    title: "<SwarmFollower>, <SwarmAgentPill>, <SwarmControls> & useSwarm()",
    summary:
      "Bộ 3 component điều khiển & trạng thái độc lập: `<SwarmFollower>` (đàn chuột đuổi theo chuột thật & xoay vòng Boids Vortex khi dừng), `<SwarmAgentPill>` (hàng đợi 5 icon AI đẩy từ trái qua phải kèm `{N} agents`), và `<SwarmControls>` (popover kiểu Turbopack tự động lưu trạng thái vào `localStorage` qua key `swarm_cursor_settings_v1` & hỗ trợ `children` mở rộng) / `useSwarm()`.",
    codeExamples: [
      {
        title: "Sử dụng <SwarmFollower>, <SwarmAgentPill> và useSwarm() Hook",
        filename: "InteractiveWidgets.tsx",
        code: `import {
  SwarmFollower,
  SwarmAgentPill,
  useSwarm,
} from "swarm-cursor/react";

// 1. Boids Mouse Follower + Circular Vortex Orbit
export const MouseVortex = () => (
  <SwarmFollower
    count={36}
    radiusScale={1}
    tempoMultiplier={1}
    agentPill={{
      maxIcons: 5,
      intervalMs: 650,
      position: "bottom-center",
      icons: ["claude", "openai", "gemini", "deepseek", "grok", "kimi", "mistral"],
    }}
  />
);

// 2. Custom Toolbar via useSwarm() inside <SwarmProvider>
export function CustomToolbar() {
  const { engine, start, pause, resume, reset, setScrollMode } = useSwarm();
  return (
    <div className="flex gap-2">
      <button onClick={() => (!engine.started ? start() : engine.paused ? resume() : pause())}>
        Toggle Play
      </button>
      <button onClick={reset}>Replay Swarm</button>
      <button onClick={() => setScrollMode("hybrid")}>Hybrid Scroll</button>
    </div>
  );
}`,
      },
    ],
    propsTable: {
      title: "Bảng Props của <SwarmFollower> & <SwarmAgentPill>",
      rows: [
        {
          name: "count",
          type: "number",
          defaultVal: "36",
          desc: "Số lượng con trỏ AI trong đàn hoặc hiển thị trong `{N} agents`.",
        },
        {
          name: "radiusScale (SwarmFollower)",
          type: "number",
          defaultVal: "1",
          desc: "Hệ số bán kính vòng xoay Vortex quanh trỏ chuột khi dừng (`1` ~ `135px`).",
        },
        {
          name: "maxIcons / intervalMs (SwarmAgentPill)",
          type: "number",
          defaultVal: "5 / 650",
          desc: "Số icon tối đa (`1..5`) và chu kỳ (ms) đẩy icon AI mới từ trái sang phải.",
        },
        {
          name: "icons (SwarmAgentPill)",
          type: "AgentIconId[]",
          defaultVal: "All 9 AI icons",
          desc: "`claude`, `cohere`, `deepseek`, `gemini`, `grok`, `kimi`, `mistral`, `ollama`, `openai`.",
        },
        {
          name: "position / children (SwarmControls)",
          type: '"bottom-left" | "bottom-right" | "top-right" / ReactNode',
          defaultVal: '"bottom-right"',
          desc: "Tự động lưu `scrollMode`, `tempoMultiplier`, `rulers`, `paused`, `open` vào `localStorage` (`swarm_cursor_settings_v1`) và hỗ trợ chèn thêm hàng cài đặt qua `children`.",
        },
      ],
    },
  },
];
