export interface WasmExports {
  memory: WebAssembly.Memory;
  get_cursor_buffer_ptr(): number;
  get_bezier_buffer_ptr(): number;
  get_proj_mat_ptr(): number;
  get_pts_3d_ptr(): number;
  get_pts_2d_ptr(): number;
  get_task_buffer_ptr(): number;
  get_auction_out_ptr(): number;
  get_mesh_base_ptr(): number;
  get_mesh_out_ptr(): number;
  step_boids_spatial_hash(
    dt: number,
    count: number,
    centerX: number,
    centerY: number,
    radiusScale: number
  ): void;
  step_bezier_paths_batch(dt: number, tempo: number, count: number): number;
  project_points_3d_batch(count: number, vw: number, vh: number): void;
  auction_tasks_batch(
    cursorCount: number,
    taskCount: number,
    viewTop: number,
    viewBot: number,
    frontierY: number
  ): void;
  deform_sculptural_mesh_batch(vertCount: number, t: number): void;
}

export interface WasmAuctionTaskInput {
  x: number;
  y: number;
  /** 0 = locked, 1 = ready, 2 = active, 3 = done */
  state: 0 | 1 | 2 | 3;
  activeWorkers: number;
  maxSquad: number;
  progress: number;
}

export interface WasmAuctionResult {
  taskIdx: number;
  role: "lead" | "assistant";
}

export function decodeBase64ToBytes(b64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(b64, "base64"));
  }
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}
