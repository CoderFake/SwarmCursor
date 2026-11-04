# `<SwarmCanvas>` & `SceneBuilder` (Virtual Artboard Mode)

Chế độ **Virtual Artboard** dựng một mặt phẳng thiết kế tỉ lệ chuẩn (mặc định `1280px`, tự động co giãn mượt theo màn hình) nơi đàn chuột AI thực hiện đầy đủ 6 công cụ Figma:
1. **Rectangle Tool (`cross` -> `arrow`)**: Kéo khung xám `#D9D9D9`, hiển thị kích thước `W × H` màu xanh `#0D99FF`, sau đó áp màu nền, bo góc và viền.
2. **Type Tool (`ibeam` -> `ew`)**: Gõ từng ký tự với dấu nháy caret, hoặc gõ cỡ chữ nhỏ rồi bôi đen toàn bộ (`.text-sel`) và kéo giãn lên cỡ chữ lớn (`grow: true`).
3. **Duplicate Group (`arrow` -> `dup`)**: Nhân bản hàng loạt phần tử theo lưới (`Alt+Drag`) rồi cử chuột I-Beam tới sửa nội dung từng bản sao.
4. **Vector Pen Tool (`pen` -> `pen-add` -> `pen-close`)**: Đặt từng điểm neo vector (`rect 5x5`) và khép kín đường path SVG.
5. **Ruler Guide Drag (`ns` / `ew`)**: Kéo đường gióng đỏ (`#F24822`) từ thước đo trên/trái xuống vị trí thiết kế và nháy sáng (`flash`) khi phần tử bắt điểm (`snap`).
6. **Boids Vortex Flock**: Khi toàn bộ công việc hoàn tất, 36 con trỏ hội tụ xoay vòng quanh chuột người dùng.

---

## Ví dụ tự tạo kịch bản với `SceneBuilder`

```tsx
import { SceneBuilder } from "swarm-cursor";
import { SwarmCanvas } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

function createCustomScene() {
  const b = new SceneBuilder(1280);

  // 1. Kéo thước đỏ căn lề trái tại X = 120
  const guideLeft = b.guideX(120, 100);

  // 2. Gõ tiêu đề H1 (bắt điểm vào thước đỏ + phóng to cỡ chữ)
  const heading = b.text(120, 140, "Autonomous UI Engine.", "h1", {
    w: 640,
    grow: true,
    deps: [guideLeft],
  });

  // 3. Vẽ Card đầu tiên
  const card = b.rect(120, 300, 320, 180, {
    fill: "#FFFFFF",
    stroke: "#E2E4E9",
    r: 14,
    deps: [heading],
  });

  // 4. Nhân bản ra 2 cột kế tiếp bằng công cụ Alt+Drag (dupGroup)
  b.dupGroup(
    "feature-cards",
    [card],
    [
      { dx: 350, dy: 0 },
      { dx: 700, dy: 0 },
    ],
    [card]
  );

  return b.build(720);
}

export default function ArtboardDemo() {
  return (
    <SwarmCanvas
      scene={createCustomScene}
      scrollMode="hybrid"
      controls={true}
      agentPill={true} // Tùy chọn hiện thanh "{N} agents"
    />
  );
}
```
