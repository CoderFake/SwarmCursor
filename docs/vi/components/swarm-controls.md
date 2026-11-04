# `<SwarmControls>` & `useSwarm()` Hook

## 1. `<SwarmControls>`

Thanh công cụ nổi giúp bật/tắt hiệu ứng, chạy lại từ đầu (`Reset`), đổi chế độ cuộn (`Manual` / `Auto` / `Hybrid`), đổi tốc độ (`0.5×`, `1.0×`, `2.0×`, `4.0×`) và bật/tắt thước đo Figma (`Rulers`).

```tsx
import { SwarmProvider, SwarmControls } from "swarm-cursor/react";

<SwarmProvider scrollMode="hybrid">
  {/* Các SwarmElement của bạn */}
  <SwarmControls position="bottom-right" />
</SwarmProvider>
```

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
