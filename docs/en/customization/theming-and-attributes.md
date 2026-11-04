# HTML Attributes (`data-swarm-*`) & CSS Variables

## 1. HTML `data-swarm-*` Attributes Reference

When using `createSwarm({ mode: "dom" })`, `scanDeepDOM()`, or `<SwarmProvider>`, you can attach these attributes directly to any HTML, SVG, Image, or Canvas element:

| Attribute | Supported Values | Description |
| :--- | :--- | :--- |
| `data-swarm` | `"rect" \| "text" \| "path" \| "3d" \| "image"` | Declares which Figma tool AI cursors use to construct the element. |
| `data-swarm-id` | `string` | Unique identifier for the element (falls back to `el.id`). |
| `data-swarm-deps` | `"id1,id2"` | Comma-separated prerequisite IDs that must complete (or reach `60%` for parent containers) first. |
| `data-swarm-deep` | `"true"` | Recursively scans child elements (`h1..h6`, `p`, `span`, `button`, `input`, `img`, `svg/path`, `canvas`) and wires a Parent $\rightarrow$ Child DAG. |
| `data-swarm-3d` | `"extrude" \| "particles" \| "slice" \| "all"` | Marks a `<canvas>` or WebGL stage as a 3D construction task. |
| `data-swarm-image` | `"mosaic" \| "scanline" \| "halftone" \| "all"` | Marks an `<img>` or image wrapper as a 2D image synthesis task. |
| `data-swarm-squad` | `"2" .. "6"` | Number of AI cursors collaborating simultaneously (Work-Stealing Squad) on this 3D/container node. |
| `data-swarm-glb` | `string` | Optional URL to a `.glb` / `.gltf` asset. |
| `data-swarm-grow` | `"true"` | For `data-swarm="text"`: types at small font size first, selects all, and drags to scale up. |
| `data-swarm-snap` | `"x" \| "y" \| "xy"` | Pulls red alignment guides from the top/left ruler aligned to this element. |
| `data-swarm-drawing` | `"true"` *(automatic)* | Set automatically by the engine while cursors are actively constructing the element. |
| `data-swarm-done` | `"true"` *(automatic)* | Set automatically by the engine once construction completes. |

---

## 2. CSS Custom Properties

Override in `:root` to match your application's palette:

```css
:root {
  --paper: #F8F9FA;               /* Canvas / sticky header background */
  --ink: #121417;                 /* Primary text color */
  --swarm-blue: #0D99FF;          /* Figma bounding box & dimension badge color */
  --swarm-red: #F24822;           /* Red alignment snap guides */
  --swarm-ruler-bg: #2c2c2c;      /* Top & left ruler background */
  --swarm-ruler-border: #3a3a3a;  /* Ruler border color */
}
```

---

## 3. 9 Built-in AI Agent Icons (`AI_AGENT_ICONS`)

| Icon ID (`AgentIconId`) | Display Name | Avatar Background (`avatarBg`) |
| :--- | :--- | :--- |
| `"claude"` | Claude | `#ffffff` |
| `"cohere"` | Cohere | `#ffffff` |
| `"deepseek"` | DeepSeek | `#ffffff` |
| `"gemini"` | Gemini | `#ffffff` |
| `"grok"` | Grok | `#121417` |
| `"kimi"` | Kimi | `#121417` |
| `"mistral"` | Mistral | `#ffffff` |
| `"ollama"` | Ollama | `#ffffff` |
| `"openai"` | OpenAI | `#ffffff` |
