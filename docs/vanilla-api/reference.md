# Vanilla JS / TypeScript API Reference

Bạn có thể sử dụng toàn bộ sức mạnh của **SwarmCursor** trong các dự án HTML thuần, Vite, Vue, Svelte, Astro mà không cần React.

---

## 1. `createSwarm(options)`

Quét các phần tử `[data-swarm]` trong DOM (hoặc chạy một `scene` ảo) và điều phối đàn chuột AI vẽ trang khi cuộn:

```ts
import { createSwarm } from "swarm-cursor";
import "swarm-cursor/styles.css";

const swarm = createSwarm({
  container: document.body,
  mode: "dom",            // "dom" | "canvas" | "hybrid"
  scrollMode: "hybrid",   // "manual" | "auto" | "hybrid"
  autoScrollSpeed: 180,
  tempoMultiplier: 1,
  // Chỉ hiện thanh "{N} agents" ở bottom bar khi khai báo agentPill
  agentPill: {
    maxIcons: 5,
    intervalMs: 650,
    position: "bottom-center",
  },
});

// Các phương thức điều khiển:
swarm.start();
swarm.pause();
swarm.resume();
swarm.reset();
swarm.setScrollMode("auto");
// Khi cần hủy:
// swarm.destroy();
```

---

## 2. `createSwarmFollower(options)`

Tạo đàn chuột đuổi theo trỏ chuột người dùng khi di chuyển và xoay vòng tròn (Vortex Orbit) khi chuột dừng:

```ts
import { createSwarmFollower } from "swarm-cursor";
import "swarm-cursor/styles.css";

const follower = createSwarmFollower({
  count: 36,
  radiusScale: 1,
  tempoMultiplier: 1,
  zIndex: 40,
  agentPill: true, // Tùy chọn: khai báo mới hiện thanh "36 agents"
});

// Hủy khi không dùng nữa:
// follower.destroy();
```

---

## 3. `createSwarmAgentPill(options)`

Tạo thanh Bottom-Bar Queue hiển thị tối đa 5 icon AI nhảy ngẫu nhiên từ trái qua phải kèm `{N} agents`:

```ts
import { createSwarmAgentPill } from "swarm-cursor";
import "swarm-cursor/styles.css";

const pill = createSwarmAgentPill({
  count: 30,
  maxIcons: 5,
  intervalMs: 650,
  position: "bottom-center",
  icons: ["claude", "openai", "gemini", "deepseek", "grok", "kimi", "mistral"],
});

// Hủy khi không dùng nữa:
// pill.destroy();
```
