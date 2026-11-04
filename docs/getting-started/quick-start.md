# Bắt đầu nhanh trong 60 giây

Dưới đây là 3 cách sử dụng phổ biến nhất của **SwarmCursor**:

---

## Cách 1: Đàn chuột đuổi theo trỏ chuột & xoay vòng khi dừng (`<SwarmFollower />`)

```tsx
import { SwarmFollower } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function App() {
  return (
    <>
      {/* Mặc định chỉ hiện đàn chuột đuổi & xoay vòng quanh trỏ chuột */}
      {/* Khai báo thêm agentPill={true} nếu muốn hiện thanh 5 icon AI + "36 agents" ở bottom bar */}
      <SwarmFollower count={36} radiusScale={1} agentPill={true} />
      <main>Nội dung trang của bạn...</main>
    </>
  );
}
```

---

## Cách 2: Đàn chuột tự động vẽ các Component khi cuộn trang (`<SwarmProvider />`)

```tsx
import { SwarmProvider, SwarmElement } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function LandingPage() {
  return (
    <SwarmProvider scrollMode="hybrid" agentPill={{ maxIcons: 5 }}>
      <SwarmElement id="hero-title" tool="text" grow snapAxis="x">
        <h1>SwarmCursor Engine</h1>
      </SwarmElement>

      <SwarmElement id="feature-card" tool="rect" deps={["hero-title"]} snapAxis="y">
        <div className="card">Được vẽ tự động bởi con trỏ AI khi cuộn xuống</div>
      </SwarmElement>
    </SwarmProvider>
  );
}
```

---

## Cách 3: Chỉ dùng thanh Bottom-Bar Queue 5 Icon AI (`<SwarmAgentPill />`)

```tsx
import { SwarmAgentPill } from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export function BottomStatus() {
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
