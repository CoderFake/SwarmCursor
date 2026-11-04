import { DESIGN_WIDTH, PALETTE, TYPE_STYLES, sansStyle } from "../core/constants";
import { SceneBuilder } from "../core/scene-builder";
import type { Swarm3DBuildMode, SwarmImageBuildMode, SwarmScene } from "../core/types";
import { DOMLayoutCache } from "./layout-cache";

export interface DeepScanOptions {
  designWidth?: number;
  maxDepth?: number;
  default3DSquadSize?: number;
}

export interface DeepScannedDOMResult {
  scene: SwarmScene;
  builder: SceneBuilder;
  elements: HTMLElement[];
  layoutCache: DOMLayoutCache;
}

const TEXT_TAGS = new Set([
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "P",
  "BLOCKQUOTE",
  "CODE",
  "PRE",
  "LABEL",
  "LI",
  "STRONG",
  "SPAN",
]);

const CONTROL_TAGS = new Set([
  "BUTTON",
  "A",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "IMG",
]);

const CONTAINER_TAGS = new Set([
  "SECTION",
  "ARTICLE",
  "HEADER",
  "FOOTER",
  "NAV",
  "ASIDE",
  "FORM",
  "DIV",
  "UL",
  "OL",
]);

const IGNORED_CLASSES = [
  "swarm-overlay",
  "cursors",
  "ruler",
  "swarm-turbopack-widget",
  "swarm-agent-pill",
  "v3-lg-swarm-construct-layer",
];

function shouldIgnoreElement(el: Element): boolean {
  const cls = typeof el.className === "string" ? el.className : "";
  for (const ignored of IGNORED_CLASSES) {
    if (cls.includes(ignored)) return true;
  }
  if (el.hasAttribute("data-swarm-ignore")) return true;
  return false;
}

function parse3DBuildMode(raw: string | null): Swarm3DBuildMode {
  if (raw === "extrude" || raw === "particles" || raw === "slice" || raw === "all") {
    return raw;
  }
  return "all";
}

function parseImageBuildMode(raw: string | null): SwarmImageBuildMode {
  if (raw === "mosaic" || raw === "scanline" || raw === "halftone" || raw === "all") {
    return raw;
  }
  return "all";
}

function hasDirectTextContent(el: HTMLElement): boolean {
  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes[i];
    if (child.nodeType === 3 && (child.textContent ?? "").trim().length > 0) {
      return true;
    }
  }
  return false;
}

/**
 * Recursively scans both explicit `[data-swarm]` nodes and deep component subtrees
 * (`[data-swarm-deep]` or inner semantic children), automatically building a
 * parent -> child Directed Acyclic Graph (DAG) for multi-agent construction.
 */
