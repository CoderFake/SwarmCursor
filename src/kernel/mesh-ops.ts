import type { WasmExports } from "./wasm-types";

const MAX_MESH_VERTS = 16384;

export function runDeformSculpturalMeshBatch(
  wasm: WasmExports | null,
  uploadedMeshRef: { current: Float32Array | null },
  basePositions: Float32Array,
  outPositions: Float32Array,
  time: number
): void {
  const vertCount = Math.min(
    Math.floor(basePositions.length / 3),
    Math.floor(outPositions.length / 3),
    MAX_MESH_VERTS
  );
  if (vertCount <= 0) return;

  if (wasm) {
    const basePtr = wasm.get_mesh_base_ptr();
    const outPtr = wasm.get_mesh_out_ptr();
    const mem = wasm.memory.buffer;
    const len = vertCount * 3;

    if (uploadedMeshRef.current !== basePositions) {
      new Float32Array(mem, basePtr, len).set(basePositions.subarray(0, len));
      uploadedMeshRef.current = basePositions;
    }

    wasm.deform_sculptural_mesh_batch(vertCount, time);
    outPositions.set(new Float32Array(mem, outPtr, len));
    return;
  }

  for (let i = 0; i < vertCount; i++) {
    const ix = i * 3;
    const bx = basePositions[ix];
    const by = basePositions[ix + 1];
    const bz = basePositions[ix + 2];
    const len = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
    const nx = bx / len;
    const ny = by / len;
    const nz = bz / len;
    const diag = nx * 0.72 + ny * 0.58 - nz * 0.36;
    const fold1 =
      Math.sin(diag * 4.2 + time * 0.55) * Math.exp(-diag * diag * 1.4);
    const lobe = -nx * 0.52 + ny * 0.74 + nz * 0.42;
    const fold2 = Math.cos(lobe * 3.6 - time * 0.42) * 0.11;
    const pinchDist = Math.hypot(nx - 0.48, ny + 0.46, nz - 0.65);
    const pinch =
      Math.exp(-pinchDist * pinchDist * 4.5) *
      Math.sin(pinchDist * 9.0 - time * 0.8) *
      0.14;
    const disp = 1.0 + fold1 * 0.13 + fold2 + pinch;
    outPositions[ix] = bx * disp;
    outPositions[ix + 1] = by * disp;
    outPositions[ix + 2] = bz * disp;
  }
}
