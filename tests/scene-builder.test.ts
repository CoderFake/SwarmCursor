import { describe, it, expect } from "vitest";
import { SceneBuilder } from "../src/core/scene-builder";
import { TYPE_STYLES } from "../src/core/constants";
import { measureTextBlock } from "../src/core/text-measure";
import { buildSwarmLandingScene } from "../src/presets/swarm-landing";

describe("SceneBuilder & Text Measurement", () => {
  it("measures single and multi-line text deterministically in SSR/jsdom", () => {
    const res = measureTextBlock("Run a thousand\nagents as one.", TYPE_STYLES.h1, 64, 580);
    expect(res.w).toBe(580);
    expect(res.h).toBeGreaterThan(100);
    expect(res.lines.length).toBeGreaterThanOrEqual(2);
  });

  it("registers path, rect, text, guide, and dupGroup with DAG dependencies", () => {
    const builder = new SceneBuilder(1280);
    const guideTask = builder.addGuide("g-hero", "x", 116, 120);
    expect(guideTask).toBe("g:g-hero");

    const rectTask = builder.addRect("card0", 100, 200, 180, 64, { r: 10 });
    const textTask = builder.addText("title0", 116, 210, "Agent 0", TYPE_STYLES.nodeName, {
      deps: [rectTask],
      snap: "g-hero",
    });
    expect(textTask).toBe("t:title0");

    builder.addDupGroup("cards", ["card0", "title0"], [
      { dx: 200, dy: 0, edits: ["Agent 1"] },
      { dx: 400, dy: 0, edits: ["Agent 2"] },
    ]);

    const scene = builder.build(1000);
    expect(scene.els.length).toBe(7); // 1 guide + 2 base + 4 cloned
    expect(scene.groups.length).toBe(1);
    const editTasks = scene.tasks.filter((t) => t.spec.type === "edit");
    expect(editTasks.length).toBe(2);
    expect(editTasks[0].deps).toEqual(["d:cards:0", "d:cards:1"]);
  });

  it("builds the complete original swarm-site landing scene preset", () => {
    const scene = buildSwarmLandingScene(() => 24);
    expect(scene.height).toBe(4060);
    expect(scene.els.length).toBeGreaterThan(80);
    expect(scene.tasks.length).toBeGreaterThan(80);
    expect(scene.groups.length).toBe(8);
  });
});
