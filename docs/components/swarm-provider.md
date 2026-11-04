# `<SwarmProvider>` & `<SwarmElement>` (DOM-Driven Mode)

Chế độ **DOM-Driven** cho phép bạn giữ nguyên cấu trúc HTML/React/Tailwind của dự án. Khi người dùng kéo trang (hoặc khi trang tự động cuộn), `<SwarmProvider>` tự động quét tọa độ các `<SwarmElement>` và điều phối đàn chuột AI bay tới thực hiện thao tác vẽ tương ứng trước khi làm hiện phần tử thật.

---

## Ví dụ sử dụng

```tsx
import {
  SwarmProvider,
  SwarmElement,
  SwarmControls,
} from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function PortfolioSection() {
  return (
    <SwarmProvider
      scrollMode="hybrid"
      autoScrollSpeed={180}
      showCursorLabels={true}
      agentPill={{
        maxIcons: 5,
        intervalMs: 600,
        position: "bottom-center",
      }}
    >
      <section className="max-w-5xl mx-auto py-24 space-y-12">
        {/* 1. Công cụ I-Beam gõ chữ + phóng to cỡ chữ + kéo thước đỏ trục X */}
        <SwarmElement id="title" tool="text" grow snapAxis="x">
          <h1 className="text-5xl font-bold">Creative Engineering</h1>
        </SwarmElement>

        {/* 2. Công cụ Crosshair kéo khung hình chữ nhật sau khi "title" xong */}
        <SwarmElement id="card-1" tool="rect" deps={["title"]} snapAxis="y">
          <div className="p-8 rounded-2xl border bg-white shadow-sm">
            <h3>Interactive Systems</h3>
            <p>Multi-agent cursor choreography.</p>
          </div>
        </SwarmElement>

        {/* 3. Công cụ Pen Tool đồ nét vector SVG */}
        <SwarmElement id="logo-svg" tool="path" deps={["card-1"]}>
          <svg viewBox="0 0 120 120" className="w-20 h-20">
            <path d="M10 90 L60 15 L110 90 Z" />
          </svg>
        </SwarmElement>
      </section>

      <SwarmControls position="bottom-right" />
    </SwarmProvider>
  );
}
```

---

## Props của `<SwarmProvider>`

| Prop | Kiểu dữ liệu | Mặc định | Mô tả |
| :--- | :--- | :--- | :--- |
| `scrollMode` | `"manual" \| "auto" \| "hybrid"` | `"manual"` | `"manual"`: cuộn tay tới đâu vẽ tới đó.<br>`"auto"`: tự cuộn theo tiến độ.<br>`"hybrid"`: tự cuộn nhưng nhường quyền khi người dùng lăn chuột, tự tiếp tục sau 1.2s nghỉ. |
| `autoScrollSpeed` | `number` | `180` | Tốc độ tự động cuộn tối đa (`px/s`). |
| `controls` | `boolean` | `false` | Hiển thị thanh điều khiển nổi mặc định. |
| `showCursorLabels` | `boolean` | `false` | Hiển thị nhãn tên Agent cạnh mỗi con trỏ. |
| `designWidth` | `number` | `1280` | Chiều rộng tham chiếu của khung thiết kế. |
| `agentPill` | `boolean \| Omit<SwarmAgentPillProps, "engine">` | `false` | **Chỉ hiện khi khai báo.** Hiển thị thanh Bottom-Bar Queue tối đa 5 icon AI + `{N} agents`. |

---

## Props của `<SwarmElement>`

| Prop | Kiểu dữ liệu | Mặc định | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `string` *(bắt buộc)* | — | ID duy nhất của phần tử để các phần tử khác tham chiếu trong `deps`. |
| `tool` | `"rect" \| "text" \| "path"` | `"rect"` | Công cụ Figma mà chuột AI sẽ dùng để vẽ phần tử này. |
| `grow` | `boolean` | `false` | Chỉ áp dụng cho `tool="text"`: gõ chữ cỡ nhỏ trước, bôi đen toàn bộ rồi kéo giãn lên cỡ chữ thật. |
| `snapAxis` | `"x" \| "y" \| "xy"` | `undefined` | Cử thêm 1 chuột AI kéo đường gióng đỏ (Red Guide) từ thanh Ruler trên/trái khớp vào cạnh phần tử. |
| `deps` | `string[]` | `undefined` | Danh sách `id` phải vẽ xong trước khi phần tử này được phép bắt đầu. |
| `className` | `string` | `undefined` | Class CSS của thẻ wrapper. |
| `style` | `React.CSSProperties` | `undefined` | Inline style của thẻ wrapper. |
