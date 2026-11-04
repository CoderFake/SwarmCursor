# `<SwarmProvider>`, `<SwarmElement>`, `<Swarm3D>` & `<SwarmImage>` (DOM-Driven, 3D & Image Build Mode)

Chế độ **DOM-Driven** cho phép bạn giữ nguyên cấu trúc HTML/React/Tailwind, ảnh 2D và các canvas Three.js/WebGL của dự án. Khi người dùng kéo trang (hoặc khi trang tự động cuộn), `<SwarmProvider>` tự động quét tọa độ các `<SwarmElement>`, `<Swarm3D>`, `<SwarmImage>`, hoặc đệ quy vào toàn bộ DOM con bên trong component (`deepScan={true}`) và điều phối đàn chuột AI bay tới thực hiện thao tác vẽ tương ứng trước khi làm hiện phần tử thật.

---

## Ví dụ sử dụng kết hợp 2D + Deep DOM + 3D/GLB

```tsx
import {
  SwarmProvider,
  SwarmElement,
  Swarm3D,
  SwarmControls,
} from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function PortfolioSection() {
  return (
    <SwarmProvider
      scrollMode="hybrid"
      autoScrollSpeed={180}
      deepScan={true}
      useFastRenderers={true}
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

        {/* 2. Container tự động quét đệ quy các thẻ h3, p, button, svg bên trong */}
        <div
          id="card-1"
          data-swarm="rect"
          data-swarm-deep="true"
          data-swarm-deps="t:title"
          className="p-8 rounded-2xl border bg-white shadow-sm"
        >
          <h3>Interactive Multi-Agent Systems</h3>
          <p>Child headings, paragraphs, buttons and SVGs are built automatically.</p>
          <button type="button">Launch Demo</button>
        </div>

        {/* 3. Khối 3D / GLB được đội 4 chuột AI điêu khắc (extrude -> particles -> slice) */}
        <Swarm3D
          id="orb-3d"
          src="/models/orb.glb"
          buildMode="all"
          squadSize={4}
          deps={["r:card-1"]}
          className="w-80 h-80"
        >
          <canvas />
        </Swarm3D>
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
| `deepScan` | `boolean` | `false` | Bật `scanDeepDOM` để tự động quét đệ quy các thẻ con bên trong component và nối DAG Cha $\rightarrow$ Con. |
| `useFastRenderers` | `boolean` | `true` | Sử dụng bộ render Zero-React-Tick (`FastCursorLayerController` + `FastOverlayCanvasController`) 60fps. |
| `controls` | `boolean` | `false` | Hiển thị thanh điều khiển nổi mặc định. |
| `showCursorLabels` | `boolean` | `false` | Hiển thị nhãn tên Agent cạnh mỗi con trỏ. |
| `designWidth` | `number` | `1280` | Chiều rộng tham chiếu của khung thiết kế. |
| `agentPill` | `boolean \| Omit<SwarmAgentPillProps, "engine">` | `false` | **Chỉ hiện khi khai báo.** Hiển thị thanh Bottom-Bar Queue tối đa 5 icon AI + `{N} agents`. |

---

## Props của `<Swarm3D>` & Hook `useSwarm3D`

| Prop | Kiểu dữ liệu | Mặc định | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `string` *(bắt buộc)* | — | ID duy nhất của phần tử 3D (task ID trong DAG sẽ là `3d:${id}`). |
| `src` | `string` | `undefined` | Đường dẫn file `.glb` / `.gltf` (tùy chọn). |
| `buildMode` | `"extrude" \| "particles" \| "slice" \| "all"` | `"all"` | Thuật toán hiệu ứng xây dựng 3D (`all` chạy tuần tự chồng lắp cả 3 giai đoạn). |
| `squadSize` | `number` | `4` | Số lượng con trỏ AI hợp tác cùng lúc trên vật thể 3D này (`1` Lead + `N-1` Assistants). |
| `deps` | `string[]` | `undefined` | Danh sách task ID phải thỏa mãn trước khi bắt đầu dựng khối 3D. |
| `onProgress` | `(progress: number, weights: Phase3DWeights) => void` | `undefined` | Callback nhận tiến độ `0..1` và trọng số từng pha `{ extrude, particles, slice }` mỗi frame. |

---

## Props của `<SwarmImage>` (Hiệu ứng Xây dựng Hình ảnh 2D)

Hỗ trợ **3 thuật toán xây dựng hình ảnh** (`mosaic`, `scanline`, `halftone`) hoặc kết hợp cả 3 qua `buildMode="all"`:

| Prop | Kiểu dữ liệu | Mặc định | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `string` *(bắt buộc)* | — | ID duy nhất của ảnh (task ID trong DAG sẽ là `img:${id}`). |
| `src` | `string` *(bắt buộc)* | — | Đường dẫn URL của ảnh. |
| `alt` | `string` | `""` | Văn bản thay thế cho thẻ `<img>`. |
| `buildMode` | `"mosaic" \| "scanline" \| "halftone" \| "all"` | `"all"` | **`"mosaic"`**: Phân giải lũy tiến từ khối ô vuông thô (`32px -> 16px -> 8px -> 4px -> 1px`) như Quadtree/Progressive JPEG.<br>**`"scanline"`**: Tia laser ngang quét từ đỉnh xuống đáy ảnh kèm lưới blueprint.<br>**`"halftone"`**: Ma trận chấm bi in lụa tăng dần bán kính và độ tương phản.<br>**`"all"`**: Chuỗi hóa cả 3 pha (`mosaic` $\rightarrow$ `halftone` $\rightarrow$ `scanline`). |
| `deps` | `string[]` | `undefined` | Danh sách task ID phải thỏa mãn trước khi bắt đầu dựng ảnh. |

```tsx
import { SwarmImage } from "swarm-cursor/react";

<SwarmImage
  id="architecture-diagram"
  src="/images/diagram.webp"
  buildMode="mosaic"
  deps={["r:card-1"]}
  className="w-full h-64 rounded-2xl"
/>
```

---

## Props của `<SwarmElement>`

| Prop | Kiểu dữ liệu | Mặc định | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `string` *(bắt buộc)* | — | ID duy nhất của phần tử để các phần tử khác tham chiếu trong `deps`. |
| `tool` | `"rect" \| "text" \| "path"` | `"rect"` | Công cụ Figma mà chuột AI sẽ dùng để vẽ phần tử này. |
| `grow` | `boolean` | `false` | Chỉ áp dụng cho `tool="text"`: gõ chữ cỡ nhỏ trước, bôi đen toàn bộ rồi kéo giãn lên cỡ chữ thật. |
| `snapAxis` | `"x" \| "y" \| "xy"` | `undefined` | Cử thêm 1 chuột AI kéo đường gióng đỏ (Red Guide) từ thanh Ruler trên/trái khớp vào cạnh phần tử. |
| `deps` | `string[]` | `undefined` | Danh sách `id` phải vẽ xong trước khi phần tử này được phép bắt đầu. |