export function scanDeepDOMElements(
  root: HTMLElement,
  options: DeepScanOptions = {}
): DeepScannedDOMResult {
  const designWidth = options.designWidth ?? DESIGN_WIDTH;
  const maxDepth = options.maxDepth ?? 5;
  const default3DSquadSize = options.default3DSquadSize ?? 4;
  const builder = new SceneBuilder(designWidth);
  const layoutCache = new DOMLayoutCache(root);
  const rootRect = root.getBoundingClientRect();
  let maxBottom = Math.max(800, rootRect.height || 800);
  const discoveredElements: HTMLElement[] = [];
  const guidesCreated = new Set<string>();
  const visited = new Set<Element>();
  let autoIdx = 0;

  const computeGeometry = (el: HTMLElement, seqIdx: number) => {
    const r = el.getBoundingClientRect();
    const x =
      r.width > 0
        ? Math.max(0, r.left - rootRect.left)
        : 96 + (seqIdx % 3) * 320;
    const y =
      r.height > 0
        ? Math.max(0, r.top - rootRect.top)
        : 100 + seqIdx * 80;
    const w = r.width > 0 ? r.width : 240;
    const h = r.height > 0 ? r.height : 48;
    const box = { x, y, w, h };
    layoutCache.set(el, box);
    maxBottom = Math.max(maxBottom, y + h + 120);
    return box;
  };

  const resolveTaskIdForNode = (el: Element): string | null => {
    return el.getAttribute("data-swarm-task-id");
  };

  const registerDOMNode = (
    el: HTMLElement,
    kindHint: "3d" | "image" | "path" | "text" | "rect",
    parentTaskId: string | null
  ): string => {
    const seqIdx = autoIdx++;
    const id =
      el.id ||
      el.getAttribute("data-swarm-id") ||
      `swarm-deep-${seqIdx}`;
    if (!el.id) el.id = id;
    el.removeAttribute("data-swarm-done");
    if (!el.hasAttribute("data-swarm")) {
      el.setAttribute("data-swarm", kindHint);
    }

    const { x, y, w, h } = computeGeometry(el, seqIdx);
    const deps: string[] = [];
    if (parentTaskId) deps.push(parentTaskId);

    const rawDeps = el.getAttribute("data-swarm-deps");
    if (rawDeps) {
      rawDeps
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean)
        .forEach((depId) => {
          if (depId.includes(":")) {
            deps.push(depId);
            return;
          }
          const depEl = root.querySelector<HTMLElement>(
            `#${depId}, [data-swarm-id="${depId}"]`
          );
          const existingTask = depEl ? resolveTaskIdForNode(depEl) : null;
          if (existingTask) {
            deps.push(existingTask);
          } else {
            const depRaw = (depEl?.getAttribute("data-swarm") || "rect").toLowerCase();
            deps.push(
              `${
                depRaw === "text"
                  ? "t"
                  : depRaw === "path"
                    ? "p"
                    : depRaw === "3d"
                      ? "3d"
                      : depRaw === "image"
                        ? "img"
                        : "r"
              }:${depId}`
            );
          }
        });
    }

    const snapAttr = el.getAttribute("data-swarm-snap");
    let snapGuideId: string | undefined;
    if (snapAttr === "x" || snapAttr === "y") {
      snapGuideId = `g-deep-${snapAttr}-${Math.round(snapAttr === "x" ? x : y)}`;
      if (!guidesCreated.has(snapGuideId)) {
        guidesCreated.add(snapGuideId);
        builder.addGuide(
          snapGuideId,
          snapAttr,
          snapAttr === "x" ? x : y,
          Math.max(0, y - 36)
        );
      }
    }

    let taskId: string;
    if (kindHint === "3d") {
      const mode = parse3DBuildMode(
        el.getAttribute("data-swarm-3d") || el.getAttribute("data-swarm-mode")
      );
      const squadAttr = parseInt(el.getAttribute("data-swarm-squad") || "", 10);
      taskId = builder.add3D(id, x, y, w, h, {
        buildMode: mode,
        squadSize: Number.isFinite(squadAttr) && squadAttr > 0 ? squadAttr : default3DSquadSize,
        src: el.getAttribute("data-swarm-src") || undefined,
        deps,
        domEl: el,
      });
    } else if (kindHint === "image") {
      const mode = parseImageBuildMode(
        el.getAttribute("data-swarm-image") || el.getAttribute("data-swarm-mode")
      );
      const computed =
        typeof window !== "undefined" ? window.getComputedStyle(el) : null;
      const borderRadius = computed
        ? parseFloat(computed.borderRadius) || 12
        : 12;
      const imgSrc =
        el.getAttribute("data-swarm-src") ||
        (el as HTMLImageElement).src ||
        el.querySelector("img")?.getAttribute("src") ||
        undefined;
      taskId = builder.addImage(id, x, y, w, h, {
        r: borderRadius,
        buildMode: mode,
        src: imgSrc,
        deps,
        domEl: el,
      });
    } else if (kindHint === "path") {
      taskId = builder.addPath(
        id,
        [
          { x, y },
          { x: x + Math.max(24, w), y: y + Math.max(4, h * 0.5) },
          { x: x + Math.max(12, w * 0.5), y: y + Math.max(12, h) },
        ],
        { closed: true, deps }
      );
      const pathNode = builder.elMap.get(id);
      if (pathNode) pathNode.domEl = el;
    } else if (kindHint === "text") {
      const textContent = (el.textContent || "").trim() || id;
      const grow = el.getAttribute("data-swarm-grow") === "true";
      const computed =
        typeof window !== "undefined" ? window.getComputedStyle(el) : null;
      const fontSize = computed ? parseFloat(computed.fontSize) || 20 : 20;
      const fontWeight = computed
        ? parseInt(computed.fontWeight, 10) || 600
        : 600;
      const color = computed?.color || PALETTE.ink;

      taskId = builder.addText(
        id,
        x,
        y,
        textContent,
        sansStyle(fontSize, fontWeight, 1.25, color),
        {
          w,
          snap: snapGuideId,
          grow,
          deps,
          domEl: el,
        }
      );
    } else {
      const computed =
        typeof window !== "undefined" ? window.getComputedStyle(el) : null;
      const borderRadius = computed
        ? parseFloat(computed.borderRadius) || 12
        : 12;
      const bg =
        computed &&
        computed.backgroundColor &&
        computed.backgroundColor !== "rgba(0, 0, 0, 0)"
          ? computed.backgroundColor
          : PALETTE.card;

      taskId = builder.addRect(id, x, y, w, h, {
        r: borderRadius,
        fill: bg,
        stroke: PALETTE.line,
        deps,
        domEl: el,
      });
    }

    el.setAttribute("data-swarm-task-id", taskId);
    discoveredElements.push(el);
    return taskId;
  };

  const walkSubtree = (
    node: Element,
    parentTaskId: string | null,
    depth: number,
    insideDeepScope: boolean
  ) => {
    if (depth > maxDepth || visited.has(node) || shouldIgnoreElement(node)) {
      return;
    }
    visited.add(node);

    const isDeepRoot =
      node.hasAttribute("data-swarm-deep") ||
      node.getAttribute("data-swarm") === "deep";
    const explicitTool = node.getAttribute("data-swarm")?.toLowerCase() ?? null;
    const is3DNode =
      node.hasAttribute("data-swarm-3d") ||
      explicitTool === "3d" ||
      (node.tagName === "CANVAS" && insideDeepScope);

    let currentParentTask = parentTaskId;
    const htmlEl = node as HTMLElement;

    if (is3DNode) {
      registerDOMNode(htmlEl, "3d", parentTaskId);
      return;
    }

    const isImageNode =
      node.hasAttribute("data-swarm-image") ||
      explicitTool === "image" ||
      (node.tagName.toUpperCase() === "IMG" && insideDeepScope);

    if (isImageNode) {
      registerDOMNode(htmlEl, "image", parentTaskId);
      return;
    }

    if (node.tagName.toUpperCase() === "SVG") {
      if (insideDeepScope || explicitTool) {
        registerDOMNode(htmlEl, "path", parentTaskId);
      }
      return;
    }

    if (isDeepRoot || explicitTool) {
      const toolKind: "3d" | "path" | "text" | "rect" =
        explicitTool === "text"
          ? "text"
          : explicitTool === "path"
            ? "path"
            : explicitTool === "3d"
              ? "3d"
              : TEXT_TAGS.has(node.tagName) && !isDeepRoot && node.children.length === 0
                ? "text"
                : "rect";

      currentParentTask = registerDOMNode(htmlEl, toolKind, parentTaskId);
      if (toolKind === "text" || toolKind === "path") {
        return;
      }
    } else if (insideDeepScope) {
      const tag = node.tagName.toUpperCase();
      if (CONTROL_TAGS.has(tag)) {
        registerDOMNode(htmlEl, "rect", parentTaskId);
        return;
      }
      if (TEXT_TAGS.has(tag) && (hasDirectTextContent(htmlEl) || node.children.length <= 1)) {
        const txt = (htmlEl.textContent || "").trim();
        if (txt.length > 0) {
          registerDOMNode(htmlEl, "text", parentTaskId);
          return;
        }
      }
      if (
        !parentTaskId &&
        CONTAINER_TAGS.has(tag) &&
        node.children.length > 0 &&
        htmlEl.className &&
        (htmlEl.className.includes("card") ||
          htmlEl.className.includes("plaque") ||
          htmlEl.className.includes("pill") ||
          htmlEl.className.includes("box"))
      ) {
        currentParentTask = registerDOMNode(htmlEl, "rect", parentTaskId);
      }
    }

    const nextDeepScope = insideDeepScope || isDeepRoot;
    const children = Array.from(node.children);
    for (const child of children) {
      walkSubtree(child, currentParentTask, depth + 1, nextDeepScope);
    }
  };

  const rootIsDeep =
    root.hasAttribute("data-swarm-deep") ||
    root.querySelector("[data-swarm-deep]") !== null;

  if (rootIsDeep) {
    for (const child of Array.from(root.children)) {
      walkSubtree(child, null, 0, root.hasAttribute("data-swarm-deep"));
    }
  } else {
    // Also support scanning all [data-swarm] and their immediate semantic children
    const topTargets = Array.from(
      root.querySelectorAll<HTMLElement>("[data-swarm], [data-swarm-3d], [data-swarm-image]")
    );
    for (const target of topTargets) {
      walkSubtree(target, null, 0, true);
    }
  }

  if (builder.els.length === 0) {
    builder.addText("fallback-text", 116, 160, "Swarm Ready", TYPE_STYLES.h2);
  }

  return {
    scene: builder.build(maxBottom),
    builder,
    elements: discoveredElements,
    layoutCache,
  };
}
