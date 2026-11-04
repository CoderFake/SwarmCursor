import React, { memo, useEffect, useRef, useState } from "react";
import { AutoScrollController } from "../core/autoscroll";
import {
  DESIGN_WIDTH,
  NAV_HEIGHT,
  NAV_OFFSET_TOP,
  PALETTE,
  RULER_SIZE,
  SWARM_LOGO_PATHS,
} from "../core/constants";
import { SwarmEngine } from "../core/engine";
import { getFontFamily, getLineHeightPx } from "../core/text-measure";
import type {
  ScrollMode,
  SwarmElementNode,
  SwarmPathEl,
  SwarmRectEl,
  SwarmScene,
  SwarmTextEl,
} from "../core/types";
import {
  CursorsLayer,
  RulersOverlay,
  SelectionAndGuidesOverlay,
} from "./Overlays";
import { SwarmAgentPill, type SwarmAgentPillProps } from "./SwarmAgentPill";
import { SwarmControls } from "./SwarmControls";

export function highlightCodeLine(line: string): React.ReactNode {
  if (line.trimStart().startsWith("#")) {
    return <span style={{ color: "#6B7078" }}>{line}</span>;
  }
  const tokens: React.ReactNode[] = [];
  const regex = /([A-Za-z_]+)(?=:)|([{}:,])|([^{}:,A-Za-z_]+|[A-Za-z_]+)/g;
  let match: RegExpExecArray | null;
  let keyIdx = 0;
  let isFirstKey = true;

  while ((match = regex.exec(line))) {
    if (match[1]) {
      tokens.push(
        <span
          key={keyIdx++}
          style={{ color: isFirstKey ? "#8FC9D6" : "#AEB6EE" }}
        >
          {match[1]}
        </span>
      );
      isFirstKey = false;
    } else if (match[2]) {
      tokens.push(
        <span key={keyIdx++} style={{ color: "#81868D" }}>
          {match[2]}
        </span>
      );
    } else {
      tokens.push(match[3]);
    }
  }
  return tokens;
}

export const TextElement = memo(
  ({ el }: { el: SwarmTextEl; v: number }) => {
    if (!el.vis || el.domEl) return null;
    const st = el.st;
    const content = el.selAll ? (
      <span className="text-sel">{el.shown}</span>
    ) : st.code ? (
      highlightCodeLine(el.shown)
    ) : (
      el.shown
    );

    return (
      <div
        className="el-text"
        style={{
          left: el.x + el.dx,
          top: el.y + el.dy,
          width: el.w,
          whiteSpace: el.w != null && !st.pre ? "pre-wrap" : "pre",
          fontFamily: getFontFamily(st),
          fontSize: el.size,
          fontWeight: st.weight,
          lineHeight: `${getLineHeightPx(st, el.size)}px`,
          letterSpacing: `${st.ls ?? 0}em`,
          color: st.color,
          textAlign: el.align,
        }}
      >
        {content}
        {el.editing && !el.selAll && (
          <span className="caret" style={{ height: el.size * 1.15 }} />
        )}
      </div>
    );
  },
  (prev, next) => prev.v === next.v
);

export const RectElement = memo(
  ({ el }: { el: SwarmRectEl; v: number }) => {
    if (!el.vis || el.domEl) return null;
    const w = el.draw?.w ?? el.w;
    const h = el.draw?.h ?? el.h;
    return (
      <div
        className="el-rect"
        style={{
          left: el.x + el.dx,
          top: el.y + el.dy,
          width: w,
          height: h,
          background: el.styled ? el.fill : "#D9D9D9",
          borderRadius: el.styled ? el.r : 0,
          boxShadow:
            el.styled && el.stroke ? `inset 0 0 0 1px ${el.stroke}` : "none",
        }}
      />
    );
  },
  (prev, next) => prev.v === next.v
);

export const PathElement = memo(
  ({ el }: { el: SwarmPathEl; v: number }) => {
    if (!el.vis || el.placed === 0 || el.domEl) return null;
    if (el.d && el.tf) {
      const progress = Math.min(1, (el.placed - 1) / el.pts.length);
      return (
        <path
          d={el.d}
          transform={`translate(${el.tf.x} ${el.tf.y}) scale(${el.tf.s})`}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - progress}
          stroke={el.stroke}
          strokeWidth={1.2 / el.tf.s}
          fill={el.fill}
          fillOpacity={el.fillOn ? 1 : 0}
          style={{
            transition:
              "fill-opacity 220ms ease, stroke-dashoffset 120ms linear",
          }}
        />
      );
    }
    const d =
      el.pts
        .slice(0, el.placed)
        .map((pt, idx) => `${idx ? "L" : "M"}${pt.x} ${pt.y}`)
        .join(" ") + (el.shut ? " Z" : "");

    return (
      <path
        d={d}
        stroke={el.stroke}
        strokeWidth={el.sw}
        fill={el.fill ?? "none"}
        fillOpacity={el.fillOn ? 1 : 0}
        style={{ transition: "fill-opacity 220ms ease" }}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
    );
  },
  (prev, next) => prev.v === next.v
);

