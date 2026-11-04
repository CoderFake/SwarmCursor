# `<SwarmFollower>` (Mouse Follow & Circular Vortex Orbit)

`<SwarmFollower>` là component độc lập tạo hiệu ứng đàn chuột AI tương tác trực tiếp với con trỏ chuột của người dùng:

1. **Khi chuột di chuyển**: Đàn chuột đuổi theo tọa độ chuột thật với lực hút về tâm (`cohesion`) và lực đẩy tách đàn (`separation` bán kính `44px`) để các con trỏ không chồng chéo lên nhau.
2. **Khi chuột dừng lại**: Lực tiếp tuyến (`tangential vortex force`) kết hợp lực lò xo hướng tâm giữ đàn chuột **xoay vòng tròn liên tục** quanh mũi chuột với bán kính `~135px * radiusScale`.
3. **Khi chuột rời khỏi cửa sổ**: Đàn chuột tự động diễu hành theo quỹ đạo đường cong số 8 (Lissajous figure-8) giữa màn hình.

---

## Ví dụ sử dụng

```tsx
import { SwarmFollower } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export function MouseSwarmEffect() {
  return (
    <SwarmFollower
      count={36}
      radiusScale={1}
      tempoMultiplier={1}
      showLabels={false}
      zIndex={40}
      // Chỉ khi khai báo agentPill thì thanh "{N} agents" mới xuất hiện ở bottom bar
      agentPill={{
        maxIcons: 5,
        intervalMs: 650,
        position: "bottom-center",
      }}
    />
  );
}
```

---

## Bảng Props

| Prop | Kiểu dữ liệu | Mặc định | Mô tả |
| :--- | :--- | :--- | :--- |
| `count` | `number` | `36` | Số lượng con trỏ chuột trong đàn. |
| `radiusScale` | `number` | `1` | Hệ số nhân bán kính vòng xoay quanh chuột khi dừng (`1` tương đương `~135px`). |
| `tempoMultiplier` | `number` | `1` | Hệ số tốc độ bay và xoay vòng (`0.5` -> `4`). |
| `showLabels` | `boolean` | `false` | Hiển thị tên Agent bên cạnh mỗi con trỏ chuột. |
| `agentPill` | `boolean \| Omit<SwarmAgentPillProps, "engine">` | `false` | **Mặc định tắt.** Khai báo `true` hoặc truyền object cấu hình để hiện thanh `{N} agents` ở bottom bar. |
| `zIndex` | `number` | `40` | `z-index` của lớp phủ fixed toàn màn hình. |
| `className` | `string` | `undefined` | Class tùy chỉnh thêm vào container `.cursors`. |
