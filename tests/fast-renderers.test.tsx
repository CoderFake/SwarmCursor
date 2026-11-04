import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { SwarmProvider, Swarm3D } from "../src/react";
import {
  SwarmEngine,
  SceneBuilder,
  FastCursorLayerController,
  FastOverlayCanvasController,
} from "../src";

describe("@swarm/renderers & <Swarm3D> (Zero-React-Tick Fast Layer)", () => {
  it("renders <SwarmProvider deepScan> and <Swarm3D> in SSR and updates cursors via Direct-DOM pool without React re-renders", () => {
    const html = renderToString(
      <SwarmProvider deepScan={true}>
        <div data-swarm-deep="true">
          <h2>3D Showcase</h2>
          <Swarm3D
            id="glb-demo"
            src="/models/demo.glb"
            buildMode="all"
            squadSize={4}
          />
        </div>
      </SwarmProvider>
    );
    expect(html).toContain('data-swarm-3d="all"');
    expect(html).toContain('data-swarm-id="glb-demo"');

    const container = document.createElement("div");
    const builder = new SceneBuilder(1280);
    builder.addRect("r1", 100, 100, 200, 100);
    builder.add3D("orb-1", 400, 150, 320, 320, {
      buildMode: "all",
      squadSize: 3,
    });
    const engine = new SwarmEngine({
      scene: builder.build(600),
      initialCursors: 8,
    });
    engine.start();
    engine.step(0.016);

    const fastPool = new FastCursorLayerController(container, {
      showLabels: true,
    });
    fastPool.sync(engine);
    expect(container.querySelectorAll(".cursor").length).toBe(
      engine.cursors.length
    );
    const firstNode = container.querySelector(".cursor") as HTMLElement;
    expect(firstNode.style.transform).toContain("translate3d(");

    const canvas = document.createElement("canvas");
    const fastOverlay = new FastOverlayCanvasController(canvas);
    fastOverlay.sync(engine);

    fastPool.destroy();
    fastOverlay.destroy();
  });
});
