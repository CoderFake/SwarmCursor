#![no_std]

use core::panic::PanicInfo;

pub mod auction;
pub mod bezier;
pub mod boids;
pub mod math;
pub mod memory;
pub mod mesh;
pub mod projection;

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {}
}

pub use auction::*;
pub use bezier::*;
pub use boids::*;
pub use memory::*;
pub use mesh::*;
pub use projection::*;
