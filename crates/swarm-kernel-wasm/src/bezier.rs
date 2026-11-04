use core::ptr::addr_of_mut;
use crate::memory::{BEZIER_DATA, CURSOR_DATA, MAX_CURSORS, STRIDE};

/// Parallel Batch Cubic Bezier Cursor Path Evaluator + Tilt Angle Integrator
#[no_mangle]
pub extern "C" fn step_bezier_paths_batch(dt: f32, tempo: f32, count: usize) -> usize {
    let n = if count > MAX_CURSORS { MAX_CURSORS } else { count };
    let mut active_remaining = 0usize;

    unsafe {
        let c_ptr = addr_of_mut!(CURSOR_DATA).cast::<f32>();
        let b_ptr = addr_of_mut!(BEZIER_DATA).cast::<f32>();

        for i in 0..n {
            let b_base = i * 12;
            let active = *b_ptr.add(b_base);
            if active < 0.5 {
                continue;
            }

            let c_base = i * STRIDE;
            let mut u = *b_ptr.add(b_base + 1);
            let dur = (*b_ptr.add(b_base + 2)).max(0.001);
            let speed_mult = *b_ptr.add(b_base + 3);

            u += (dt * tempo * speed_mult) / dur;
            if u >= 1.0 {
                u = 1.0;
                *b_ptr.add(b_base) = 0.0;
            } else {
                active_remaining += 1;
            }
            *b_ptr.add(b_base + 1) = u;

            let e = if u < 0.5 {
                4.0 * u * u * u
            } else {
                let k = -2.0 * u + 2.0;
                1.0 - (k * k * k) * 0.5
            };

            let inv = 1.0 - e;
            let b0 = inv * inv * inv;
            let b1 = 3.0 * inv * inv * e;
            let b2 = 3.0 * inv * e * e;
            let b3 = e * e * e;

            let p0x = *b_ptr.add(b_base + 4);
            let p0y = *b_ptr.add(b_base + 5);
            let p1x = *b_ptr.add(b_base + 6);
            let p1y = *b_ptr.add(b_base + 7);
            let p2x = *b_ptr.add(b_base + 8);
            let p2y = *b_ptr.add(b_base + 9);
            let p3x = *b_ptr.add(b_base + 10);
            let p3y = *b_ptr.add(b_base + 11);

            let prev_x = *c_ptr.add(c_base);
            let prev_y = *c_ptr.add(c_base + 1);

            let nx = b0 * p0x + b1 * p1x + b2 * p2x + b3 * p3x;
            let ny = b0 * p0y + b1 * p1y + b2 * p2y + b3 * p3y;

            let vx = (nx - prev_x) / dt.max(0.001);
            let vy = (ny - prev_y) / dt.max(0.001);

            *c_ptr.add(c_base) = nx;
            *c_ptr.add(c_base + 1) = ny;
            *c_ptr.add(c_base + 2) = vx;
            *c_ptr.add(c_base + 3) = vy;
            *c_ptr.add(c_base + 10) = (vx * 0.018).clamp(-14.0, 14.0);
        }
    }

    active_remaining
}
