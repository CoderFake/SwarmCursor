# `<SwarmControls>` & `useSwarm()` Hook

## 1. `<SwarmControls>` (Turbopack Popover & Automatic `localStorage` Persistence)

Corner-anchored **Next.js Turbopack-style** badge and settings popover to:
- Control playback (`▶ Start` / `⏸ Pause` / `▶ Resume`) or `↺ Replay` the choreography.
- Switch scroll mode (`Manual` / `Auto` / `Hybrid`), adjust playback tempo (`0.5×`, `1×`, `2×`, `4×`), and toggle Figma `Rulers` (`On` / `Off`).
- **Automatic `localStorage` Persistence (`swarm_cursor_settings_v1`)**: All user preferences (`scrollMode`, `tempoMultiplier`, `rulers`, `paused`, `open`) are automatically persisted to `localStorage` and restored on page reload.
- **Extensible `children` Slot**: Pass custom `.swarm-tp-row` controls (such as `<SwarmAgentPill>` visibility, corner placement, or cursor intro mode `outside-in` / `circle-in-place`) directly inside the popover.

```tsx
import { SwarmProvider, SwarmControls } from "swarm-cursor/react";

<SwarmProvider scrollMode="hybrid">
  {/* Your SwarmElements */}
  <SwarmControls position="bottom-left" defaultOpen={false}>
    <div className="swarm-tp-row">
      <span className="swarm-tp-label">Custom Option</span>
      <button type="button" className="swarm-tp-btn active">Enabled</button>
    </div>
  </SwarmControls>
</SwarmProvider>
```

### `<SwarmControls>` Props Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `engine` | `SwarmEngine` | `useSwarm().engine` | Target `SwarmEngine` instance (automatically resolved when nested inside `<SwarmProvider>`). |
| `autoScroll` | `AutoScrollController` | `useSwarm().autoScroll` | Target `AutoScrollController` (`Manual` / `Auto` / `Hybrid`). |
| `position` | `"bottom-left" \| "bottom-right" \| "top-right"` | `"bottom-right"` | Corner placement of the Turbopack trigger badge and popover. |
| `defaultOpen` | `boolean` | `false` | Initial open state before any `localStorage` state is saved. |
| `children` | `React.ReactNode` | `undefined` | Extra custom settings rows rendered inside `.swarm-tp-extra` at the bottom of the popover. |

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
