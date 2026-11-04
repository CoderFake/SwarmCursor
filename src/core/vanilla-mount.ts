import { AutoScrollController } from "./autoscroll";
import {
  ARROW_CURSOR_PATH,
  CURSOR_HOTSPOTS,
  DESIGN_WIDTH,
  GUIDE_RED,
  SELECTION_BLUE,
} from "./constants";
import { scanDOMElements } from "./dom-scanner";
import { SwarmEngine } from "./engine";
import { getFontFamily, getLineHeightPx } from "./text-measure";
import type {
  CursorShape,
  ScrollMode,
  SwarmEngineOptions,
  SwarmScene,
} from "./types";

export interface CreateSwarmOptions extends SwarmEngineOptions {
  container?: HTMLElement;
  mode?: "canvas" | "dom" | "hybrid";
  scrollMode?: ScrollMode;
  autoScrollSpeed?: number;
  controls?: boolean;
}

export interface SwarmInstance {
  engine: SwarmEngine;
  autoScroll: AutoScrollController;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setScrollMode: (mode: ScrollMode) => void;
  destroy: () => void;
}

function renderCursorSvgInner(shape: CursorShape, color: string): string {
  const baseStroke = `stroke="#fff" stroke-width="1.5" stroke-linejoin="round"`;
  switch (shape) {
    case "arrow":
      return `<path d="${ARROW_CURSOR_PATH}" fill="${color}" ${baseStroke}/>`;
    case "dup":
      return `<path d="${ARROW_CURSOR_PATH}" transform="translate(4 3.5)" fill="#fff" stroke="${color}" stroke-width="1.3" stroke-linejoin="round"/><path d="${ARROW_CURSOR_PATH}" fill="${color}" ${baseStroke}/>`;
    case "pen":
    case "pen-add":
    case "pen-close":
      return `<path d="M17.4 10.6 L20.6 13.8 L13.8 20.6 L10.6 17.4 Z" fill="${color}" ${baseStroke}/><path d="M3 3 L13.1 6.3 L17.4 10.6 L10.6 17.4 L6.3 13.1 Z" fill="${color}" ${baseStroke}/><path d="M3.6 3.6 L8.9 8.9" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/><circle cx="10.2" cy="10.2" r="1.75" fill="none" stroke="#fff" stroke-width="1.2"/>`;
    case "cross":
      return `<g stroke-linecap="round"><path d="M12 3.5 V20.5 M3.5 12 H20.5" stroke="#fff" stroke-width="3.6"/><path d="M12 3.5 V20.5 M3.5 12 H20.5" stroke="${color}" stroke-width="1.5"/></g>`;
    case "ibeam": {
      const d =
        "M8.5 4.5 H10.5 Q12 4.5 12 6 Q12 4.5 13.5 4.5 H15.5 M12 6 V18 M8.5 19.5 H10.5 Q12 19.5 12 18 Q12 19.5 13.5 19.5 H15.5";
      return `<g fill="none" stroke-linecap="round"><path d="${d}" stroke="#fff" stroke-width="3.6"/><path d="${d}" stroke="${color}" stroke-width="1.5"/></g>`;
    }
    case "ew":
    case "ns":
      return `<path d="M2.5 12 L7 7.5 V10.4 H17 V7.5 L21.5 12 L17 16.5 V13.6 H7 V16.5 Z" ${shape === "ns" ? 'transform="rotate(90 12 12)"' : ""} fill="${color}" ${baseStroke}/>`;
  }
}

