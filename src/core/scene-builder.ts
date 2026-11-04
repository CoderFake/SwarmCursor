import {
  BLEED_LEFT,
  BLEED_RIGHT,
  DESIGN_WIDTH,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  PALETTE,
  SWARM_LOGO_PATHS,
} from "./constants";
import { measureTextBlock } from "./text-measure";
import type {
  Point2D,
  Swarm3DBuildMode,
  Swarm3DEl,
  SwarmDupGroup,
  SwarmElementNode,
  SwarmGuideEl,
  SwarmPathEl,
  SwarmRectEl,
  SwarmScene,
  SwarmTask,
  SwarmTaskSpec,
  SwarmTextEl,
  TextStyleSpec,
} from "./types";

export interface Add3DOptions {
  buildMode?: Swarm3DBuildMode;
  squadSize?: number;
  src?: string;
  deps?: string[];
  sticky?: boolean;
  domEl?: HTMLElement | null;
}

export interface AddPathOptions {
  closed?: boolean;
  stroke?: string;
  sw?: number;
  fill?: string;
  d?: string;
  tf?: { x: number; y: number; s: number };
  add?: boolean;
  deps?: string[];
  sticky?: boolean;
}

export interface AddRectOptions {
  r?: number;
  fill?: string;
  stroke?: string;
  deps?: string[];
  sticky?: boolean;
  domEl?: HTMLElement | null;
}

export interface AddTextOptions {
  w?: number;
  align?: "left" | "center" | "right";
  snap?: string;
  grow?: boolean;
  dyn?: () => string;
  deps?: string[];
  sticky?: boolean;
  domEl?: HTMLElement | null;
}

export class SceneBuilder {
  public readonly els: SwarmElementNode[] = [];
  public readonly tasks: SwarmTask[] = [];
  public readonly groups: SwarmDupGroup[] = [];
  public readonly elMap = new Map<string, SwarmElementNode>();
  public readonly width: number;
  private defaultDeps: string[] = [];

  constructor(width = DESIGN_WIDTH) {
    this.width = width;
  }

  private registerEl<T extends SwarmElementNode>(el: T): T {
    this.els.push(el);
    this.elMap.set(el.id, el);
    return el;
  }

  private registerTask(
    id: string,
    y: number,
    spec: SwarmTaskSpec,
    deps: string[] = this.defaultDeps
  ): string {
    this.tasks.push({ id, y, spec, deps });
    return id;
  }

  public addPath(
    id: string,
    pts: Point2D[],
    opts: AddPathOptions = {}
  ): string {
    const el: SwarmPathEl = {
      kind: "path",
      id,
      v: 0,
      vis: false,
      dx: 0,
      dy: 0,
      pts,
      closed: !!opts.closed,
      stroke: opts.stroke ?? PALETTE.line,
      sw: opts.sw ?? 1,
      fill: opts.fill,
      d: opts.d,
      tf: opts.tf,
      add: opts.add ?? true,
      placed: 0,
      shut: false,
      edit: false,
      owner: null,
      fillOn: false,
      sticky: opts.sticky,
    };
    this.registerEl(el);
    return this.registerTask(
      "p:" + id,
      Math.min(...pts.map((p) => p.y)),
      { type: "path", el: id },
      opts.deps ?? []
    );
  }

  public addRect(
    id: string,
    x: number,
    y: number,
    w: number,
    h: number,
    opts: AddRectOptions = {}
  ): string {
    const el: SwarmRectEl = {
      kind: "rect",
      id,
      v: 0,
      vis: false,
      dx: 0,
      dy: 0,
      x,
      y,
      w,
      h,
      r: opts.r ?? 0,
      fill: opts.fill ?? PALETTE.card,
      stroke: opts.stroke,
      draw: null,
      styled: false,
      sticky: opts.sticky,
      domEl: opts.domEl,
    };
    this.registerEl(el);
    return this.registerTask(
      "r:" + id,
      y,
      { type: "rect", el: id },
      opts.deps ?? []
    );
  }

  public addText(
    id: string,
    x: number,
    y: number,
    text: string,
    st: TextStyleSpec,
    opts: AddTextOptions = {}
  ): string {
    const finalText = st.upper ? text.toUpperCase() : text;
    const el: SwarmTextEl = {
      kind: "text",
      id,
      v: 0,
      vis: false,
      dx: 0,
      dy: 0,
      x,
      y,
      w: opts.w,
      align: opts.align ?? "left",
      text: finalText,
      shown: "",
      st,
      size: st.size,
      editing: false,
      selAll: false,
      dyn: opts.dyn,
      sticky: opts.sticky,
      domEl: opts.domEl,
    };
    this.registerEl(el);
    return this.registerTask(
      "t:" + id,
      y,
      { type: "text", el: id, snap: opts.snap, grow: opts.grow },
      opts.deps ?? []
    );
  }

  public addGuide(
    id: string,
    axis: "x" | "y",
    pos: number,
    triggerY: number
  ): string {
    const el: SwarmGuideEl = {
      kind: "guide",
      id,
      v: 0,
      vis: false,
      dx: 0,
      dy: 0,
      axis,
      pos,
      cur: pos,
      op: 1,
      flash: 0,
      dragging: false,
    };
    this.registerEl(el);
    return this.registerTask("g:" + id, triggerY, { type: "guide", el: id }, []);
  }

