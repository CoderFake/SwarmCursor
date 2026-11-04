/**
 * High-Performance Cumulative Area Prefix-Sum (CDF) Triangle Surface Sampler.
 * Pre-computes triangle areas in O(M) and samples uniform surface points in O(log M)
 * via binary search, avoiding CPU main-thread bottlenecks on dense GLB/Three.js meshes.
 */
export class CumulativeAreaSampler {
  public readonly triangleCount: number;
  private readonly positions: Float32Array;
  private readonly cdf: Float32Array;
  private readonly totalArea: number;

  constructor(positions: Float32Array, indices?: Uint16Array | Uint32Array) {
    if (indices && indices.length >= 3) {
      const triCount = Math.floor(indices.length / 3);
      const expanded = new Float32Array(triCount * 9);
      for (let t = 0; t < triCount; t++) {
        const i0 = indices[t * 3] * 3;
        const i1 = indices[t * 3 + 1] * 3;
        const i2 = indices[t * 3 + 2] * 3;
        const dst = t * 9;
        expanded[dst + 0] = positions[i0];
        expanded[dst + 1] = positions[i0 + 1];
        expanded[dst + 2] = positions[i0 + 2];
        expanded[dst + 3] = positions[i1];
        expanded[dst + 4] = positions[i1 + 1];
        expanded[dst + 5] = positions[i1 + 2];
        expanded[dst + 6] = positions[i2];
        expanded[dst + 7] = positions[i2 + 1];
        expanded[dst + 8] = positions[i2 + 2];
      }
      this.positions = expanded;
    } else {
      this.positions = positions;
    }

    this.triangleCount = Math.floor(this.positions.length / 9);
    this.cdf = new Float32Array(this.triangleCount);

    let accum = 0;
    const p = this.positions;
    for (let t = 0; t < this.triangleCount; t++) {
      const b = t * 9;
      const ax = p[b + 0];
      const ay = p[b + 1];
      const az = p[b + 2];
      const bx = p[b + 3] - ax;
      const by = p[b + 4] - ay;
      const bz = p[b + 5] - az;
      const cx = p[b + 6] - ax;
      const cy = p[b + 7] - ay;
      const cz = p[b + 8] - az;

      const crossX = by * cz - bz * cy;
      const crossY = bz * cx - bx * cz;
      const crossZ = bx * cy - by * cx;
      const area = 0.5 * Math.hypot(crossX, crossY, crossZ);
      accum += Math.max(1e-7, area);
      this.cdf[t] = accum;
    }
    this.totalArea = Math.max(1e-7, accum);
  }

  private pickTriangleIndex(u: number): number {
    if (this.triangleCount <= 1) return 0;
    const target = u * this.totalArea;
    let lo = 0;
    let hi = this.triangleCount - 1;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.cdf[mid] < target) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  }

  public sampleBatch(count: number): {
    targets: Float32Array;
    sources: Float32Array;
    delays: Float32Array;
  } {
    const targets = new Float32Array(count * 3);
    const sources = new Float32Array(count * 3);
    const delays = new Float32Array(count);
    const p = this.positions;

    for (let i = 0; i < count; i++) {
      const out = i * 3;
      if (this.triangleCount === 0) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 1.4;
        targets[out] = r * Math.sin(phi) * Math.cos(theta);
        targets[out + 1] = r * Math.cos(phi);
        targets[out + 2] = r * Math.sin(phi) * Math.sin(theta);
      } else {
        const triIdx = this.pickTriangleIndex(Math.random());
        const b = triIdx * 9;
        let r1 = Math.random();
        let r2 = Math.random();
        if (r1 + r2 > 1) {
          r1 = 1 - r1;
          r2 = 1 - r2;
        }
        const r0 = 1 - r1 - r2;
        targets[out + 0] =
          r0 * p[b + 0] + r1 * p[b + 3] + r2 * p[b + 6];
        targets[out + 1] =
          r0 * p[b + 1] + r1 * p[b + 4] + r2 * p[b + 7];
        targets[out + 2] =
          r0 * p[b + 2] + r1 * p[b + 5] + r2 * p[b + 8];
      }

      // Source scatter field around cursor perimeter ring
      const angle = (i / Math.max(1, count)) * Math.PI * 8 + Math.random() * 0.5;
      const spread = 2.2 + Math.random() * 1.4;
      sources[out + 0] = Math.cos(angle) * spread;
      sources[out + 1] = (Math.random() - 0.5) * 3.2;
      sources[out + 2] = Math.sin(angle) * spread;

      // Normalized bottom-to-top + stochastic stagger delay (0..1)
      const normY = Math.max(0, Math.min(1, (targets[out + 1] + 1.6) / 3.2));
      delays[i] = normY * 0.65 + Math.random() * 0.35;
    }

    return { targets, sources, delays };
  }
}
