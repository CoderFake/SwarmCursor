import type { DocsUI } from "../../types";

export const VI_UI: DocsUI = {
  nav: {
    subtitle: "CoderFake · Lõi Rust/WASM & 3D",
    docsMode: "📚 Tài liệu Tương tác (DOM Swarm)",
    artboardMode: "🎨 Artboard Showcase (Canvas)",
    replayBtn: "Vẽ lại bằng Swarm",
    replayTooltip: "Cho đàn chuột AI vẽ lại toàn bộ trang tài liệu",
  },
  hero: {
    tag: "SWARMCURSOR 2.0 · RUST/WASM SIMD128 · MÃ NGUỒN MỞ MIT",
    title: "Tài liệu Toàn diện & Trình diễn Đàn Chuột AI Đa Tác Tử.",
    lead: "Toàn bộ trang hướng dẫn này đang được đàn chuột AI của SwarmCursor 2.0 trực tiếp vẽ khung, gõ chữ, kéo thước căn lề đỏ, điêu khắc lưới 3D và quét ảnh 2D ở tốc độ 60fps bằng lõi Rust/WASM SIMD128.",
    ctaStart: "Bắt đầu ngay ↓",
    stats: [
      {
        title: "8 Sub-Packages",
        subtitle: "/engine · /kernel · /three · /scanner · /renderers · /tools · /react",
      },
      {
        title: "5 Phép toán WASM SIMD128",
        subtitle: "Boids O(N) · f32x4 Bezier · 4×4 MVP · Đấu giá tác vụ · Biến dạng lưới 3D",
      },
      {
        title: "Bộ dựng 3D & Ảnh 2D",
        subtitle: "3D (extrude · particles · slice) & Ảnh 2D (mosaic · scanline · halftone)",
      },
    ],
  },
  sidebar: {
    gettingStarted: "1. Bắt đầu (Getting Started)",
    components: "2. React Components & 3D/Image",
    subsystems: "3. Rust/WASM, Engine & Thuộc tính",
  },
  table: {
    nameCol: "Tên / Thuộc tính",
    typeCol: "Kiểu dữ liệu",
    defaultCol: "Mặc định",
    descCol: "Mô tả chi tiết",
    copyBtn: "Sao chép",
    copiedBtn: "✓ Đã chép",
  },
  sandbox: {
    threeTitle: "Mô phỏng Trực tiếp 3 Pha Điêu khắc 3D & Biến dạng Lưới WASM",
    imageTitle: "Thử nghiệm 3 Thuật toán Dựng Ảnh 2D (mosaic · scanline · halftone)",
    pause: "Tạm dừng",
    play: "Chạy tiếp",
  },
  footer: {
    title: "SwarmCursor 2.0 — MIT License",
    subtitle:
      "Phát triển bởi CoderFake (Hoàng Văn Điệu) · Kiến trúc 8 Sub-Packages & Lõi Rust/WASM SIMD128.",
  },
};
