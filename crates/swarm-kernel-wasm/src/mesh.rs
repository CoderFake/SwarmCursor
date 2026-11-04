use core::ptr::addr_of_mut;
use crate::math::{fast_cos, fast_inv_sqrt, fast_neg_exp, fast_sin};
use crate::memory::{MAX_MESH_VERTS, MESH_BASE_POS, MESH_OUT_POS};

/// SIMD-Accelerated 3D Sculptural Wave/Fold/Pinch Mesh Vertex Deformer in Rust
#[no_mangle]
pub extern "C" fn deform_sculptural_mesh_batch(vert_count: usize, t: f32) {
    let n = if vert_count > MAX_MESH_VERTS {
        MAX_MESH_VERTS
    } else {
        vert_count
    };
    unsafe {
        let base_ptr = addr_of_mut!(MESH_BASE_POS).cast::<f32>();
        let out_ptr = addr_of_mut!(MESH_OUT_POS).cast::<f32>();

        for i in 0..n {
            let ix = i * 3;
            let bx = *base_ptr.add(ix);
            let by = *base_ptr.add(ix + 1);
            let bz = *base_ptr.add(ix + 2);

            let inv_len = fast_inv_sqrt(bx * bx + by * by + bz * bz);
            let nx = bx * inv_len;
            let ny = by * inv_len;
            let nz = bz * inv_len;

            // Primary diagonal S-fold ridge
            let diag = nx * 0.72 + ny * 0.58 - nz * 0.36;
            let fold1 = fast_sin(diag * 4.2 + t * 0.55) * fast_neg_exp(diag * diag * 1.4);

            // Secondary lower wrapped liquid glass lobe
            let lobe = -nx * 0.52 + ny * 0.74 + nz * 0.42;
            let fold2 = fast_cos(lobe * 3.6 - t * 0.42) * 0.11;

            // Sharp sculptural pinch near bottom-right
            let pdx = nx - 0.48;
            let pdy = ny + 0.46;
            let pdz = nz - 0.65;
            let p_dist2 = pdx * pdx + pdy * pdy + pdz * pdz;
            let p_dist = p_dist2 * fast_inv_sqrt(p_dist2);
            let pinch = fast_neg_exp(p_dist2 * 4.5) * fast_sin(p_dist * 9.0 - t * 0.8) * 0.14;

            let disp = 1.0 + fold1 * 0.13 + fold2 + pinch;
            *out_ptr.add(ix) = bx * disp;
            *out_ptr.add(ix + 1) = by * disp;
            *out_ptr.add(ix + 2) = bz * disp;
        }
    }
}