export function createSwarm(options: CreateSwarmOptions = {}): SwarmInstance {
  const container =
    options.container ??
    (typeof document !== "undefined" ? document.body : null);
  const mode = options.mode ?? "canvas";
  const designWidth = options.designWidth ?? DESIGN_WIDTH;

  let resolvedScene:
    | SwarmScene
    | ((getWorkerCount: () => number) => SwarmScene)
    | undefined = options.scene;

  if (!resolvedScene && (mode === "dom" || mode === "hybrid") && container) {
    resolvedScene = scanDOMElements(container, designWidth).scene;
  }

  const engine = new SwarmEngine({
    ...options,
    designWidth,
    scene: resolvedScene,
  });

  const autoScroll = new AutoScrollController({
    mode: options.scrollMode ?? "manual",
    speed: options.autoScrollSpeed ?? 180,
  });

  let overlayRoot: HTMLDivElement | null = null;
  let rafId = 0;

  if (container && typeof document !== "undefined") {
    overlayRoot = document.createElement("div");
    overlayRoot.className = "swarm-vanilla-layer";
    overlayRoot.style.cssText =
      "position:absolute;inset:0;pointer-events:none;z-index:30;overflow:clip;";

    const canvasLayer = document.createElement("div");
    canvasLayer.className = "canvas";
    const overlaySvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    overlaySvg.style.cssText =
      "position:absolute;inset:0;overflow:visible;z-index:10;";
    const cursorsLayer = document.createElement("div");
    cursorsLayer.className = "cursors";

    overlayRoot.appendChild(canvasLayer);
    overlayRoot.appendChild(overlaySvg);
    overlayRoot.appendChild(cursorsLayer);
    container.appendChild(overlayRoot);

    const updateViewport = () => {
      const clientW = document.documentElement.clientWidth || designWidth;
      const scale = mode === "dom" ? 1 : Math.min(1, clientW / designWidth);
      engine.vp.vw = clientW;
      engine.vp.vh = window.innerHeight || 800;
      engine.vp.s = scale;
      engine.vp.left = mode === "dom" ? 0 : (clientW - designWidth * scale) / 2;
    };

    const onScroll = () => engine.setScroll(window.scrollY);
    const onWheel = () => {
      autoScroll.notifyUserInteraction();
      if (window.scrollY > 0) engine.start();
    };
    const onPointerMove = (e: PointerEvent) => {
      engine.mouse = { x: e.clientX, y: e.clientY };
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let lastTime = performance.now();
    const renderDomFrame = () => {
      const { s, left } = engine.vp;
      cursorsLayer.innerHTML = engine.cursors
        .map((c) => {
          const [hx, hy] = CURSOR_HOTSPOTS[c.shape];
          const sc = 1 - c.press * 0.12;
          const X = left + c.x * s;
          const Y = (c.y + (c.sticky ? engine.stick : 0)) * s;
          return `<div class="cursor" style="transform:translate(${X}px,${Y}px)"><svg width="28" height="28" viewBox="0 0 28 28" style="transform:translate(${-hx}px,${-hy}px) rotate(${c.angle}deg) scale(${sc});transform-origin:${hx}px ${hy}px">${renderCursorSvgInner(c.shape, c.color)}</svg></div>`;
        })
        .join("");

      if (mode !== "dom") {
        canvasLayer.innerHTML = engine.list
          .filter((el) => el.vis && !el.domEl)
          .map((el) => {
            if (el.kind === "rect") {
              const w = el.draw?.w ?? el.w;
              const h = el.draw?.h ?? el.h;
              return `<div class="el-rect" style="left:${el.x + el.dx}px;top:${el.y + el.dy}px;width:${w}px;height:${h}px;background:${el.styled ? el.fill : "#D9D9D9"};border-radius:${el.styled ? el.r : 0}px"></div>`;
            }
            if (el.kind === "text") {
              return `<div class="el-text" style="left:${el.x + el.dx}px;top:${el.y + el.dy}px;font-family:${getFontFamily(el.st)};font-size:${el.size}px;line-height:${getLineHeightPx(el.st, el.size)}px;color:${el.st.color}">${el.shown}</div>`;
            }
            return "";
          })
          .join("");
      }

      const svgParts: string[] = [];
      for (const el of engine.list) {
        if (el.kind === "guide" && el.vis && el.op > 0) {
          if (el.axis === "x") {
            const x = left + el.cur * s;
            svgParts.push(
              `<line x1="${x}" x2="${x}" y1="0" y2="${engine.height * s}" stroke="${GUIDE_RED}" stroke-width="${1 + el.flash}" opacity="${el.op}"/>`
            );
          } else {
            const y = el.cur * s;
            svgParts.push(
              `<line x1="0" x2="${engine.vp.vw}" y1="${y}" y2="${y}" stroke="${GUIDE_RED}" stroke-width="${1 + el.flash}" opacity="${el.op}"/>`
            );
          }
        }
      }
      for (const c of engine.cursors) {
        if (!c.ov) continue;
        for (const item of c.ov()) {
          if (item.t === "box") {
            const stroke = item.color === "red" ? GUIDE_RED : SELECTION_BLUE;
            svgParts.push(
              `<rect x="${left + item.b.x * s}" y="${item.b.y * s}" width="${item.b.w * s}" height="${item.b.h * s}" fill="none" stroke="${stroke}" stroke-width="1"/>`
            );
          }
        }
      }
      overlaySvg.innerHTML = svgParts.join("");
    };

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      autoScroll.update(dt, engine);
      engine.step(dt);
      renderDomFrame();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  return {
    engine,
    autoScroll,
    start: () => engine.start(),
    pause: () => engine.pause(),
    resume: () => engine.resume(),
    reset: () => engine.reset(),
    setScrollMode: (m: ScrollMode) => autoScroll.setMode(m),
    destroy: () => {
      if (rafId) cancelAnimationFrame(rafId);
      overlayRoot?.remove();
    },
  };
}

export interface SwarmFollowerOptions {
  container?: HTMLElement;
  count?: number;
  radiusScale?: number;
  tempoMultiplier?: number;
  zIndex?: number;
}

export function createSwarmFollower(
  options: SwarmFollowerOptions = {}
): { engine: SwarmEngine; destroy: () => void } {
  const count = options.count ?? 36;
  const radiusScale = options.radiusScale ?? 1;
  const engine = new SwarmEngine({
    initialCursors: count,
    flockCursors: count,
    tempoMultiplier: options.tempoMultiplier ?? 1,
    scene: { els: [], tasks: [], groups: [], height: 800, width: 1280 },
  });
  engine.started = true;
  engine.flocking = true;
  for (const c of engine.cursors) {
    c.follow = true;
  }

  let layer: HTMLDivElement | null = null;
  let rafId = 0;

  if (typeof document !== "undefined") {
    const parent = options.container ?? document.body;
    layer = document.createElement("div");
    layer.className = "cursors";
    layer.style.cssText = `position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:${options.zIndex ?? 40};overflow:hidden;`;
    parent.appendChild(layer);

    const updateViewport = () => {
      engine.vp.vw = window.innerWidth || 1280;
      engine.vp.vh = window.innerHeight || 800;
      engine.vp.s = 1;
      engine.vp.left = 0;
      engine.vp.scrollY = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      engine.mouse = { x: e.clientX, y: e.clientY };
    };
    const onPointerLeave = () => {
      engine.mouse = null;
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt =
        Math.min(0.05, (now - lastTime) / 1000) * engine.tempoMultiplier;
      lastTime = now;
      engine.time += dt;
      engine.follow(dt, engine.cursors, undefined, radiusScale);
      if (layer) {
        layer.innerHTML = engine.cursors
          .map((c) => {
            const [hx, hy] = CURSOR_HOTSPOTS[c.shape];
            const sc = 1 - c.press * 0.12;
            return `<div class="cursor" style="transform:translate(${c.x}px,${c.y}px)"><svg width="28" height="28" viewBox="0 0 28 28" style="transform:translate(${-hx}px,${-hy}px) rotate(${c.angle}deg) scale(${sc});transform-origin:${hx}px ${hy}px">${renderCursorSvgInner(c.shape, c.color)}</svg></div>`;
          })
          .join("");
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  return {
    engine,
    destroy: () => {
      if (rafId) cancelAnimationFrame(rafId);
      layer?.remove();
    },
  };
}

