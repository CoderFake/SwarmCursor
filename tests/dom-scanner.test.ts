import { describe, it, expect } from "vitest";
import { scanDOMElements, createSwarm } from "../src/index";

describe("DOMScanner & Vanilla Mount", () => {
  it("scans [data-swarm] elements from real DOM and builds a playable scene", () => {
    document.body.innerHTML = `
      <div id="app">
        <h1 id="hero-h1" data-swarm="text" data-swarm-grow="true" data-swarm-snap="x">Build with Agents</h1>
        <div id="card-1" data-swarm="rect" data-swarm-deps="hero-h1">Card Content</div>
      </div>
    `;
    const appEl = document.getElementById("app")!;
    const scanned = scanDOMElements(appEl);
    expect(scanned.scene.els.length).toBeGreaterThanOrEqual(3); // guide + text + rect
    expect(scanned.scene.tasks.length).toBeGreaterThanOrEqual(3);

    const instance = createSwarm({
      container: appEl,
      mode: "dom",
      scrollMode: "auto",
    });
    instance.engine.start();
    for (let i = 0; i < 400; i++) {
      instance.engine.step(0.04);
    }
    expect(document.getElementById("hero-h1")!.getAttribute("data-swarm-done")).toBe("true");
    instance.destroy();
  });
});
