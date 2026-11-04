# `<Swarm3D>` & `registerSwarm3D` (`swarm-cursor/three`)

**Bộ điêu khắc 3D / Three.js / GLB (`extrude` · `particles` · `slice`) với Đội nhóm Đa Tác Tử (Multi-Agent Squads).**

---

## 1. Ba Thuật toán Điêu khắc 3D (`buildMode`)

- **`extrude` (3D Gizmo Sculpt & Wireframe Extrusion)**: Con trỏ trưởng nhóm (Lead Cursor) kéo trục tọa độ 3D Gizmo `X / Y / Z` để dựng lồng khung dây (Wireframe Bounding Cage), chiếu trực tiếp đỉnh 3D sang màn hình 2D (`projectPoints3DBatch`).
- **`particles` (Mesh Surface Area CDF Sampling + GPU Particle Swarm)**: Lấy mẫu bề mặt lưới tam giác theo diện tích tích lũy trong $O(\log M)$ (`CumulativeAreaSampler`) và hội tụ hàng nghìn hạt phát sáng trên GPU (`PARTICLE_BUILD_VERTEX_SHADER`).
- **`slice` (Holographic 3D Printing / Laser Clipping Plane)**: Đội Assistant Cursors quét mặt phẳng cắt laser (`THREE.Plane` + `HOLOGRAPHIC_SLICE_FRAGMENT_CHUNK`) từ đáy lên đỉnh để lộ vật liệu PBR / Liquid Glass hoàn chỉnh.
- **`all` (Multi-Phase Pipeline)**: Kết hợp tuần tự cả 3 pha `extrude` $\rightarrow$ `particles` $\rightarrow$ `slice`.

---

## 2. Sử dụng với React Component (`<Swarm3D>`)

```tsx
import { Swarm3D } from "swarm-cursor/react";

<Swarm3D
  id="crystal-orb-3d"
  src="/models/crystal-orb.glb"
  buildMode="all"
  squadSize={4}
  deps={["r:hero-card"]}
  className="w-96 h-96"
>
  <canvas />
</Swarm3D>
```

---

## 3. Tích hợp với Scene Three.js / WebGL có sẵn (`registerSwarm3D`)

```tsx
import {
  registerSwarm3D,
  CumulativeAreaSampler,
  PARTICLE_BUILD_VERTEX_SHADER,
  PARTICLE_BUILD_FRAGMENT_SHADER,
} from "swarm-cursor/three";
import { wasmKernel } from "swarm-cursor/kernel";

const sampler = new CumulativeAreaSampler(positionsFloat32, indicesUint32);
const { targets, seeds } = sampler.sampleBatch(3200);

const unregister = registerSwarm3D("crystal-orb-3d", {
  buildMode: "all",
  squadSize: 4,
  boundingBox: { min: [-2.1, -2.1, -2.1], max: [2.1, 2.1, 2.1] },
  onProgress: (progress, weights) => {
    wireframeCage.material.opacity = weights.extrude * 0.65;
    particleMat.uniforms.uBuildProgress.value = Math.max(weights.particles, progress);
    slicePlane.constant = -2.3 + weights.slice * 4.7;
  },
});
```
