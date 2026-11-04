import React, { useEffect, useRef } from "react";
import {
  DESIGN_WIDTH,
  FastCursorLayerController,
  FastOverlayCanvasController,
  SwarmEngine,
  scanDOMElements,
} from "swarm-cursor";
import "swarm-cursor/styles.css";

export function ZeroTickSwarmStage({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cursorsRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const rootEl = rootRef.current;
    const cursorsEl = cursorsRef.current;
    const canvasEl = canvasRef.current;
    if (!rootEl || !cursorsEl || !canvasEl) return;

    const scanned = scanDOMElements(rootEl, DESIGN_WIDTH);
    const engine = new SwarmEngine({
      scene: scanned.scene,
      designWidth: DESIGN_WIDTH,
      tempoMultiplier: 1.5,
    });
    engine.start();

    const cursorCtrl = new FastCursorLayerController(cursorsEl, { showLabels: false });
    const overlayCtrl = new FastOverlayCanvasController(canvasEl);

    let rafId = 0;
    let lastTime = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      engine.step(dt);
      cursorCtrl.sync(engine);
      overlayCtrl.sync(engine);
      if (!engine.flocking) {
        rafId = requestAnimationFrame(frame);
      }
    };
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      cursorCtrl.destroy();
      overlayCtrl.destroy();
    };
  }, []);

  return (
    <div ref={rootRef} className="swarm-root">
      {children}
      <canvas
        ref={canvasRef}
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 40 }}
      />
      <div ref={cursorsRef} className="cursors" style={{ zIndex: 42 }} />
    </div>
  );
}
