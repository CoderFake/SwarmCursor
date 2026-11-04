# `<SwarmCanvas>`, `SceneBuilder` & `buildSwarmLandingScene` (Virtual Artboard Mode)

Chế độ **Virtual Artboard** dựng một mặt phẳng thiết kế tỉ lệ chuẩn (mặc định `1280px`, tự động co giãn mượt theo màn hình) nơi đàn chuột AI thực hiện đầy đủ các công cụ Figma:
1. **Rectangle Tool (`cross` -> `arrow`)**: Kéo khung xám `#D9D9D9`, hiển thị kích thước `W × H` màu xanh `#0D99FF`, sau đó áp màu nền, bo góc và viền.
2. **Type Tool (`ibeam` -> `ew`)**: Gõ từng ký tự với dấu nháy caret, hoặc gõ cỡ chữ nhỏ rồi bôi đen toàn bộ (`.text-sel`) và kéo giãn lên cỡ chữ lớn (`grow: true`).
3. **Duplicate Group (`arrow` -> `dup`)**: Nhân bản hàng loạt phần tử theo lưới (`Alt+Drag`) rồi cử chuột I-Beam tới sửa nội dung từng bản sao.
4. **Vector Pen Tool (`pen` -> `pen-add` -> `pen-close`)**: Đặt từng điểm neo vector (`rect 5x5`) và khép kín đường path SVG.
5. **Ruler Guide Drag (`ns` / `ew`)**: Kéo đường gióng đỏ (`#F24822`) từ thước đo trên/trái xuống vị trí thiết kế và nháy sáng (`flash`) khi phần tử bắt điểm (`snap`).
6. **3D & Image Builders (`3d` / `image`)**: Phối hợp đội nhóm (`squadSize`) điêu khắc khối 3D hoặc quét tia laser tổng hợp hình ảnh 2D.
7. **Boids Vortex Flock**: Khi toàn bộ công việc hoàn tất, đàn con trỏ hội tụ xoay vòng quanh chuột người dùng.

---

## 1. Sử dụng Kịch bản Landing dựng sẵn (`buildSwarmLandingScene`)

SwarmCursor cung cấp sẵn kịch bản `buildSwarmLandingScene` (chiều cao `4060px`, hơn `160` phần tử & tác vụ, `8` nhóm nhân bản `Alt+Drag`) giới thiệu toàn bộ kiến trúc SwarmCursor 2.0:

```tsx
import { buildSwarmLandingScene } from "swarm-cursor";
import { SwarmCanvas } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function BuiltInLandingDemo() {
  return (
    <SwarmCanvas
      scene={() => buildSwarmLandingScene(() => 18)}
      scrollMode="hybrid"
      controls={true}
      agentPill={true}
    />
  );
}
```

---

## 2. Tự tạo kịch bản tùy chỉnh với `SceneBuilder`

```tsx
import { SceneBuilder, TYPE_STYLES, PALETTE } from "swarm-cursor";
import { SwarmCanvas } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

function createCustomScene() {
  const b = new SceneBuilder(1280);

  // 1. Kéo thước đỏ căn lề trái tại X = 120 (trả về task ID "g:g-left")
  const guideLeft = b.addGuide("g-left", "x", 120, 100);

  // 2. Gõ tiêu đề H1 (bắt điểm vào thước đỏ + phóng to cỡ chữ)
  const heading = b.addText(
    "hero-h1",
    120,
    140,
    "Autonomous UI & 3D Engine.",
    TYPE_STYLES.h1,
    {
      w: 640,
      grow: true,
      snap: "g-left",
      deps: [guideLeft],
    }
  );

  // 3. Vẽ Card đầu tiên (trả về task ID "r:card-0")
  const card = b.addRect("card-0", 120, 300, 320, 180, {
    fill: PALETTE.card,
    stroke: PALETTE.line,
    r: 14,
    deps: [heading],
  });
  b.addText("card-0-title", 148, 332, "Rust/WASM SIMD128", TYPE_STYLES.h3, {
    deps: [card],
  });

  // 4. Nhân bản ra 2 cột kế tiếp bằng công cụ Alt+Drag (addDupGroup)
  b.addDupGroup(
    "feature-cards",
    ["card-0", "card-0-title"],
    [
      { dx: 350, dy: 0, edits: ["3D Extrude & Slice"] },
      { dx: 700, dy: 0, edits: ["2D <SwarmImage>"] },
    ]
  );

  // 5. Thêm tác vụ xây dựng khối 3D và ảnh 2D (tùy chọn)
  b.add3D("orb-stage", 120, 520, 320, 240, {
    buildMode: "all",
    squadSize: 4,
    deps: ["d:feature-cards:2"],
  });

  b.addImage("cover-img", 470, 520, 670, 240, {
    src: "/images/cover.webp",
    buildMode: "mosaic",
    deps: ["d:feature-cards:2"],
  });

  return b.build(840);
}

export default function ArtboardDemo() {
  return (
    <SwarmCanvas
      scene={createCustomScene}
      scrollMode="hybrid"
      controls={true}
      agentPill={true}
    />
  );
}
```

---

## 3. Bảng phương thức của `SceneBuilder`

| Phương thức | Mô tả | Task ID trả về |
| :--- | :--- | :--- |
| `b.addGuide(id, axis, pos, triggerY)` | Kéo đường gióng đỏ (`"x"` hoặc `"y"`) từ thanh Ruler trên/trái. | `"g:" + id` |
| `b.addRect(id, x, y, w, h, opts?)` | Kéo khung hình chữ nhật với bo góc `r`, màu `fill`, viền `stroke`. | `"r:" + id` |
| `b.addText(id, x, y, text, style, opts?)` | Gõ văn bản với dấu nháy caret; hỗ trợ `grow: true`, `snap`, `dyn`. | `"t:" + id` |
| `b.addPath(id, pts, opts?)` | Đặt các điểm neo vector SVG bằng Pen Tool (`closed`, `fill`, `stroke`). | `"p:" + id` |
| `b.addDupGroup(id, sourceIds, copies, extraDeps?)` | Nhân bản nhóm phần tử theo lưới `Alt+Drag` và cử chuột sửa chữ (`edits`). | `"d:" + id + ":2"` |
| `b.add3D(id, x, y, w, h, opts?)` | Tạo tác vụ dựng mô hình 3D (`extrude` · `particles` · `slice` · `all`, `squadSize`). | `"3d:" + id` |
| `b.addImage(id, x, y, w, h, opts?)` | Tạo tác vụ dựng ảnh 2D (`mosaic` · `scanline` · `halftone` · `all`). | `"img:" + id` |
| `b.addSectionFrame(name, y1, y2, hatch?)` | Vẽ đường kẻ ngang phân tách section và dải sọc chéo hai bên lề. | `string` (HLine ID) |
| `b.addHLine(id, y, deps?)` / `b.addVLine(id, x, y1, y2, deps?)` | Vẽ đường chia lưới ngang / dọc. | `"p:" + id` |
| `b.markStickyFrom(startIndex)` | Đánh dấu các phần tử từ `startIndex` thuộc thanh điều hướng ghim cố định (Sticky Nav). | `void` |
| `b.build(height)` | Đóng gói và trả về đối tượng `SwarmScene` hoàn chỉnh. | `SwarmScene` |
