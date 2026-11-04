pub const GRID_CELLS: usize = 256; // Power of 2 for bitwise mask

#[inline(always)]
pub fn fast_inv_sqrt(x: f32) -> f32 {
    if x <= 1e-8 {
        return 0.0;
    }
    let mut i = x.to_bits();
    i = 0x5f3759df - (i >> 1);
    let y = f32::from_bits(i);
    let y = y * (1.5 - 0.5 * x * y * y);
    y * (1.5 - 0.5 * x * y * y)
}

#[inline(always)]
pub fn fast_sqrt(x: f32) -> f32 {
    x * fast_inv_sqrt(x)
}

/// Fast branchless sine approximation on [-PI, PI] (max error < 0.001)
#[inline(always)]
pub fn fast_sin(mut x: f32) -> f32 {
    const PI: f32 = 3.14159265;
    const TWO_PI: f32 = 6.28318530;
    const INV_TWO_PI: f32 = 0.15915494;
    let k = (x * INV_TWO_PI) as i32;
    x -= (k as f32) * TWO_PI;
    if x > PI {
        x -= TWO_PI;
    } else if x < -PI {
        x += TWO_PI;
    }
    let y = x * (1.27323954 - 0.405284735 * x.abs());
    y * (0.775 + 0.225 * y.abs())
}

#[inline(always)]
pub fn fast_cos(x: f32) -> f32 {
    fast_sin(x + 1.57079632)
}

/// Fast exp(-x) for x >= 0 using rational Padé approximation
#[inline(always)]
pub fn fast_neg_exp(x: f32) -> f32 {
    if x <= 0.0 {
        return 1.0;
    }
    if x > 8.0 {
        return 0.0;
    }
    let d = 1.0 + x * (0.5 + x * (0.125 + x * 0.02083333));
    1.0 / (d * d)
}

#[inline(always)]
pub fn hash_cell(cx: i32, cy: i32) -> usize {
    let h = (cx.wrapping_mul(73856093)) ^ (cy.wrapping_mul(19349663));
    (h as usize) & (GRID_CELLS - 1)
}
