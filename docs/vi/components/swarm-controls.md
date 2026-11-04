# `<SwarmControls>` & `useSwarm()` Hook

## 1. `<SwarmControls>` (Turbopack Popover & Tự động lưu `localStorage`)

Widget điều khiển góc màn hình theo phong cách **Next.js Turbopack** giúp:
- Bật/tắt tiến trình (`▶ Start` / `⏸ Pause` / `▶ Resume`) hoặc chạy lại từ đầu (`↺ Replay`).
- Chuyển đổi chế độ cuộn (`Manual` / `Auto` / `Hybrid`), tốc độ dựng (`0.5×`, `1×`, `2×`, `4×`) và thước đo Figma (`Figma Rulers: On / Off`).
- **Tự động lưu & khôi phục trạng thái qua `localStorage` (`swarm_cursor_settings_v1`)**: Mọi thiết lập (`scrollMode`, `tempoMultiplier`, `rulers`, `paused`, `open`) đều được tự động lưu lại và khôi phục ngay khi tải lại trang.
- **Hỗ trợ `children` mở rộng**: Cho phép chèn thêm các dòng cài đặt tùy chỉnh (ví dụ: ẩn/hiện `<SwarmAgentPill>`, đổi góc hiển thị, hoặc chọn chế độ vào của đàn con trỏ `outside-in` / `circle-in-place`) ngay bên trong popover.

```tsx
import { SwarmProvider, SwarmControls } from "swarm-cursor/react";

<SwarmProvider scrollMode="hybrid">
  {/* Các SwarmElement của bạn */}
  <SwarmControls position="bottom-left" defaultOpen={false}>
    <div className="swarm-tp-row">
      <span className="swarm-tp-label">Custom Option</span>
      <button type="button" className="swarm-tp-btn active">Enabled</button>
    </div>
  </SwarmControls>
</SwarmProvider>
```

### Bảng Props của `<SwarmControls>`

| Prop | Kiểu dữ liệu | Mặc định | Mô tả |
| :--- | :--- | :--- | :--- |
| `engine` | `SwarmEngine` | `useSwarm().engine` | Thực thể `SwarmEngine` cần điều khiển (tự động lấy từ Context nếu dùng `<SwarmControls>` trong `<SwarmProvider>`). |
| `autoScroll` | `AutoScrollController` | `useSwarm().autoScroll` | Bộ điều khiển cuộn trang (`Manual` / `Auto` / `Hybrid`). |
| `position` | `"bottom-left" \| "bottom-right" \| "top-right"` | `"bottom-right"` | Góc neo của nút badge Turbopack và bảng popover. |
| `defaultOpen` | `boolean` | `false` | Trạng thái mở mặc định của bảng popover trong lần đầu truy cập (sau đó ưu tiên trạng thái lưu trong `localStorage`). |
| `children` | `React.ReactNode` | `undefined` | Các dòng điều khiển tùy chỉnh bổ sung được hiển thị ở phần mở rộng cuối popover (`.swarm-tp-extra`). |

---

## 2. `useSwarm()` Hook

Cho phép bạn tự viết giao diện điều khiển riêng từ bất kỳ component con nào nằm trong `<SwarmProvider>`:

```tsx
import { useSwarm } from "swarm-cursor/react";

export function CustomController() {
  const { engine, autoScroll, start, pause, resume, reset, setScrollMode } =
    useSwarm();

  return (
    <div className="flex items-center gap-3">
      <button onClick={() => (!engine.started ? start() : engine.paused ? resume() : pause())}>
        {!engine.started ? "Start" : engine.paused ? "Resume" : "Pause"}
      </button>
      <button onClick={reset}>Reset</button>
      <button onClick={() => setScrollMode("auto")}>Auto Scroll</button>
    </div>
  );
}
```
