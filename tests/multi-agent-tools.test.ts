import { describe, it, expect } from "vitest";
import { SwarmEngine, SceneBuilder, registerSwarm3D } from "../src";

describe("@swarm/tools (3D Coroutines & Multi-Agent Squad Collaboration)", () => {
  it("dispatches multiple cursors collaboratively to build a 3D element through extrude -> particles -> slice phases", () => {
    const container = document.createElement("div");
    const handle = registerSwarm3D({
      id: "hero-3d-orb",
      container,
      buildMode: "all",
      squadSize: 3,
      boundingBox: { min: [-1.5, -1.5, -1.5], max: [1.5, 1.5, 1.5] },
    });

    const builder = new SceneBuilder(1280);
    builder.add3D("hero-3d-orb", 400, 120, 360, 360, {
      buildMode: "all",
      squadSize: 3,
      domEl: container,
    });

    const engine = new SwarmEngine({
      scene: builder.build(800),
      initialCursors: 6,
      minCursors: 6,
    });
    engine.start();
    engine.setScroll(50);

    let saw3DGizmoOverlay = false;
    let maxCollaboratingCursors = 0;

    for (let i = 0; i < 450; i++) {
      engine.step(0.035);
      const activeOn3D = engine.cursors.filter(
        (c) => c.task?.id === "3d:hero-3d-orb"
      ).length;
      if (activeOn3D > maxCollaboratingCursors) {
        maxCollaboratingCursors = activeOn3D;
      }
      for (const c of engine.cursors) {
        const ovs = c.ov?.() ?? [];
        if (ovs.some((item) => item.t === "gizmo3d" || item.t === "laser3d")) {
          saw3DGizmoOverlay = true;
        }
      }
    }

    expect(saw3DGizmoOverlay).toBe(true);
    expect(maxCollaboratingCursors).toBeGreaterThanOrEqual(2);
    expect(handle.progress).toBe(1);
    expect(engine.tasks.every((t) => t.state === "done")).toBe(true);
    handle.dispose();
  });
});
