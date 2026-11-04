# `<SwarmAgentPill>` (Bottom-Bar AI Agent Queue Pill)

`<SwarmAgentPill>` renders the Figma-inspired multi-agent status pill:
- Displays **up to 5 overlapping circular avatars** (`margin-left: -8px`, `2px` white ring).
- Samples from **9 built-in AI model icons** (`claude`, `cohere`, `deepseek`, `gemini`, `grok`, `kimi`, `mistral`, `ollama`, `openai`).
- Continuously pushes a new icon from **left to right** like an active worker queue; the 6th icon on the far right exits smoothly.
- Displays the agent count formatted as **`{N} agents`** (e.g. `30 agents`, `36 agents`).

> **Opt-in Principle**: `<SwarmAgentPill>` **only renders when explicitly declared** (either mounted directly as `<SwarmAgentPill />` or enabled via the `agentPill` prop on `<SwarmFollower>`, `<SwarmProvider>`, or `<SwarmCanvas>`).

---

## Usage Examples

### 1. Standalone Component
```tsx
import { SwarmAgentPill } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export function AgentQueueBar() {
  return (
    <SwarmAgentPill
      count={30}
      maxIcons={5}
      intervalMs={650}
      position="bottom-center"
    />
  );
}
```

### 2. Attached to `<SwarmFollower>` or `<SwarmProvider>`
```tsx
<SwarmFollower
  count={30}
  agentPill={{
    maxIcons: 5,
    intervalMs: 600,
    position: "bottom-center",
    icons: ["claude", "openai", "gemini", "deepseek", "grok", "kimi", "mistral"],
  }}
/>
```

---

## Props Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `engine` | `SwarmEngine` | `undefined` | Synchronizes cursor count and `tempoMultiplier` with a live `SwarmEngine`. |
| `count` | `number` | `engine?.cursors.length ?? 36` | Number displayed in `{N} agents`. |
| `maxIcons` | `number` | `5` | Maximum avatars in the queue (clamped to `1..5`). |
| `intervalMs` | `number` | `650` | Interval (ms) for pushing a new random AI icon into the left of the queue. |
| `icons` | `AgentIconId[]` | All 9 icons | Subset of AI icons to cycle through. |
| `position` | `"bottom-center" \| "bottom-left" \| "bottom-right" \| "inline"` | `"bottom-center"` | Fixed bottom-bar placement or `"inline"` for custom toolbars. |
| `label` | `string \| ((count: number) => string)` | `` (n) => `${n} agents` `` | Custom label formatter. |
| `paused` | `boolean` | `false` | Pauses queue rotation. |
