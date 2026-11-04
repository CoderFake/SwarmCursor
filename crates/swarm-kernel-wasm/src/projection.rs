use core::ptr::addr_of_mut;
use crate::memory::{PROJ_MAT, PTS_2D, PTS_3D};

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
