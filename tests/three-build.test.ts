import { describe, it, expect } from "vitest";
import {
  CumulativeAreaSampler,
  compute3DPhaseWeights,
  registerSwarm3D,
  getSwarm3DHandle,
  PARTICLE_BUILD_VERTEX_SHADER,
  PARTICLE_BUILD_FRAGMENT_SHADER,
} from "../src/three";

describe("@swarm/three (CDF Surface Sampler, 3 Build Algorithms & 3D Bridge)", () => {
  it("samples uniform points across 3D mesh triangles in O(log M) using Cumulative Area Prefix-Sum", () => {
    const positions = new Float32Array([
      0, 0, 0,  2, 0, 0,  0, 2, 0,
      0, 0, 1,  4, 0, 1,  0, 4, 1,
    ]);
    const sampler = new CumulativeAreaSampler(positions);
    expect(sampler.triangleCount).toBe(2);
    const { targets, delays } = sampler.sampleBatch(500);
    expect(targets.length).toBe(500 * 3);
    expect(delays.length).toBe(500);
    expect(targets.every((v) => Number.isFinite(v))).toBe(true);
  });

  it("computes multi-pass weights for extrude, particles, slice, and combined 'all' mode", () => {
    expect(PARTICLE_BUILD_VERTEX_SHADER).toContain("aTargetPosition");
    expect(PARTICLE_BUILD_FRAGMENT_SHADER).toContain("gl_FragColor");

    const wStart = compute3DPhaseWeights("all", 0.1);
    expect(wStart.extrude).toBeGreaterThan(0);
    expect(wStart.slice).toBe(0);

    const wMid = compute3DPhaseWeights("all", 0.45);
    expect(wMid.extrude).toBe(1);
    expect(wMid.particles).toBeGreaterThan(0);

    const wEnd = compute3DPhaseWeights("all", 1.0);
    expect(wEnd.extrude).toBe(1);
    expect(wEnd.particles).toBe(1);
    expect(wEnd.slice).toBe(1);
  });

  it("registers a Three.js scene/object via registerSwarm3D and exposes 2D projected cursor anchors", () => {
    const container = document.createElement("div");
    Object.defineProperty(container, "getBoundingClientRect", {
      value: () => ({ left: 100, top: 50, width: 400, height: 400 }),
    });
    const handle = registerSwarm3D({
      id: "orb-3d",
      container,
      buildMode: "all",
      boundingBox: { min: [-1, -1, -1], max: [1, 1, 1] },
    });
    expect(getSwarm3DHandle("orb-3d")).toBe(handle);
    handle.setProgress(0.5);
    const anchors = handle.getScreenAnchors({ left: 0, scrollY: 0, s: 1 });
    expect(anchors.boxCorners.length).toBe(8);
    expect(anchors.laserLeft.x).toBeLessThan(anchors.laserRight.x);
    handle.dispose();
  });
});
