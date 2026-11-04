# `<SwarmControls>` & `useSwarm()` Hook

## 1. `<SwarmControls>`

Floating toolbar to Start/Pause/Resume, `Reset` the choreography, switch scroll mode (`Manual` / `Auto` / `Hybrid`), adjust playback tempo (`0.5×`, `1.0×`, `2.0×`, `4.0×`), and toggle Figma `Rulers`.

```tsx
import { SwarmProvider, SwarmControls } from "swarm-cursor/react";

<SwarmProvider scrollMode="hybrid">
  {/* Your SwarmElements */}
  <SwarmControls position="bottom-right" />
</SwarmProvider>
```

---

## 2. `useSwarm()` Hook

Allows you to build custom control UIs from any component nested inside `<SwarmProvider>`:

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
