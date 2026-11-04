use core::ptr::addr_of_mut;
use crate::math::fast_sqrt;
use crate::memory::{AUCTION_OUT, CURSOR_DATA, MAX_CURSORS, MAX_TASKS, STRIDE, TASK_DATA, TASK_STRIDE};

/// Decentralized Multi-Cursor x Multi-Task Spatial Auction & Work-Stealing Matcher in Rust
#[no_mangle]
pub extern "C" fn auction_tasks_batch(
    cursor_count: usize,
    task_count: usize,
    view_top: f32,
    view_bot: f32,
    frontier_y: f32,
) {
    let nc = if cursor_count > MAX_CURSORS { MAX_CURSORS } else { cursor_count };
    let nt = if task_count > MAX_TASKS { MAX_TASKS } else { task_count };

    unsafe {
        let c_ptr = addr_of_mut!(CURSOR_DATA).cast::<f32>();
        let t_ptr = addr_of_mut!(TASK_DATA).cast::<f32>();
        let out_ptr = addr_of_mut!(AUCTION_OUT).cast::<i32>();

        for i in 0..nc {
            let out_base = i * 2;
            *out_ptr.add(out_base) = -1;
            *out_ptr.add(out_base + 1) = 0;

            let c_base = i * STRIDE;
            let cx = *c_ptr.add(c_base);
            let cy = *c_ptr.add(c_base + 1);

            let mut best_lead_idx: i32 = -1;
            let mut best_lead_score: f32 = 1e30;
            let mut best_assist_idx: i32 = -1;
            let mut best_assist_score: f32 = 1e30;

            for t in 0..nt {
                let t_base = t * TASK_STRIDE;
                let tx = *t_ptr.add(t_base);
                let ty = *t_ptr.add(t_base + 1);
                if ty > frontier_y {
                    continue;
                }
                let state = (*t_ptr.add(t_base + 2)) as i32;
                let workers = (*t_ptr.add(t_base + 3)) as i32;
                let max_squad = (*t_ptr.add(t_base + 4)) as i32;
                let progress = *t_ptr.add(t_base + 5);

                let in_vp = ty >= view_top - 60.0 && ty <= view_bot + 60.0;
                let penalty = if in_vp {
                    0.0
                } else if ty < view_top {
                    25000.0
                } else {
                    50000.0
                };
                let dx = tx - cx;
                let dy = ty - cy;
                let dist = fast_sqrt(dx * dx + dy * dy);

                if state == 1 && workers == 0 {
                    let score = penalty + dist * 0.45 + ty * 0.35;
                    if score < best_lead_score {
                        best_lead_score = score;
                        best_lead_idx = t as i32;
                    }
                } else if (state == 1 || state == 2)
                    && workers > 0
                    && workers < max_squad
                    && progress < 0.88
                {
                    let score = penalty + dist * 0.5 + (workers as f32) * 180.0;
                    if score < best_assist_score {
                        best_assist_score = score;
                        best_assist_idx = t as i32;
                    }
                }
            }

            if best_lead_idx >= 0 {
                let tb = (best_lead_idx as usize) * TASK_STRIDE;
                *t_ptr.add(tb + 2) = 2.0;
                *t_ptr.add(tb + 3) += 1.0;
                *out_ptr.add(out_base) = best_lead_idx;
                *out_ptr.add(out_base + 1) = 0;
            } else if best_assist_idx >= 0 {
                let tb = (best_assist_idx as usize) * TASK_STRIDE;
                *t_ptr.add(tb + 3) += 1.0;
                *out_ptr.add(out_base) = best_assist_idx;
                *out_ptr.add(out_base + 1) = 1;
            }
        }
    }
}
