# SwarmCursor

**Autonomous Multi-Agent Figma Cursor Choreography, Scroll-Driven UI Builder & Boids Vortex Mouse Follower for React & Vanilla TypeScript.**

Repository: **[https://github.com/CoderFake/SwarmCursor](https://github.com/CoderFake/SwarmCursor)**

---

## Tính năng nổi bật

- **6 Công cụ Figma tự động (Autonomous Coroutines)**:
  - **Rectangle Tool (`cross` → `arrow`)**: Kéo khung wireframe `#D9D9D9`, hiển thị kích thước `W × H` (`#0D99FF`) rồi áp màu nền, bo góc, viền.
  - **Type Tool (`ibeam` → `ew`)**: Gõ từng ký tự với dấu nháy caret, hoặc gõ cỡ chữ nhỏ rồi bôi đen toàn bộ và kéo giãn lên cỡ chữ lớn (`grow`).
  - **Duplicate Group (`arrow` → `dup`)**: Nhân bản hàng loạt phần tử theo lưới (`Alt+Drag`) và cử chuột I-Beam tới sửa nội dung từng bản sao.
  - **Vector Pen Tool (`pen` → `pen-add` → `pen-close`)**: Đặt từng điểm neo vector (`5×5`) và khép kín đường path SVG.
  - **Ruler & Red Snap Guides (`ns` / `ew`)**: Kéo đường gióng đỏ (`#F24822`) từ thước đo trên/trái khớp vào cạnh phần tử.
- **Boids Vortex Mouse Follower (`<SwarmFollower />`)**:
  - Đuổi theo chuột người dùng khi di chuyển (Cohesion + Separation) và **xoay vòng tròn (Circular Vortex Orbit)** quanh mũi chuột khi chuột dừng lại.
- **Opt-in Bottom-Bar AI Agent Queue Pill (`<SwarmAgentPill />`)**:
  - Hiển thị tối đa **5 icon AI ngẫu nhiên** (Claude, OpenAI, Gemini, DeepSeek, Grok, Kimi, Mistral, Cohere, Ollama) nhảy liên tục đẩy kiểu hàng đợi (queue) từ trái sang phải kèm nhãn **`{N} agents`**. Chỉ hiện khi người dùng khai báo.
- **3 Chế độ Cuộn (`manual` | `auto` | `hybrid`)**:
  - Cuộn tay tới đâu vẽ tới đó, tự động cuộn mượt theo tiến độ task, hoặc chế độ lai thông minh.

---

## Tài liệu chi tiết theo thư mục (`docs/`)

Toàn bộ hướng dẫn sử dụng chi tiết được chia theo từng thư mục trong [`docs/`](./docs/README.md):

- **Bắt đầu (`docs/getting-started/`)**
  - [Cài đặt & Thiết lập](./docs/getting-started/installation.md)
  - [Bắt đầu nhanh trong 60 giây](./docs/getting-started/quick-start.md)
- **React Components (`docs/components/`)**
  - [`<SwarmProvider>` & `<SwarmElement>` (DOM-Driven Mode)](./docs/components/swarm-provider.md)
  - [`<SwarmFollower>` (Mouse Follow & Circular Vortex Orbit)](./docs/components/swarm-follower.md)
  - [`<SwarmAgentPill>` (Bottom-Bar 5 AI Icons Queue + `{N} agents`)](./docs/components/swarm-agent-pill.md)
  - [`<SwarmCanvas>` & `SceneBuilder` (Virtual Artboard Mode)](./docs/components/swarm-canvas.md)
  - [`<SwarmControls>` & `useSwarm()` Hook](./docs/components/swarm-controls.md)
- **Vanilla JS / TS API (`docs/vanilla-api/`)**
  - [Vanilla API Reference (`createSwarm`, `createSwarmFollower`, `createSwarmAgentPill`)](./docs/vanilla-api/reference.md)
- **Tùy biến (`docs/customization/`)**
  - [HTML Attributes `data-swarm-*` & CSS Variables](./docs/customization/theming-and-attributes.md)

---

## Cài đặt nhanh

```bash
npm install git+https://github.com/CoderFake/SwarmCursor.git
```

```tsx
import { SwarmFollower } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function App() {
  return (
    <>
      {/* Khai báo agentPill={true} khi muốn hiện thanh 5 icon + "36 agents" ở bottom bar */}
      <SwarmFollower count={36} radiusScale={1} agentPill={true} />
    </>
  );
}
```

---

## License

MIT © [CoderFake](https://github.com/CoderFake/SwarmCursor)
