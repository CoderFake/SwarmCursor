# `<SwarmFollower>` (Mouse Follow & Circular Vortex Orbit)

`<SwarmFollower>` is a standalone component that creates a reactive flock of AI cursors interacting directly with the user's pointer:

1. **While moving**: The flock chases the pointer using Reynolds cohesion and a `44px` separation radius so cursors never overlap.
2. **When pointer stops**: A tangential vortex force combined with a radial spring keeps the cursors **orbiting in a smooth circle** (`~135px * radiusScale`) around the pointer tip.
3. **When pointer leaves window**: Cursors parade along a smooth Lissajous figure-8 trajectory across the viewport.

---

## Usage Example

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

## Props Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `count` | `number` | `36` | Number of AI cursors in the flock. |
| `radiusScale` | `number` | `1` | Multiplier for the circular vortex orbit radius (`1` $\approx$ `135px`). |
| `tempoMultiplier` | `number` | `1` | Flight and orbit speed multiplier (`0.5` to `4`). |
| `showLabels` | `boolean` | `false` | Displays agent role labels next to each cursor. |
| `agentPill` | `boolean \| Omit<SwarmAgentPillProps, "engine">` | `false` | **Off by default.** Pass `true` or config object to render the bottom `{N} agents` queue pill. |
| `zIndex` | `number` | `40` | CSS `z-index` of the fixed fullscreen cursor layer. |
| `className` | `string` | `undefined` | Optional class name added to `.cursors`. |
