# SwarmCursor Documentation

Chào mừng bạn đến với tài liệu chính thức của **SwarmCursor** (`https://github.com/CoderFake/SwarmCursor`) — thư viện hiệu ứng đàn chuột AI đa tác tử (Multi-Agent Figma Cursor Choreography, Scroll-Driven UI Builder & Boids Vortex Follower) cho **React 18/19** và **Vanilla TypeScript / JavaScript**.

---

## Cấu trúc Tài liệu

### 1. Bắt đầu (`getting-started/`)
- [Cài đặt & Thiết lập (`installation.md`)](./getting-started/installation.md) — Cài qua GitHub/NPM, cấu hình CSS cho Vite, Next.js App Router, Astro.
- [Bắt đầu nhanh trong 60 giây (`quick-start.md`)](./getting-started/quick-start.md) — 3 mẫu tích hợp phổ biến nhất.

### 2. React Components (`components/`)
- [`<SwarmProvider>` & `<SwarmElement>` (`swarm-provider.md`)](./components/swarm-provider.md) — Chế độ DOM-Driven: biến mọi giao diện React/Tailwind có sẵn thành mặt phẳng được chuột AI vẽ khi cuộn trang.
- [`<SwarmFollower>` (`swarm-follower.md`)](./components/swarm-follower.md) — Đàn chuột đuổi theo con trỏ người dùng khi di chuyển và **xoay vòng tròn (Vortex Orbit)** khi chuột dừng.
- [`<SwarmAgentPill>` (`swarm-agent-pill.md`)](./components/swarm-agent-pill.md) — Thanh Bottom-Bar kiểu Figma hiển thị tối đa **5 icon AI ngẫu nhiên** đẩy liên tục kiểu hàng đợi (queue) từ trái qua phải kèm `{N} agents` *(chỉ hiện khi khai báo)*.
- [`<SwarmCanvas>` & `SceneBuilder` (`swarm-canvas.md`)](./components/swarm-canvas.md) — Chế độ Artboard ảo: dựng kịch bản vẽ chi tiết bằng 6 công cụ Figma.
- [`<SwarmControls>` & `useSwarm()` (`swarm-controls.md`)](./components/swarm-controls.md) — Thanh điều khiển nổi & React Hook điều khiển tiến trình.

### 3. Vanilla JS / TS API (`vanilla-api/`)
- [Vanilla API Reference (`reference.md`)](./vanilla-api/reference.md) — Hướng dẫn dùng `createSwarm()`, `createSwarmFollower()`, `createSwarmAgentPill()`, `SwarmEngine`, `AutoScrollController` không cần React.

### 4. Tùy biến & Thuộc tính (`customization/`)
- [HTML Attributes & CSS Variables (`theming-and-attributes.md`)](./customization/theming-and-attributes.md) — Bảng tra cứu `data-swarm-*`, biến CSS `--swarm-*`, và danh sách 9 AI Agent Icons tích hợp.
