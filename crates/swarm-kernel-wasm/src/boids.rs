use core::ptr::addr_of_mut;
use crate::math::{fast_inv_sqrt, fast_sqrt, hash_cell, GRID_CELLS};
use crate::memory::{BOID_NEXT, CELL_HEAD, CELL_SIZE, CURSOR_DATA, MAX_CURSORS, STRIDE};

/// Steps O(N) Uniform Spatial Hash Grid Boids & Vortex Orbit in-place on CURSOR_DATA
#[no_mangle]
pub extern "C" fn step_boids_spatial_hash(
    dt: f32,
    count: usize,
    center_x: f32,
    center_y: f32,
    radius_scale: f32,
) {
    let n = if count > MAX_CURSORS { MAX_CURSORS } else { count };
    if n == 0 {
        return;
    }

    unsafe {
        let cell_head_ptr = addr_of_mut!(CELL_HEAD).cast::<i32>();
        let boid_next_ptr = addr_of_mut!(BOID_NEXT).cast::<i32>();
        let data_ptr = addr_of_mut!(CURSOR_DATA).cast::<f32>();

        for idx in 0..GRID_CELLS {
            *cell_head_ptr.add(idx) = -1;
        }

        for i in 0..n {
            let base = i * STRIDE;
            let x = *data_ptr.add(base);
            let y = *data_ptr.add(base + 1);
            let cx = (x / CELL_SIZE) as i32;
            let cy = (y / CELL_SIZE) as i32;
            let h = hash_cell(cx, cy);
            *boid_next_ptr.add(i) = *cell_head_ptr.add(h);
            *cell_head_ptr.add(h) = i as i32;
        }

        for i in 0..n {
            let base = i * STRIDE;
            let x = *data_ptr.add(base);
            let y = *data_ptr.add(base + 1);
            let mut vx = *data_ptr.add(base + 2);
            let mut vy = *data_ptr.add(base + 3);
            let max_speed = (*data_ptr.add(base + 5)).max(120.0);
            let max_force = (*data_ptr.add(base + 6)).max(300.0);
            let orbit = (*data_ptr.add(base + 7)).max(45.0) * radius_scale;
            let curl = if *data_ptr.add(base + 9) >= 0.0 { 1.0 } else { -1.0 };

            let cx = (x / CELL_SIZE) as i32;
            let cy = (y / CELL_SIZE) as i32;

            let mut sep_x = 0.0f32;
            let mut sep_y = 0.0f32;
            let mut ali_x = 0.0f32;
            let mut ali_y = 0.0f32;
            let mut neighbors = 0usize;

            for dy in -1..=1 {
                for dx in -1..=1 {
                    let h = hash_cell(cx + dx, cy + dy);
                    let mut j = *cell_head_ptr.add(h);
                    while j >= 0 {
                        let ju = j as usize;
                        if ju != i {
                            let jbase = ju * STRIDE;
                            let ox = x - *data_ptr.add(jbase);
                            let oy = y - *data_ptr.add(jbase + 1);
                            let d2 = ox * ox + oy * oy;
                            if d2 > 0.001 && d2 < 3600.0 {
                                let inv_d = fast_inv_sqrt(d2).min(1.0);
                                sep_x += ox * inv_d * inv_d * 420.0;
                                sep_y += oy * inv_d * inv_d * 420.0;
                                ali_x += *data_ptr.add(jbase + 2);
                                ali_y += *data_ptr.add(jbase + 3);
                                neighbors += 1;
                            }
                        }
                        j = *boid_next_ptr.add(ju);
                    }
                }
            }

            let to_cx = center_x - x;
            let to_cy = center_y - y;
            let dist_c = fast_sqrt(to_cx * to_cx + to_cy * to_cy).max(1.0);
            let dir_x = to_cx / dist_c;
            let dir_y = to_cy / dist_c;
            let tan_x = -dir_y * curl;
            let tan_y = dir_x * curl;

            let radial_err = dist_c - orbit;
            let mut ax = dir_x * (radial_err * 6.5) + tan_x * (max_speed * 0.85) + sep_x;
            let mut ay = dir_y * (radial_err * 6.5) + tan_y * (max_speed * 0.85) + sep_y;

            if neighbors > 0 {
                let inv_n = 1.0 / (neighbors as f32);
                ax += (ali_x * inv_n - vx) * 1.4;
                ay += (ali_y * inv_n - vy) * 1.4;
            }

            let a_mag = fast_sqrt(ax * ax + ay * ay);
            if a_mag > max_force {
                let s = max_force / a_mag;
                ax *= s;
                ay *= s;
            }

            vx = (vx + ax * dt) * 0.96;
            vy = (vy + ay * dt) * 0.96;
            let v_mag = fast_sqrt(vx * vx + vy * vy);
            if v_mag > max_speed {
                let s = max_speed / v_mag;
                vx *= s;
                vy *= s;
            }

            *data_ptr.add(base) = x + vx * dt;
            *data_ptr.add(base + 1) = y + vy * dt;
            *data_ptr.add(base + 2) = vx;
            *data_ptr.add(base + 3) = vy;
        }
    }
}
