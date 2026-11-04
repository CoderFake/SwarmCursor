import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AutoScrollController } from "../core/autoscroll";
import { DESIGN_WIDTH } from "../core/constants";
import { scanDOMElements } from "../core/dom-scanner";
import { SwarmEngine } from "../core/engine";
import type { ScrollMode } from "../core/types";
import {
  CursorsLayer,
  RulersOverlay,
  SelectionAndGuidesOverlay,
} from "./Overlays";
import { MainCanvas } from "./SwarmCanvas";
import { SwarmAgentPill, type SwarmAgentPillProps } from "./SwarmAgentPill";
import { SwarmControls as SwarmControlsBar } from "./SwarmControls";

export interface SwarmContextValue {
  engine: SwarmEngine;
  autoScroll: AutoScrollController;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setScrollMode: (mode: ScrollMode) => void;
}

const SwarmContext = createContext<SwarmContextValue | null>(null);

export function useSwarm(): SwarmContextValue {
  const ctx = useContext(SwarmContext);
  if (!ctx) {
    throw new Error("useSwarm() must be used within a <SwarmProvider>");
  }
  return ctx;
}

export interface SwarmProviderProps {
  children: React.ReactNode;
  scrollMode?: ScrollMode;
  autoScrollSpeed?: number;
  controls?: boolean;
  controlsPosition?: "bottom-right" | "bottom-left" | "top-right";
  controlsSlot?: React.ReactNode;
  showCursorLabels?: boolean;
  designWidth?: number;
  /** Opt-in bottom-bar AI agent queue pill (`{N} agents`). Off by default unless declared. */
  agentPill?: boolean | Omit<SwarmAgentPillProps, "engine">;
}

export function SwarmProvider({
  children,
  scrollMode = "manual",
  autoScrollSpeed = 180,
  controls = false,
  controlsPosition = "bottom-right",
  controlsSlot,
  showCursorLabels = false,
  designWidth = DESIGN_WIDTH,
  agentPill = false,
}: SwarmProviderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<SwarmEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new SwarmEngine({ designWidth });
  }
  const autoScrollRef = useRef<AutoScrollController | null>(null);
  if (!autoScrollRef.current) {
    autoScrollRef.current = new AutoScrollController({
      mode: scrollMode,
      speed: autoScrollSpeed,
    });
  }

  const [, setTick] = useState(0);
  const engine = engineRef.current;
  const autoScroll = autoScrollRef.current;

  useEffect(() => {
    autoScroll.setMode(scrollMode);
  }, [scrollMode, autoScroll]);

  useEffect(() => {
    if (typeof window === "undefined" || !rootRef.current) return;
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const scanned = scanDOMElements(rootRef.current, designWidth);
    const rebuilt = new SwarmEngine({
      scene: scanned.scene,
      designWidth,
    });
    engineRef.current = rebuilt;

    const updateViewport = () => {
      const clientW = document.documentElement.clientWidth || designWidth;
      rebuilt.vp.vw = clientW;
      rebuilt.vp.vh = window.innerHeight || 800;
      rebuilt.vp.s = 1;
      rebuilt.vp.left = 0;
    };

    const onScroll = () => rebuilt.setScroll(window.scrollY);
    const onWheel = () => {
      autoScroll.notifyUserInteraction();
      if (window.scrollY > 0) rebuilt.start();
    };
    const onPointerMove = (e: PointerEvent) => {
      rebuilt.mouse = { x: e.clientX, y: e.clientY };
    };

    updateViewport();
    onScroll();

    window.addEventListener("resize", updateViewport);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let rafId = 0;
    let lastTime = performance.now();
    const frame = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      autoScroll.update(dt, rebuilt);
      rebuilt.step(dt);
      setTick((t) => t + 1);
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [autoScroll, designWidth]);

  const activeEngine = engineRef.current;
  const ctxValue: SwarmContextValue = {
    engine: activeEngine,
    autoScroll,
    start: () => activeEngine.start(),
    pause: () => activeEngine.pause(),
    resume: () => activeEngine.resume(),
    reset: () => activeEngine.reset(),
    setScrollMode: (m: ScrollMode) => autoScroll.setMode(m),
  };

  return (
    <SwarmContext.Provider value={ctxValue}>
      <div ref={rootRef} className="swarm-root">
        {children}
        <MainCanvas engine={activeEngine} />
        <SelectionAndGuidesOverlay engine={activeEngine} />
        <CursorsLayer engine={activeEngine} showLabels={showCursorLabels} />
      </div>
      <RulersOverlay engine={activeEngine} />
      {agentPill && (
        <SwarmAgentPill
          engine={activeEngine}
          {...(typeof agentPill === "object" ? agentPill : {})}
        />
      )}
      {controls && (
        <SwarmControlsBar
          engine={activeEngine}
          autoScroll={autoScroll}
          position={controlsPosition}
        >
          {controlsSlot}
        </SwarmControlsBar>
      )}
    </SwarmContext.Provider>
  );
}

export interface SwarmElementProps {
  id: string;
  tool?: "rect" | "text" | "path";
  grow?: boolean;
  snapAxis?: "x" | "y" | string;
  deps?: string[];
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function SwarmElement({
  id,
  tool = "rect",
  grow = false,
  snapAxis,
  deps,
  className,
  style,
  children,
}: SwarmElementProps) {
  return (
    <div
      id={id}
      data-swarm={tool}
      data-swarm-id={id}
      data-swarm-grow={grow ? "true" : undefined}
      data-swarm-snap={snapAxis}
      data-swarm-deps={deps?.join(",")}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}

export function SwarmControls({
  position = "bottom-right",
  children,
}: {
  position?: "bottom-right" | "bottom-left" | "top-right";
  children?: React.ReactNode;
}) {
  const ctx = useContext(SwarmContext);
  if (!ctx) return null;
  return (
    <SwarmControlsBar
      engine={ctx.engine}
      autoScroll={ctx.autoScroll}
      position={position}
    >
      {children}
    </SwarmControlsBar>
  );
}