  public add3D(
    id: string,
    x: number,
    y: number,
    w: number,
    h: number,
    opts: Add3DOptions = {}
  ): string {
    const buildMode = opts.buildMode ?? "all";
    const squadSize = Math.max(1, opts.squadSize ?? 4);
    const el: Swarm3DEl = {
      kind: "3d",
      id,
      v: 0,
      vis: false,
      dx: 0,
      dy: 0,
      x,
      y,
      w,
      h,
      buildMode,
      squadSize,
      progress: 0,
      phase: "idle",
      src: opts.src,
      sticky: opts.sticky,
      domEl: opts.domEl,
    };
    this.registerEl(el);
    return this.registerTask(
      "3d:" + id,
      y,
      { type: "3d", el: id, buildMode, squadSize },
      opts.deps ?? []
    );
  }

  public addDupGroup(
    groupId: string,
    sourceIds: string[],
    copySpecs: Array<{ dx: number; dy: number; edits: string[] }>
  ): void {
    const group: SwarmDupGroup = { id: groupId, ids: sourceIds, copies: [] };
    const sourceTasks = this.tasks
      .filter((t) => "el" in t.spec && sourceIds.includes(t.spec.el))
      .map((t) => t.id);
    const dupTaskIds: string[] = [];

    copySpecs.forEach((spec, idx) => {
      const clonedIds: string[] = [];
      let editCursor = 0;
      for (const srcId of sourceIds) {
        const srcEl = this.elMap.get(srcId);
        if (!srcEl) continue;
        const cloneId = `${srcId}~${idx + 1}`;
        clonedIds.push(cloneId);
        if (srcEl.kind === "text") {
          const rawEdit = spec.edits[editCursor];
          const editedText = srcEl.st.upper
            ? rawEdit?.toUpperCase()
            : rawEdit;
          this.registerEl({
            ...srcEl,
            id: cloneId,
            x: srcEl.x + spec.dx,
            y: srcEl.y + spec.dy,
            text: editedText ?? srcEl.text,
          });
          editCursor++;
        } else if (srcEl.kind === "rect") {
          this.registerEl({
            ...srcEl,
            id: cloneId,
            x: srcEl.x + spec.dx,
            y: srcEl.y + spec.dy,
          });
        }
      }
      group.copies.push({ dx: spec.dx, dy: spec.dy, ids: clonedIds });
      const minY = Math.min(
        ...clonedIds.map((cid) => {
          const n = this.elMap.get(cid);
          return n && "y" in n ? n.y : 0;
        })
      );
      dupTaskIds.push(
        this.registerTask(
          `d:${groupId}:${idx}`,
          minY,
          { type: "dup", group: groupId, k: idx },
          sourceTasks
        )
      );
    });

    group.copies.forEach((copy) =>
      copy.ids.forEach((cloneId, i) => {
        const cloneEl = this.elMap.get(cloneId);
        const srcEl = this.elMap.get(sourceIds[i]);
        if (
          cloneEl?.kind === "text" &&
          srcEl?.kind === "text" &&
          cloneEl.text !== srcEl.text
        ) {
          this.registerTask(
            "e:" + cloneId,
            cloneEl.y,
            { type: "edit", el: cloneId },
            dupTaskIds
          );
        }
      })
    );
    this.groups.push(group);
  }

  public addSectionFrame(
    name: string,
    topY: number,
    botY: number,
    reverseRule = false,
    leftX = MARGIN_LEFT,
    rightX = MARGIN_RIGHT
  ): void {
    this.defaultDeps = [];
    const [x1, x2] = reverseRule
      ? [BLEED_RIGHT, BLEED_LEFT]
      : [BLEED_LEFT, BLEED_RIGHT];
    this.addPath("rule-" + name, [
      { x: x1, y: botY },
      { x: x2, y: botY },
    ]);
    this.addPath("left-" + name, [
      { x: leftX, y: topY },
      { x: leftX, y: botY },
    ]);
    this.addPath("right-" + name, [
      { x: rightX, y: botY },
      { x: rightX, y: topY },
    ]);
  }

  public addVLine(
    id: string,
    x: number,
    y1: number,
    y2: number,
    deps?: string[]
  ): string {
    return this.addPath(
      id,
      [
        { x, y: y1 },
        { x, y: y2 },
      ],
      { deps }
    );
  }

  public addHLine(
    id: string,
    y: number,
    x1 = BLEED_LEFT,
    x2 = BLEED_RIGHT,
    deps?: string[]
  ): string {
    return this.addPath(
      id,
      [
        { x: x1, y },
        { x: x2, y },
      ],
      { deps }
    );
  }

  public addLogoMark(
    prefix: string,
    x: number,
    y: number,
    height: number,
    logoPaths = SWARM_LOGO_PATHS
  ): void {
    const tf = { x, y, s: height / 140 };
    logoPaths.forEach((part, idx) =>
      this.addPath(
        `${prefix}${idx}`,
        part.anchors.map(([ax, ay]) => ({
          x: x + ax * tf.s,
          y: y + ay * tf.s,
        })),
        {
          closed: true,
          stroke: PALETTE.ink,
          fill: PALETTE.ink,
          add: false,
          d: part.d,
          tf,
        }
      )
    );
  }

  public measureTextWidth(str: string, st: TextStyleSpec): number {
    return measureTextBlock(str, st, st.size).w;
  }

  public markStickyFrom(startIndex: number): void {
    this.els.slice(startIndex).forEach((el) => {
      el.sticky = true;
    });
  }

  public build(height: number): SwarmScene {
    return {
      els: this.els,
      tasks: this.tasks,
      groups: this.groups,
      height,
      width: this.width,
    };
  }
}
