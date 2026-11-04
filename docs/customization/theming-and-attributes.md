# HTML Attributes (`data-swarm-*`) & CSS Variables

## 1. Bảng thuộc tính HTML `data-swarm-*`

Khi sử dụng `createSwarm({ mode: "dom" })` hoặc `<SwarmProvider>`, bạn có thể gắn trực tiếp các thuộc tính sau lên bất kỳ thẻ HTML nào:

| Thuộc tính | Giá trị hỗ trợ | Mô tả |
| :--- | :--- | :--- |
| `data-swarm` | `"rect" \| "text" \| "path"` | Khai báo công cụ chuột sẽ dùng để vẽ phần tử. |
| `data-swarm-id` | `string` | ID định danh duy nhất của phần tử (mặc định fallback về `el.id`). |
| `data-swarm-deps` | `"id1,id2"` | Danh sách ID phải hoàn thành trước khi phần tử này được vẽ. |
| `data-swarm-grow` | `"true"` | Với `data-swarm="text"`, gõ chữ nhỏ trước rồi bôi đen phóng to cỡ chữ. |
| `data-swarm-snap` | `"x" \| "y" \| "xy"` | Kéo thước căn lề đỏ từ Ruler trên/trái khớp vào cạnh phần tử. |
| `data-swarm-done` | `"true"` *(tự động)* | Được engine tự động gắn lên thẻ HTML ngay khi chuột vẽ xong. |

### Ví dụ HTML thuần
```html
<h1 id="hero-title" data-swarm="text" data-swarm-grow="true" data-swarm-snap="x">
  SwarmCursor Engine
</h1>

<div
  id="feature-box"
  data-swarm="rect"
  data-swarm-deps="hero-title"
  data-swarm-snap="y"
>
  Nội dung hộp tính năng
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
