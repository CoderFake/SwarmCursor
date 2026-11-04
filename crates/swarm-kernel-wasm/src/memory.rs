use core::ptr::addr_of_mut;
use crate::math::GRID_CELLS;

pub const MAX_CURSORS: usize = 256;
pub const STRIDE: usize = 16;
pub const CELL_SIZE: f32 = 96.0;
pub const MAX_TASKS: usize = 512;
pub const TASK_STRIDE: usize = 8;
pub const MAX_MESH_VERTS: usize = 16384;

pub static mut CURSOR_DATA: [f32; MAX_CURSORS * STRIDE] = [0.0; MAX_CURSORS * STRIDE];
pub static mut BEZIER_DATA: [f32; MAX_CURSORS * 12] = [0.0; MAX_CURSORS * 12];
pub static mut CELL_HEAD: [i32; GRID_CELLS] = [-1; GRID_CELLS];
pub static mut BOID_NEXT: [i32; MAX_CURSORS] = [-1; MAX_CURSORS];
pub static mut PROJ_MAT: [f32; 16] = [0.0; 16];
pub static mut PTS_3D: [f32; 1024 * 3] = [0.0; 1024 * 3];
pub static mut PTS_2D: [f32; 1024 * 2] = [0.0; 1024 * 2];
pub static mut TASK_DATA: [f32; MAX_TASKS * TASK_STRIDE] = [0.0; MAX_TASKS * TASK_STRIDE];
pub static mut AUCTION_OUT: [i32; MAX_CURSORS * 2] = [-1; MAX_CURSORS * 2];
pub static mut MESH_BASE_POS: [f32; MAX_MESH_VERTS * 3] = [0.0; MAX_MESH_VERTS * 3];
pub static mut MESH_OUT_POS: [f32; MAX_MESH_VERTS * 3] = [0.0; MAX_MESH_VERTS * 3];

#[no_mangle]
pub extern "C" fn get_cursor_buffer_ptr() -> *mut f32 {
    addr_of_mut!(CURSOR_DATA).cast::<f32>()
}

#[no_mangle]
pub extern "C" fn get_bezier_buffer_ptr() -> *mut f32 {
    addr_of_mut!(BEZIER_DATA).cast::<f32>()
}

#[no_mangle]
pub extern "C" fn get_proj_mat_ptr() -> *mut f32 {
    addr_of_mut!(PROJ_MAT).cast::<f32>()
}

#[no_mangle]
pub extern "C" fn get_pts_3d_ptr() -> *mut f32 {
    addr_of_mut!(PTS_3D).cast::<f32>()
}

#[no_mangle]
pub extern "C" fn get_pts_2d_ptr() -> *mut f32 {
    addr_of_mut!(PTS_2D).cast::<f32>()
}

#[no_mangle]
pub extern "C" fn get_task_buffer_ptr() -> *mut f32 {
    addr_of_mut!(TASK_DATA).cast::<f32>()
}

#[no_mangle]
pub extern "C" fn get_auction_out_ptr() -> *mut i32 {
    addr_of_mut!(AUCTION_OUT).cast::<i32>()
}

#[no_mangle]
pub extern "C" fn get_mesh_base_ptr() -> *mut f32 {
    addr_of_mut!(MESH_BASE_POS).cast::<f32>()
}

#[no_mangle]
pub extern "C" fn get_mesh_out_ptr() -> *mut f32 {
    addr_of_mut!(MESH_OUT_POS).cast::<f32>()
}
