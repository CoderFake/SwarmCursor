import { describe, it, expect } from "vitest";
import { scanDeepDOMElements, DOMLayoutCache } from "../src/scanner";

describe("@swarm/scanner (Auto Deep DOM Component Traversal & Layout Cache)", () => {
  it("recursively discovers inner headings, buttons, SVG paths, and 3D canvases inside a component and wires parent->child DAG deps", () => {
    document.body.innerHTML = `
      <div id="stage">
        <article id="feature-card" data-swarm-deep="true">
          <div class="card-header">
            <svg id="card-icon" width="24" height="24"><path d="M0 0 L24 24" /></svg>
            <h2>Neural Swarm 3D</h2>
          </div>
          <p>Autonomous multi-agent construction engine.</p>
          <canvas id="orb-canvas" data-swarm-3d="all"></canvas>
          <button type="button">Launch Demo</button>
        </article>
      </div>
    `;
    const stage = document.getElementById("stage")!;
    const res = scanDeepDOMElements(stage, { designWidth: 1280, maxDepth: 5 });

    expect(
      res.scene.els.some((e) => e.id === "feature-card" && e.kind === "rect")
    ).toBe(true);
    expect(res.scene.els.some((e) => e.kind === "path")).toBe(true);
    expect(
      res.scene.els.filter((e) => e.kind === "text").length
    ).toBeGreaterThanOrEqual(2);
    expect(
      res.scene.els.some((e) => e.kind === "3d" && e.id === "orb-canvas")
    ).toBe(true);

    const childTasks = res.scene.tasks.filter((t) => t.id !== "r:feature-card");
    expect(childTasks.length).toBeGreaterThanOrEqual(4);
    expect(childTasks.every((t) => t.deps.includes("r:feature-card"))).toBe(
      true
    );
  });

  it("caches bounding boxes and filters visible elements via frustum culling", () => {
    const el = document.createElement("div");
    el.id = "cached-box";
    const cache = new DOMLayoutCache();
    cache.set(el, { x: 100, y: 500, w: 300, h: 120 });
    expect(cache.get(el)).toEqual({ x: 100, y: 500, w: 300, h: 120 });
    expect(cache.isInViewport(el, 0, 800, 100)).toBe(true);
    expect(cache.isInViewport(el, 1200, 1800, 100)).toBe(false);
    cache.destroy();
  });
});
