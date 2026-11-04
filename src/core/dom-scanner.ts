import { DESIGN_WIDTH, PALETTE, TYPE_STYLES, sansStyle } from "./constants";
import { SceneBuilder } from "./scene-builder";
import type { SwarmScene } from "./types";

export interface ScannedDOMResult {
  scene: SwarmScene;
  builder: SceneBuilder;
  elements: HTMLElement[];
}

export function scanDOMElements(
  root: HTMLElement,
  designWidth = DESIGN_WIDTH
): ScannedDOMResult {
  const builder = new SceneBuilder(designWidth);
  const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-swarm]"));
  const rootRect = root.getBoundingClientRect();
  let maxBottom = Math.max(800, rootRect.height || 800);
  const guidesCreated = new Set<string>();

  nodes.forEach((node, idx) => {
    const id =
      node.id ||
      node.getAttribute("data-swarm-id") ||
      `swarm-dom-${idx}`;
    if (!node.id) node.id = id;
    node.removeAttribute("data-swarm-done");

    const tool = (node.getAttribute("data-swarm") || "rect").toLowerCase();
    const rect = node.getBoundingClientRect();
    const x =
      rect.width > 0
        ? Math.max(0, rect.left - rootRect.left)
        : 116 + (idx % 3) * 320;
    const y =
      rect.height > 0
        ? Math.max(0, rect.top - rootRect.top)
        : 120 + idx * 110;
    const w = rect.width > 0 ? rect.width : 280;
    const h = rect.height > 0 ? rect.height : 56;
    maxBottom = Math.max(maxBottom, y + h + 120);

    const rawDeps = node.getAttribute("data-swarm-deps");
    const deps = rawDeps
      ? rawDeps
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean)
          .map((depId) => {
            if (depId.includes(":")) return depId;
            const depNode = root.querySelector<HTMLElement>(
              `#${depId}, [data-swarm-id="${depId}"]`
            );
            const depTool = (
              depNode?.getAttribute("data-swarm") || "rect"
            ).toLowerCase();
            return `${depTool === "text" ? "t" : depTool === "path" ? "p" : "r"}:${depId}`;
          })
      : [];

    const snapAttr = node.getAttribute("data-swarm-snap");
    let snapGuideId: string | undefined;
    if (snapAttr === "x" || snapAttr === "y") {
      snapGuideId = `g-auto-${snapAttr}-${Math.round(snapAttr === "x" ? x : y)}`;
      if (!guidesCreated.has(snapGuideId)) {
        guidesCreated.add(snapGuideId);
        builder.addGuide(
          snapGuideId,
          snapAttr,
          snapAttr === "x" ? x : y,
          Math.max(0, y - 40)
        );
      }
    } else if (snapAttr) {
      snapGuideId = snapAttr;
      if (!guidesCreated.has(snapGuideId)) {
        guidesCreated.add(snapGuideId);
        builder.addGuide(snapGuideId, "x", x, Math.max(0, y - 40));
      }
    }

    if (tool === "text") {
      const textContent = (node.textContent || "").trim() || id;
      const grow = node.getAttribute("data-swarm-grow") === "true";
      const computed =
        typeof window !== "undefined" ? window.getComputedStyle(node) : null;
      const fontSize = computed ? parseFloat(computed.fontSize) || 24 : 24;
      const fontWeight = computed
        ? parseInt(computed.fontWeight, 10) || 600
        : 600;
      const color = computed?.color || PALETTE.ink;

      builder.addText(
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
          domEl: node,
        }
      );
    } else if (tool === "path") {
      builder.addPath(
        id,
        [
          { x, y },
          { x: x + w, y },
        ],
        { deps }
      );
      const pathEl = builder.elMap.get(id);
      if (pathEl) pathEl.domEl = node;
    } else {
      const computed =
        typeof window !== "undefined" ? window.getComputedStyle(node) : null;
      const borderRadius = computed
        ? parseFloat(computed.borderRadius) || 8
        : 8;
      const bg =
        computed &&
        computed.backgroundColor &&
        computed.backgroundColor !== "rgba(0, 0, 0, 0)"
          ? computed.backgroundColor
          : PALETTE.card;

      builder.addRect(id, x, y, w, h, {
        r: borderRadius,
        fill: bg,
        stroke: PALETTE.line,
        deps,
        domEl: node,
      });
    }
  });

  if (builder.els.length === 0) {
    builder.addText("fallback-text", 116, 160, "Swarm Ready", TYPE_STYLES.h2);
  }

  return {
    scene: builder.build(maxBottom),
    builder,
    elements: nodes,
  };
}
