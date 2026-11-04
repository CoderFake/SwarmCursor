import type { Swarm3DBuildMode } from "../core/types";
import { compute3DPhaseWeights, type Phase3DWeights } from "./build-shaders";
import {
  computeScreen3DAnchors,
  type Box3Bounds,
  type Screen3DAnchors,
} from "./projection-bridge";

export interface Swarm3DRegistration {
  id: string;
  container: HTMLElement;
  buildMode?: Swarm3DBuildMode;
  squadSize?: number;
  boundingBox?: Box3Bounds;
  onProgress?: (progress: number, weights: Phase3DWeights) => void;
}

export interface Swarm3DHandle {
  readonly id: string;
  readonly container: HTMLElement;
  readonly buildMode: Swarm3DBuildMode;
  readonly squadSize: number;
  progress: number;
  weights: Phase3DWeights;
  setProgress(p: number): void;
  getScreenAnchors(vp: {
    left: number;
    scrollY: number;
    s: number;
  }): Screen3DAnchors;
  dispose(): void;
}

const REGISTRY = new Map<string, Swarm3DHandle>();

export function registerSwarm3D(config: Swarm3DRegistration): Swarm3DHandle {
  const buildMode = config.buildMode ?? "all";
  const squadSize = Math.max(1, config.squadSize ?? 4);
  const bounds: Box3Bounds = config.boundingBox ?? {
    min: [-1.5, -1.5, -1.5],
    max: [1.5, 1.5, 1.5],
  };

  config.container.setAttribute("data-swarm-3d", buildMode);
  config.container.setAttribute("data-swarm-id", config.id);
  config.container.setAttribute("data-swarm-squad", String(squadSize));

  const handle: Swarm3DHandle = {
    id: config.id,
    container: config.container,
    buildMode,
    squadSize,
    progress: 0,
    weights: compute3DPhaseWeights(buildMode, 0),
    setProgress(p: number) {
      const clamped = Math.max(0, Math.min(1, p));
      this.progress = clamped;
      this.weights = compute3DPhaseWeights(buildMode, clamped);
      config.onProgress?.(clamped, this.weights);
    },
    getScreenAnchors(vp) {
      const r = config.container.getBoundingClientRect();
      const rect = {
        left: r.width > 0 ? r.left : 420,
        top: r.height > 0 ? r.top : 140,
        width: r.width > 0 ? r.width : 360,
        height: r.height > 0 ? r.height : 360,
      };
      const extrudeScale = Math.max(0.08, this.weights.extrude);
      return computeScreen3DAnchors(
        rect,
        vp,
        bounds,
        this.progress,
        extrudeScale
      );
    },
    dispose() {
      REGISTRY.delete(config.id);
    },
  };

  REGISTRY.set(config.id, handle);
  return handle;
}

export function getSwarm3DHandle(id: string): Swarm3DHandle | undefined {
  return REGISTRY.get(id);
}
