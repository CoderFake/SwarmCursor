import type { Swarm3DBuildMode } from "../core/types";

export interface Phase3DWeights {
  extrude: number;
  particles: number;
  slice: number;
  activePhase: "idle" | "extrude" | "particles" | "slice" | "done";
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / Math.max(1e-6, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Computes normalized stage weights for the 3 GPU Build Algorithms:
 * 1. `extrude` (Wireframe Bounding-Box & Sculpt Extrusion)
 * 2. `particles` (MeshSurfaceSampler GPU Particle Swarm Assembly)
 * 3. `slice` (Holographic 3D Printing Laser Clipping Plane -> Solid PBR)
 * 4. `all` (Multi-Pass Choreography combining all 3 stages seamlessly)
 */
export function compute3DPhaseWeights(
  mode: Swarm3DBuildMode,
  progress: number
): Phase3DWeights {
  const p = clamp01(progress);
  if (p <= 0) {
    return { extrude: 0, particles: 0, slice: 0, activePhase: "idle" };
  }
  if (p >= 1) {
    return { extrude: 1, particles: 1, slice: 1, activePhase: "done" };
  }

  if (mode === "extrude") {
    return {
      extrude: smoothstep(0, 1, p),
      particles: 0,
      slice: smoothstep(0.65, 1, p),
      activePhase: "extrude",
    };
  }

  if (mode === "particles") {
    return {
      extrude: 1,
      particles: smoothstep(0, 0.88, p),
      slice: smoothstep(0.72, 1, p),
      activePhase: "particles",
    };
  }

  if (mode === "slice") {
    return {
      extrude: 1,
      particles: 0,
      slice: smoothstep(0, 1, p),
      activePhase: "slice",
    };
  }

  // Combined "all" mode:
  // 0.00 -> 0.30: Gizmo Wireframe Extrude
  // 0.22 -> 0.68: GPU Particle Swarm Convergence
  // 0.56 -> 1.00: Holographic Laser Slice Materialize
  const extrude = smoothstep(0.0, 0.3, p);
  const particles = smoothstep(0.2, 0.68, p);
  const slice = smoothstep(0.54, 1.0, p);
  const activePhase =
    p < 0.3 ? "extrude" : p < 0.62 ? "particles" : "slice";

  return { extrude, particles, slice, activePhase };
}

export const PARTICLE_BUILD_VERTEX_SHADER = /* glsl */ `
uniform float uProgress;
uniform float uTime;
uniform float uPointSize;

attribute vec3 aTargetPosition;
attribute float aDelay;

varying float vProgress;
varying float vDelay;

void main() {
  float delayed = clamp((uProgress - aDelay * 0.35) / 0.65, 0.0, 1.0);
  float eased = smoothstep(0.0, 1.0, delayed);

  vec3 swirl = vec3(
    sin(uTime * 5.5 + aDelay * 14.0),
    cos(uTime * 4.8 + aDelay * 11.0),
    sin(uTime * 6.2 - aDelay * 13.0)
  ) * 0.22 * (1.0 - eased) * sin(eased * 3.14159265);

  vec3 mixedPos = mix(position, aTargetPosition, eased) + swirl;
  vec4 mvPosition = modelViewMatrix * vec4(mixedPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  gl_PointSize = (uPointSize / max(0.5, -mvPosition.z)) * (0.65 + 0.55 * sin(eased * 3.14159265));
  vProgress = eased;
  vDelay = aDelay;
}
`;

export const PARTICLE_BUILD_FRAGMENT_SHADER = /* glsl */ `
uniform float uFadeOut;
varying float vProgress;
varying float vDelay;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;

  float core = smoothstep(0.5, 0.08, dist);
  vec3 cyanEnergy = vec3(0.05, 0.78, 1.0);
  vec3 violetPulse = vec3(0.55, 0.36, 0.98);
  vec3 pearlComplete = vec3(0.96, 0.94, 1.0);

  vec3 baseCol = mix(cyanEnergy, violetPulse, fract(vDelay * 3.7));
  vec3 col = mix(baseCol, pearlComplete, vProgress * 0.75);
  float alpha = core * (1.0 - uFadeOut) * clamp(vProgress * 1.4, 0.15, 0.95);

  gl_FragColor = vec4(col, alpha);
}
`;

export const HOLOGRAPHIC_SLICE_FRAGMENT_CHUNK = /* glsl */ `
// Injected into Three.js fragment shaders for Holographic 3D Printing Laser Rim
if (vWorldPosition.y > uSliceHeight) {
  discard;
}
float sliceDist = uSliceHeight - vWorldPosition.y;
if (sliceDist < 0.08) {
  float laserFactor = 1.0 - (sliceDist / 0.08);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.45, 0.88, 1.0), laserFactor * 0.85);
}
`;
