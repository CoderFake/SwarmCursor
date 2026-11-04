import { describe, it, expect, vi } from "vitest";
import { SwarmEngine } from "../src/core/engine";
import { SceneBuilder } from "../src/core/scene-builder";
import { TYPE_STYLES } from "../src/core/constants";
import { AutoScrollController } from "../src/core/autoscroll";

describe("SwarmEngine & Coroutines", () => {
  it("starts when scrolled or when mouse repels intro flocking cursors", () => {
    const engine = new SwarmEngine();
    expect(engine.started).toBe(false);
    const firstCursor = engine.cursors[0];
    engine.mouse = {
      x: firstCursor.x * engine.vp.s + engine.vp.left,
      y: firstCursor.y * engine.vp.s - engine.vp.scrollY,
    };
    engine.step(0.016);
    expect(engine.started).toBe(true);
  });

  it("executes guide, path, rect, text (with grow & snap), dup, and edit tasks to completion", () => {
    const builder = new SceneBuilder(1280);
    builder.addGuide("g1", "x", 100, 50);
    builder.addPath("p1", [{ x: 100, y: 60 }, { x: 200, y: 60 }]);
    const rTask = builder.addRect("r1", 100, 100, 160, 48, { r: 8 });
    builder.addText("t1", 100, 110, "Hello", TYPE_STYLES.h2, {
      w: 160,
      snap: "g1",
      grow: true,
      deps: [rTask],
    });
    builder.addDupGroup("grp1", ["r1", "t1"], [
      { dx: 200, dy: 0, edits: ["World"] },
    ]);

    const engine = new SwarmEngine({ scene: builder.build(600) });
    engine.start();
    engine.setScroll(100);

    for (let i = 0; i < 600; i++) {
      engine.step(0.04);
    }

    expect(engine.tasks.every((t) => t.state === "done")).toBe(true);
    const t1 = engine.els.get("t1");
    const t1Clone = engine.els.get("t1~1");
    const r1 = engine.els.get("r1");
    expect(t1 && "shown" in t1 ? t1.shown : "").toBe("Hello");
    expect(t1Clone && "shown" in t1Clone ? t1Clone.shown : "").toBe("World");
    expect(r1 && "styled" in r1 ? r1.styled : false).toBe(true);
    expect(engine.flocking).toBe(true);
  });

  it("AutoScrollController advances scroll in auto/hybrid mode and pauses on user interrupt", () => {
    const scrollSpy = vi.fn();
    const ctrl = new AutoScrollController({
      mode: "hybrid",
      speed: 220,
      pauseOnUserMs: 2000,
      onScrollTo: scrollSpy,
    });
    const engine = new SwarmEngine();
    ctrl.update(0.05, engine);
    expect(engine.started).toBe(true);
    expect(scrollSpy).toHaveBeenCalled();

    scrollSpy.mockClear();
    ctrl.notifyUserInteraction();
    ctrl.update(0.05, engine);
    expect(scrollSpy).not.toHaveBeenCalled();

    ctrl.update(2.1, engine);
    ctrl.update(0.05, engine);
    expect(scrollSpy).toHaveBeenCalled();
  });
});
