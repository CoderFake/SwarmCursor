import type { WasmExports } from "./wasm-types";

export function runProjectPoints3DBatch(
  wasm: WasmExports | null,
  matrix16: Float32Array,
  points3D: Float32Array,
  out2D: Float32Array,
  vw: number,
  vh: number
): void {
  const count = Math.min(
    Math.floor(points3D.length / 3),
    Math.floor(out2D.length / 2),
    1024
  );
  if (count <= 0) return;

  if (wasm) {
    const matPtr = wasm.get_proj_mat_ptr();
    const p3Ptr = wasm.get_pts_3d_ptr();
    const p2Ptr = wasm.get_pts_2d_ptr();
    const buf = wasm.memory.buffer;

    new Float32Array(buf, matPtr, 16).set(matrix16.subarray(0, 16));
    new Float32Array(buf, p3Ptr, count * 3).set(
      points3D.subarray(0, count * 3)
    );
    wasm.project_points_3d_batch(count, vw, vh);
    out2D.set(new Float32Array(buf, p2Ptr, count * 2));
    return;
  }

  const halfW = vw * 0.5;
  const halfH = vh * 0.5;
  for (let i = 0; i < count; i++) {
    const p3 = i * 3;
    const p2 = i * 2;
    const x = points3D[p3];
    const y = points3D[p3 + 1];
    const z = points3D[p3 + 2];

    const clipX =
      matrix16[0] * x + matrix16[4] * y + matrix16[8] * z + matrix16[12];
    const clipY =
      matrix16[1] * x + matrix16[5] * y + matrix16[9] * z + matrix16[13];
    const clipW =
      matrix16[3] * x + matrix16[7] * y + matrix16[11] * z + matrix16[15];
    const invW = Math.abs(clipW) > 1e-6 ? 1.0 / clipW : 1.0;

    const ndcX = clipX * invW;
    const ndcY = clipY * invW;
    out2D[p2] = (ndcX + 1.0) * halfW;
    out2D[p2 + 1] = (1.0 - ndcY) * halfH;
  }
}
