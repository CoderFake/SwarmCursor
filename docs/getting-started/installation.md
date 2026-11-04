# Cài đặt & Thiết lập (`SwarmCursor`)

Repository chính thức: **[https://github.com/CoderFake/SwarmCursor](https://github.com/CoderFake/SwarmCursor)**

---

## 1. Cài đặt Package

### Từ GitHub Repository
```bash
npm install git+https://github.com/CoderFake/SwarmCursor.git
# hoặc pnpm / yarn
pnpm add git+https://github.com/CoderFake/SwarmCursor.git
```

### Từ thư mục Local (Monorepo / Workspace)
```bash
npm install file:../swarm-cursor
```

---

## 2. Import Stylesheet

Import file CSS một lần duy nhất ở điểm khởi đầu ứng dụng (`main.tsx`, `App.tsx`, hoặc `app/layout.tsx`):

```tsx
import "swarm-cursor/styles.css";
```

---

## 3. Tương thích SSR (Next.js App Router / Remix)

Tất cả các component trong `swarm-cursor/react` đều an toàn với SSR (`typeof window !== "undefined"`). Nếu sử dụng trong Next.js App Router, bạn chỉ cần đặt `"use client"` ở đầu component bọc hiệu ứng hoặc import trực tiếp `<SwarmFollower />` / `<SwarmProvider />`.
