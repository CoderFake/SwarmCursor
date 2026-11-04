import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createSwarm3DStage, loadGLBTargets } from "swarm-cursor/three";

export async function mountGlbSwarmBuilder(
  scene: THREE.Scene,
  camera: THREE.Camera
) {
  const targets = await loadGLBTargets(
    "/models/robot-arm.glb",
    new GLTFLoader(),
    { maxPoints: 1800, scale: 1.5 }
  );

  const stage3d = createSwarm3DStage(THREE, scene, camera, targets, {
    mode: "all", // Stage 1: Wireframe -> Stage 2: GPU Particles -> Stage 3: Holographic Slice
    wireframeColor: "#7c3aed",
    particleColor: "#6d5df6",
    sliceLaserColor: "#38bdf8",
  });

  return {
    update(progress0to1: number, dt: number) {
      stage3d.setProgress(progress0to1, dt);
    },
    dispose() {
      stage3d.dispose();
    },
  };
}
