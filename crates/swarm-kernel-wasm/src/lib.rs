#![no_std]

use core::panic::PanicInfo;
use core::ptr::addr_of_mut;

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {}
}

pub const MAX_CURSORS: usize = 256;
pub const STRIDE: usize = 16;
pub const GRID_CELLS: usize = 256; // Power of 2 for fast bitwise & mask
pub const CELL_SIZE: f32 = 96.0;

static mut CURSOR_DATA: [f32; MAX_CURSORS * STRIDE] = [0.0; MAX_CURSORS * STRIDE];
static mut CELL_HEAD: [i32; GRID_CELLS] = [-1; GRID_CELLS];
static mut BOID_NEXT: [i32; MAX_CURSORS] = [-1; MAX_CURSORS];
static mut PROJ_MAT: [f32; 16] = [0.0; 16];
static mut PTS_3D: [f32; 1024 * 3] = [0.0; 1024 * 3];
static mut PTS_2D: [f32; 1024 * 2] = [0.0; 1024 * 2];

#[no_mangle]
pub extern "C" fn get_cursor_buffer_ptr() -> *mut f32 {
    unsafe { addr_of_mut!(CURSOR_DATA).cast::<f32>() }
}

#[no_mangle]
pub extern "C" fn get_proj_mat_ptr() -> *mut f32 {
    unsafe { addr_of_mut!(PROJ_MAT).cast::<f32>() }
}

#[no_mangle]
pub extern "C" fn get_pts_3d_ptr() -> *mut f32 {
    unsafe { addr_of_mut!(PTS_3D).cast::<f32>() }
}

#[no_mangle]
pub extern "C" fn get_pts_2d_ptr() -> *mut f32 {
    unsafe { addr_of_mut!(PTS_2D).cast::<f32>() }
}

#[inline(always)]
fn fast_sqrt(x: f32) -> f32 {
    if x <= 0.0 {
        return 0.0;
    }
    let mut i = x.to_bits();
    i = 0x5f3759df - (i >> 1);
    let y = f32::from_bits(i);
    let y = y * (1.5 - 0.5 * x * y * y);
    x * y * (1.5 - 0.5 * x * y * y)
}

#[inline(always)]
fn hash_cell(cx: i32, cy: i32) -> usize {
    let h = (cx.wrapping_mul(73856093)) ^ (cy.wrapping_mul(19349663));
    (h as usize) & (GRID_CELLS - 1)
}

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

        // 1. Insert cursors into O(N) spatial hash grid
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

        // 2. Evaluate local 3x3 neighborhood forces + vortex attraction
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
                                let inv_d = 1.0 / fast_sqrt(d2).max(1.0);
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

/// Projects `count` 3D points (x, y, z) through a 4x4 column-major ViewProjection matrix into 2D screen space
#[no_mangle]
pub extern "C" fn project_points_3d_batch(count: usize, vw: f32, vh: f32) {
    let n = if count > 1024 { 1024 } else { count };
    unsafe {
        let m = addr_of_mut!(PROJ_MAT).cast::<f32>();
        let p3_ptr = addr_of_mut!(PTS_3D).cast::<f32>();
        let p2_ptr = addr_of_mut!(PTS_2D).cast::<f32>();
        let half_w = vw * 0.5;
        let half_h = vh * 0.5;
        for i in 0..n {
            let p3 = i * 3;
            let p2 = i * 2;
            let x = *p3_ptr.add(p3);
            let y = *p3_ptr.add(p3 + 1);
            let z = *p3_ptr.add(p3 + 2);

            let clip_x = *m.add(0) * x + *m.add(4) * y + *m.add(8) * z + *m.add(12);
            let clip_y = *m.add(1) * x + *m.add(5) * y + *m.add(9) * z + *m.add(13);
            let clip_w = *m.add(3) * x + *m.add(7) * y + *m.add(11) * z + *m.add(15);
            let inv_w = if clip_w.abs() > 1e-6 { 1.0 / clip_w } else { 1.0 };

            let ndc_x = clip_x * inv_w;
            let ndc_y = clip_y * inv_w;

            *p2_ptr.add(p2) = (ndc_x + 1.0) * half_w;
            *p2_ptr.add(p2 + 1) = (1.0 - ndc_y) * half_h;
        }
    }
}
