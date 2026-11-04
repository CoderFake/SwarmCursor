# `<SwarmAgentPill>` (Bottom-Bar AI Agent Queue Pill)

`<SwarmAgentPill>` tái hiện thanh trạng thái đa tác tử kiểu Figma nằm ở bottom bar:
- Hiển thị **tối đa 5 icon tròn xếp chồng** (`margin-left: -8px`, viền trắng `2px`).
- Tự động lấy ngẫu nhiên từ **9 bộ icon AI** tích hợp sẵn (`claude`, `cohere`, `deepseek`, `gemini`, `grok`, `kimi`, `mistral`, `ollama`, `openai`).
- Liên tục đẩy icon mới từ **bên trái sang bên phải** như một hàng đợi (queue) các agent đang làm việc; icon thứ 6 ở ngoài cùng bên phải sẽ tự động rời khỏi hàng.
- Hiển thị số lượng agent theo định dạng mặc định **`{N} agents`** (ví dụ: `30 agents`, `36 agents`).

> **Nguyên tắc Opt-in**: Thanh `<SwarmAgentPill>` **chỉ hiển thị khi người dùng khai báo** (bằng cách đặt `<SwarmAgentPill />` trực tiếp hoặc truyền prop `agentPill` vào `<SwarmFollower>`, `<SwarmProvider>`, `<SwarmCanvas>`).

---

## Ví dụ sử dụng

### 1. Khai báo độc lập
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

### 2. Khai báo đi kèm `<SwarmFollower>` hoặc `<SwarmProvider>`
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

## Bảng Props

| Prop | Kiểu dữ liệu | Mặc định | Mô tả |
| :--- | :--- | :--- | :--- |
| `engine` | `SwarmEngine` | `undefined` | Nếu truyền `engine`, tự động đồng bộ số lượng `engine.cursors.length` và tốc độ `tempoMultiplier`. |
| `count` | `number` | `engine?.cursors.length ?? 36` | Số lượng hiển thị trong chuỗi `{N} agents`. |
| `maxIcons` | `number` | `5` | Số lượng icon tối đa trong hàng đợi (luôn được khóa ở mức `1..5`). |
| `intervalMs` | `number` | `650` | Chu kỳ (ms) đẩy 1 icon ngẫu nhiên mới vào đầu bên trái và dịch hàng đợi sang phải. |
| `icons` | `AgentIconId[]` | Tất cả 9 icon | Mảng lọc các icon AI muốn hiển thị (`"claude"`, `"cohere"`, `"deepseek"`, `"gemini"`, `"grok"`, `"kimi"`, `"mistral"`, `"ollama"`, `"openai"`). |
| `position` | `"bottom-center" \| "bottom-left" \| "bottom-right" \| "inline"` | `"bottom-center"` | Vị trí cố định ở bottom bar hoặc `"inline"` để đặt vào bất kỳ thanh bar nào của bạn. |
| `label` | `string \| ((count: number) => string)` | `` (n) => `${n} agents` `` | Tùy biến nội dung chữ bên phải hàng đợi icon. |
| `paused` | `boolean` | `false` | Tạm dừng chuyển động đẩy hàng đợi. |
