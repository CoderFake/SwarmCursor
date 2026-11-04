# HTML Attributes (`data-swarm-*`) & CSS Variables

## 1. Bảng thuộc tính HTML `data-swarm-*`

Khi sử dụng `createSwarm({ mode: "dom" })`, `scanDeepDOM()`, hoặc `<SwarmProvider>`, bạn có thể gắn trực tiếp các thuộc tính sau lên bất kỳ thẻ HTML / SVG / Canvas nào:

| Thuộc tính | Giá trị hỗ trợ | Mô tả |
| :--- | :--- | :--- |
| `data-swarm` | `"rect" \| "text" \| "path" \| "3d"` | Khai báo công cụ chuột sẽ dùng để vẽ phần tử. |
| `data-swarm-id` | `string` | ID định danh duy nhất của phần tử (mặc định fallback về `el.id`). |
| `data-swarm-deps` | `"id1,id2"` | Danh sách ID phải hoàn thành (hoặc đạt ngưỡng `60%` với container cha) trước khi phần tử này được vẽ. |
| `data-swarm-deep` | `"true"` | Tự động quét đệ quy toàn bộ các phần tử DOM con (`h1..h6`, `p`, `span`, `button`, `input`, `svg/path`, `canvas`) bên trong container này và tạo cây DAG Cha $\rightarrow$ Con. |
| `data-swarm-3d` | `"extrude" \| "particles" \| "slice" \| "all"` | Đánh dấu thẻ `<canvas>` hoặc stage WebGL/Three.js là tác vụ 3D với chế độ hiệu ứng xây dựng tương ứng. |
| `data-swarm-squad` | `"2" .. "6"` | Số lượng con trỏ AI hợp tác đồng thời (Multi-Agent Work-Stealing Squad) trên phần tử 3D/container này. |
| `data-swarm-glb` | `string` | Đường dẫn tới model `.glb` / `.gltf` (nếu dùng bộ điều khiển GLB tự động). |
| `data-swarm-grow` | `"true"` | Với `data-swarm="text"`, gõ chữ nhỏ trước rồi bôi đen phóng to cỡ chữ. |
| `data-swarm-snap` | `"x" \| "y" \| "xy"` | Kéo thước căn lề đỏ từ Ruler trên/trái khớp vào cạnh phần tử. |
| `data-swarm-drawing` | `"true"` *(tự động)* | Được engine gắn lên thẻ HTML trong suốt quá trình đàn chuột đang vẽ. |
| `data-swarm-done` | `"true"` *(tự động)* | Được engine tự động gắn lên thẻ HTML ngay khi chuột vẽ xong. |

### Ví dụ HTML kết hợp Deep DOM & 3D Stage
```html
<h1 id="hero-title" data-swarm="text" data-swarm-grow="true" data-swarm-snap="x">
  SwarmCursor 2.0 Engine
</h1>

<article
  id="feature-box"
  data-swarm="rect"
  data-swarm-deep="true"
  data-swarm-deps="hero-title"
>
  <h2>Deep DOM Component</h2>
  <p>Các thẻ con bên trong sẽ tự động được đàn chuột chia nhau vẽ.</p>
  <button>Khám phá</button>
</article>

<div
  id="orb-stage"
  data-swarm="3d"
  data-swarm-3d="all"
  data-swarm-squad="4"
  data-swarm-deps="feature-box"
>
  <canvas id="three-canvas"></canvas>
</div>
```

---

## 2. Biến CSS tùy chỉnh (`CSS Custom Properties`)

Ghi đè trong `:root` để đồng bộ màu sắc với giao diện dự án của bạn:

```css
:root {
  --paper: #F8F9FA;               /* Màu nền canvas / sticky header */
  --ink: #121417;                 /* Màu chữ chính */
  --swarm-blue: #0D99FF;          /* Màu khung bounding box & badge kích thước Figma */
  --swarm-red: #F24822;           /* Màu đường gióng đỏ (Red Snap Guides) */
  --swarm-ruler-bg: #2c2c2c;      /* Màu nền thanh thước đo Ruler trên & trái */
  --swarm-ruler-border: #3a3a3a;  /* Màu viền thanh thước đo Ruler */
}
```

---

## 3. Danh sách 9 AI Agent Icons tích hợp sẵn (`AI_AGENT_ICONS`)

Bạn có thể import trực tiếp từ `swarm-cursor` hoặc truyền mảng `icons` vào `<SwarmAgentPill>`:

| Icon ID (`AgentIconId`) | Tên hiển thị | Màu nền Avatar (`avatarBg`) |
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
