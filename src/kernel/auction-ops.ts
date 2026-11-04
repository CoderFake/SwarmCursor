import type { Point2D } from "../core/types";
import { SOA_STRIDE } from "./soa-buffer";
import type {
  WasmAuctionResult,
  WasmAuctionTaskInput,
  WasmExports,
} from "./wasm-types";

const TASK_STRIDE = 8;
const MAX_WASM_TASKS = 1024;

export function runAuctionTasksBatch(
  wasm: WasmExports | null,
  cursorPositions: Point2D[],
  tasks: WasmAuctionTaskInput[],
  viewTop: number,
  viewBot: number,
  frontierY = 1e9
): Array<WasmAuctionResult | null> {
  const nc = Math.min(cursorPositions.length, 256);
  const nt = Math.min(tasks.length, MAX_WASM_TASKS);
  if (nc === 0 || nt === 0) return cursorPositions.map(() => null);

  if (wasm) {
    const cPtr = wasm.get_cursor_buffer_ptr();
    const tPtr = wasm.get_task_buffer_ptr();
    const outPtr = wasm.get_auction_out_ptr();
    const mem = wasm.memory.buffer;
    const cView = new Float32Array(mem, cPtr, nc * SOA_STRIDE);
    const tView = new Float32Array(mem, tPtr, nt * TASK_STRIDE);

    for (let i = 0; i < nc; i++) {
      cView[i * SOA_STRIDE] = cursorPositions[i].x;
      cView[i * SOA_STRIDE + 1] = cursorPositions[i].y;
    }
    for (let t = 0; t < nt; t++) {
      const tb = t * TASK_STRIDE;
      const item = tasks[t];
      tView[tb] = item.x;
      tView[tb + 1] = item.y;
      tView[tb + 2] = item.state;
      tView[tb + 3] = item.activeWorkers;
      tView[tb + 4] = item.maxSquad;
      tView[tb + 5] = item.progress;
      tView[tb + 6] = item.priority ?? 0;
      tView[tb + 7] = item.parentGroup ?? 0;
    }

    wasm.auction_tasks_batch(nc, nt, viewTop, viewBot, frontierY);
    const outView = new Int32Array(mem, outPtr, nc * 2);
    const results: Array<WasmAuctionResult | null> = [];
    for (let i = 0; i < nc; i++) {
      const taskIdx = outView[i * 2];
      const roleCode = outView[i * 2 + 1];
      if (taskIdx >= 0) {
        results.push({
          taskIdx,
          role: roleCode === 0 ? "lead" : "assistant",
        });
      } else {
        results.push(null);
      }
    }
    return results;
  }

  return cursorPositions.map(() => null);
}