export function LayerList({
  els,
  width = DESIGN_WIDTH,
  height,
}: {
  els: SwarmElementNode[];
  width?: number;
  height: number;
}) {
  return (
    <>
      {els.map((el) =>
        el.kind === "rect" ? <RectElement key={el.id} el={el} v={el.v} /> : null
      )}
      <svg className="paths" width={width} height={height}>
        {els.map((el) =>
          el.kind === "path" ? (
            <PathElement key={el.id} el={el} v={el.v} />
          ) : null
        )}
      </svg>
      {els.map((el) =>
        el.kind === "text" ? <TextElement key={el.id} el={el} v={el.v} /> : null
      )}
    </>
  );
}

export function MainCanvas({ engine }: { engine: SwarmEngine }) {
  const { s, left } = engine.vp;
  const nonSticky = engine.list.filter((el) => !el.sticky);
  return (
    <div
      className="canvas"
      style={{
        width: engine.designWidth,
        height: engine.height,
        transform: `translateX(${left}px) scale(${s})`,
      }}
    >
      <LayerList
        els={nonSticky}
        width={engine.designWidth}
        height={engine.height}
      />
    </div>
  );
}

export function StickyNavCanvas({ engine }: { engine: SwarmEngine }) {
  const { s, left } = engine.vp;
  const stickyEls = engine.list.filter((el) => el.sticky);
  if (stickyEls.length === 0) return null;
  const anyVisible = stickyEls.some((el) => el.vis);
  return (
    <div
      className="nav-sticky"
      style={{
        marginTop: NAV_OFFSET_TOP * s,
        height: NAV_HEIGHT * s,
        top: RULER_SIZE * engine.rulers.t,
      }}
    >
      {anyVisible && <div className="nav-backdrop" />}
      <div
        className="nav-canvas"
        style={{
          width: engine.designWidth,
          transform: `translateX(${left}px) scale(${s}) translateY(${-NAV_OFFSET_TOP}px)`,
        }}
      >
        <LayerList
          els={stickyEls}
          width={engine.designWidth}
          height={NAV_OFFSET_TOP + NAV_HEIGHT + 30}
        />
      </div>
    </div>
  );
}

export interface SwarmCanvasProps {
  scene?: SwarmScene | ((getWorkerCount: () => number) => SwarmScene);
  width?: number;
  scrollMode?: ScrollMode;
  autoScrollSpeed?: number;
  controls?: boolean;
  showCursorLabels?: boolean;
  showIntroLogo?: boolean;
  /** Opt-in bottom-bar AI agent queue pill (`{N} agents`). Off by default unless declared. */
  agentPill?: boolean | Omit<SwarmAgentPillProps, "engine">;
}

export function SwarmCanvas({
  scene,
  width = DESIGN_WIDTH,
  scrollMode = "manual",
  autoScrollSpeed = 180,
  controls = false,
  showCursorLabels = false,
  showIntroLogo = true,
  agentPill = false,
}: SwarmCanvasProps) {
  const engineRef = useRef<SwarmEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new SwarmEngine({ scene, designWidth: width });
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
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const updateViewport = () => {
      const clientW = document.documentElement.clientWidth || width;
      const scale = Math.min(1, clientW / width);
      engine.vp.vw = clientW;
      engine.vp.vh = window.innerHeight || 800;
      engine.vp.s = scale;
      engine.vp.left = (clientW - width * scale) / 2;
    };

    const onScroll = () => engine.setScroll(window.scrollY);
    const onWheel = () => {
      autoScroll.notifyUserInteraction();
      if (window.scrollY > 0) engine.start();
    };
    const onPointerMove = (e: PointerEvent) => {
      engine.mouse = { x: e.clientX, y: e.clientY };
    };
    const onPointerLeave = () => {
      engine.mouse = null;
    };

    updateViewport();
    onScroll();

    window.addEventListener("resize", updateViewport);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    let rafId = 0;
    let lastTime = performance.now();
    const frame = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      autoScroll.update(dt, engine);
      engine.step(dt);
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
      document.documentElement.removeEventListener(
        "pointerleave",
        onPointerLeave
      );
    };
  }, [engine, autoScroll, width]);

  return (
    <>
      <div className="page" style={{ height: engine.height * engine.vp.s }}>
        <StickyNavCanvas engine={engine} />
        <MainCanvas engine={engine} />
        {showIntroLogo && (
          <div
            className={"intro-logo" + (engine.started ? " gone" : "")}
            aria-hidden
          >
            <svg viewBox="0 0 120 140" width={60} height={70}>
              {SWARM_LOGO_PATHS.map((part, idx) => (
                <path key={idx} d={part.d} fill={PALETTE.line} />
              ))}
            </svg>
          </div>
        )}
        <SelectionAndGuidesOverlay engine={engine} />
        <CursorsLayer engine={engine} showLabels={showCursorLabels} />
      </div>
      <RulersOverlay engine={engine} />
      {agentPill && (
        <SwarmAgentPill
          engine={engine}
          {...(typeof agentPill === "object" ? agentPill : {})}
        />
      )}
      {controls && <SwarmControls engine={engine} autoScroll={autoScroll} />}
    </>
  );
}
