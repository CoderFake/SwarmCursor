import {
  DESIGN_WIDTH,
  FLOCK_TARGET_CURSORS,
  INITIAL_CURSORS,
  MAX_CURSORS,
  MIN_CURSORS,
  NAV_OFFSET_TOP,
  RULER_SIZE,
} from "../core/constants";
import { clamp, stepBoidsFlock } from "../core/physics";
import { SoACursorBuffer, SwarmKernel, wasmKernel } from "../kernel";
import { defaultToolRegistry, SquadCoordinator } from "../tools";
import type {
  BoundingBox,
  BoxOverlayItem,
  MeasureOverlayItem,
  Point2D,
  SwarmCursor,
  SwarmDupGroup,
  SwarmElementNode,
  SwarmEngineOptions,
  SwarmGuideEl,
  SwarmPathEl,
  SwarmRectEl,
  SwarmTask,
  SwarmTextEl,
  ViewportState,
} from "../core/types";
import {
  computeAnchorPoint,
  computeElementBounds,
  computeSpacingMeasure,
  computeTextUnderline,
  computeUnionBounds,
  createSelectionBox,
} from "./bounds-and-overlays";
import {
  clickCoroutine,
  idleCoroutine,
  leaveCoroutine,
  moveToCoroutine,
  typeTextCoroutine,
  waitCoroutine,
} from "./cursor-motion";
import {
  getAvailableTasks,
  notifyTaskCompleted,
  pickBestTaskForCursor,
} from "./scheduler";
import {
  bumpVersion,
  createSwarmCursor,
  hydrateEngineScene,
  rand,
} from "./scene-loader";
import {
  dragGuideCoroutine,
  drawLogoCoroutine,
  drawPathCoroutine,
  drawRectCoroutine,
  drawTextCoroutine,
  duplicateGroupCoroutine,
  editTextCoroutine,
} from "./tool-coroutines";

export { bumpVersion };

export class SwarmEngine {
  public els = new Map<string, SwarmElementNode>();
  public list: SwarmElementNode[] = [];
  public tasks: Array<Required<SwarmTask>> = [];
  public byTask = new Map<string, Required<SwarmTask>>();
  public groups = new Map<string, SwarmDupGroup>();
  public cursors: SwarmCursor[] = [];
  public vp: ViewportState = {
    scrollY: 0,
    vh: 800,
    vw: 1280,
    s: 1,
    left: 0,
  };
  public started = false;
  public paused = false;
  public frontier = 0;
  public vel = 0;
  public tempo = 1;
  public tempoMultiplier = 1;
  public time = 0;
  public rulers = { want: 0, t: 0, lastNeed: -10 };
  public lastScroll = 0;
  public nextId = 0;
  public spawnCooldown = 0;
  public flocking = false;
  public done = false;
  public lastT: Point2D | null = null;
  public tv: Point2D = { x: 0, y: 0 };
  public mouse: Point2D | null = null;
  public guideDeps = new Map<string, Array<Required<SwarmTask>>>();
  public retiredWorkers = 0;
  public height = 4060;
  public designWidth = DESIGN_WIDTH;
  public kernel: SwarmKernel = wasmKernel;
  public soaBuffer: SoACursorBuffer = new SoACursorBuffer(256);
  public squadCoordinator: SquadCoordinator = new SquadCoordinator();
  private leadCursorByTask = new Map<string, number>();

  private options: SwarmEngineOptions;
  private initialCursorsCount: number;
  private minCursorsCount: number;
  private maxCursorsCount: number;
  private flockCursorsCount: number;

  constructor(options: SwarmEngineOptions = {}) {
    this.options = options;
    this.designWidth = options.designWidth ?? DESIGN_WIDTH;
    this.initialCursorsCount = options.initialCursors ?? INITIAL_CURSORS;
    this.minCursorsCount = options.minCursors ?? MIN_CURSORS;
    this.maxCursorsCount = options.maxCursors ?? MAX_CURSORS;
    this.flockCursorsCount = options.flockCursors ?? FLOCK_TARGET_CURSORS;
    this.tempoMultiplier = options.tempoMultiplier ?? 1;

    this.initScene();
  }

  private initScene(): void {
    this.leadCursorByTask.clear();
    hydrateEngineScene(
      this,
      this.options,
      this.initialCursorsCount,
      this.minCursorsCount
    );
  }

  public reset(): void {
    this.initScene();
  }

  public pause(): void {
    this.paused = true;
  }

  public resume(): void {
    this.paused = false;
  }

  public setTempoMultiplier(mult: number): void {
    this.tempoMultiplier = clamp(mult, 0.2, 10);
  }

  public makeCursor(
    x: number,
    y: number,
    home: Point2D | null = null
  ): SwarmCursor {
    return createSwarmCursor(this.nextId++, x, y, home);
  }

  public get viewTop(): number {
    return this.vp.scrollY / this.vp.s;
  }

  public get viewBot(): number {
    return (this.vp.scrollY + this.vp.vh) / this.vp.s;
  }

  public get stick(): number {
    return Math.max(
      0,
      this.viewTop + (RULER_SIZE * this.rulers.t) / this.vp.s - NAV_OFFSET_TOP
    );
  }

  public isSticky(task: SwarmTask): boolean {
    const spec = task.spec;
    const elId =
      spec.type === "dup"
        ? this.groups.get(spec.group)?.ids[0] ?? ""
        : spec.el;
    return !!this.els.get(elId)?.sticky;
  }

  public fromViewport(clientX: number, clientY: number): Point2D {
    return {
      x: (clientX - this.vp.left) / this.vp.s,
      y: (this.vp.scrollY + clientY) / this.vp.s,
    };
  }

  public start(): void {
    if (!this.started) {
      this.started = true;
      for (const c of this.cursors) {
        c.follow = false;
        c.gen = null;
        c.angle = (((c.angle + 180) % 360) + 360) % 360 - 180;
      }
    }
  }

  public bounds(el: SwarmElementNode): BoundingBox {
    return computeElementBounds(el);
  }

  public unionBounds(ids: string[]): BoundingBox {
    return computeUnionBounds(this, ids);
  }

  public textUnderline(el: SwarmTextEl): BoundingBox {
    return computeTextUnderline(this, el);
  }

  public selection(
    el: SwarmElementNode,
    extra: Partial<BoxOverlayItem> = {}
  ): BoxOverlayItem {
    return createSelectionBox(this, el, extra);
  }

  public anchor(pt: Point2D): Point2D | (() => Point2D) {
    return computeAnchorPoint(this, pt);
  }

  public spacing(
    boxA: BoundingBox,
    boxB: BoundingBox
  ): MeasureOverlayItem | null {
    return computeSpacingMeasure(boxA, boxB);
  }

  public setScroll(scrollY: number): void {
    this.vp.scrollY = scrollY;
    if (scrollY > 4) this.start();
  }

  public step(dt: number): void {
    if (this.paused) return;
    dt = Math.min(dt, 0.05);
    this.time += dt;

    const scale = this.vp.s;
    const instantVel =
      Math.abs(this.vp.scrollY - this.lastScroll) /
      scale /
      Math.max(dt, 0.001);
    this.lastScroll = this.vp.scrollY;
    this.vel = Math.max(
      this.vel * Math.exp(-dt * 1.2),
      this.vel * 0.7 + instantVel * 0.3
    );

    if (this.started) {
      const isDomScene = this.list.some((el) => el.domEl);
      const maxScroll = Math.max(1, this.height * this.vp.s - this.vp.vh);
      if (this.vp.scrollY <= 24) {
        const initialCap = isDomScene
          ? this.viewTop + this.vp.vh * 0.82
          : Math.min(650, this.viewTop + (this.viewBot - this.viewTop) * 0.82);
        this.frontier = Math.max(this.frontier, initialCap);
      } else if (this.vp.scrollY >= maxScroll - 32) {
        this.frontier = Math.max(this.frontier, this.height + 200);
      } else {
        const scrollRatio = clamp(this.vp.scrollY / maxScroll, 0, 1);
        const viewportSpan = this.viewBot - this.viewTop;
        const viewFrontier = this.viewTop + viewportSpan * 0.86;
        const proportionalFrontier = 650 + scrollRatio * (this.height - 450);
        this.frontier = Math.max(
          this.frontier,
          viewFrontier,
          proportionalFrontier
        );
      }

      // On mobile artboards (`s < 0.65`), multiple sections fit inside a single screen height;
      // advance `frontier` automatically as current frontier tasks finish so it never stalls before the bottom.
      if (!isDomScene && this.vp.s < 0.65 && this.frontier < this.height + 200) {
        const hasPendingBeforeFrontier = this.tasks.some(
          (t) => t.state !== "done" && t.y <= this.frontier
        );
        if (!hasPendingBeforeFrontier) {
          this.frontier = Math.min(this.height + 200, this.frontier + 480);
        }
      }
    }

    const avail = this.started ? this.available() : [];
    const activeCount = this.cursors.filter((c) => c.task).length;

    this.tempo =
      clamp(
        2.1 +
          this.vel / 900 +
          (avail.length / Math.max(1, this.cursors.length)) * 0.5,
        2.1,
        4.5
      ) * this.tempoMultiplier;

    if (this.rulers.want > 0) {
      this.rulers.lastNeed = this.time;
    }
    const rulerTarget = this.time - this.rulers.lastNeed < 0.7 ? 1 : 0;
    this.rulers.t += (rulerTarget - this.rulers.t) * Math.min(1, dt * 10);
    if (Math.abs(rulerTarget - this.rulers.t) < 0.002) {
      this.rulers.t = rulerTarget;
    }

    for (const el of this.list) {
      if (el.kind !== "guide" || !el.vis) continue;
      if (el.flash > 0) {
        el.flash = Math.max(0, el.flash - dt * 1.5);
        bumpVersion(el);
      }
      const deps = this.guideDeps.get(el.id) ?? [];
      if (!el.dragging && deps.every((d) => d.state === "done")) {
        const lastDone =
          deps.length > 0 ? Math.max(...deps.map((d) => d.doneAt)) : 0;
        if (this.time - lastDone > 1.2 && el.op > 0) {
          el.op = Math.max(0, el.op - dt * 1.2);
          bumpVersion(el);
        }
      }
    }

    if (
      !this.flocking &&
      this.started &&
      this.tasks.every((t) => t.state !== "wait")
    ) {
      for (const c of this.cursors) {
        if (!c.task && !c.follow) {
          c.follow = true;
          c.gen = null;
          c.leaving = false;
          c.ov = null;
          c.shape = "arrow";
        }
      }
      if (this.cursors.every((c) => c.follow)) {
        this.flocking = true;
        this.done = true;
        this.options.onAllTasksDone?.();
      }
    }

    if (this.flocking) {
      this.flock(dt);
      return;
    }

    if (!this.started) {
      const center = this.fromViewport(this.vp.vw / 2, this.vp.vh / 2);
      if (this.follow(dt, this.cursors, center, 0.7)) {
        this.start();
      }
      return;
    }

    if (this.cursors.some((c) => c.follow)) {
      this.follow(
        dt,
        this.cursors.filter((c) => c.follow)
      );
    }

    this.spawnCooldown -= dt;
    const desiredWorkers = clamp(
      this.minCursorsCount +
        Math.floor(this.vel / 50) +
        Math.floor(avail.length / 3),
      this.minCursorsCount,
      this.maxCursorsCount
    );
    const currentWorkers = this.cursors.filter((c) => !c.leaving).length;

    if (
      this.started &&
      currentWorkers < desiredWorkers &&
      avail.length > currentWorkers - activeCount &&
      this.spawnCooldown <= 0
    ) {
      const fromLeft = Math.random() < 0.5;
      const pos = this.fromViewport(
        fromLeft ? -40 : this.vp.vw + 40,
        rand(0.2, 0.8) * this.vp.vh
      );
      this.cursors.push(this.makeCursor(pos.x, pos.y));
      this.spawnCooldown = 0.035;
    }

    const idleCursors = this.cursors.filter(
      (c) => !c.task && !c.leaving && !c.follow && this.started
    );

    if (
      idleCursors.length > 1 &&
      avail.length > 1 &&
      this.kernel.isWasmAccelerated &&
      this.pick === SwarmEngine.prototype.pick
    ) {
      const taskInputs = avail.map((t) => {
        const elId =
          "el" in t.spec
            ? t.spec.el
            : this.groups.get(t.spec.group)?.copies[t.spec.k]?.ids[0] ?? "";
        const elNode = this.els.get(elId);
        const tx =
          elNode && "x" in elNode ? elNode.x + elNode.dx : this.designWidth * 0.5;
        return {
          x: tx,
          y: t.y,
          state: 1 as const,
          activeWorkers: 0,
          maxSquad: 1,
          progress: 0,
        };
      });
      const bids = this.kernel.auctionTasksBatch(
        idleCursors.map((c) => ({ x: c.x, y: c.y })),
        taskInputs,
        this.viewTop - 40,
        this.viewBot,
        this.frontier
      );
      const assignedTasks = new Set<Required<SwarmTask>>();
      for (let i = 0; i < idleCursors.length; i++) {
        const c = idleCursors[i];
        const bid = bids[i];
        const task = bid && bid.taskIdx >= 0 ? avail[bid.taskIdx] : null;
        if (task && !assignedTasks.has(task)) {
          assignedTasks.add(task);
          task.state = "active";
          c.task = task;
          this.leadCursorByTask.set(task.id, c.id);
          c.worked = true;
          if (this.isSticky(task)) {
            c.sticky = true;
            c.y -= this.stick;
          }
          c.idleFor = 0;
          c.gen = this.run(c, task);
        } else {
          this.squadCoordinator.tryAssignAssistant(this, c);
        }
      }
    } else {
      for (const c of idleCursors) {
        const task = this.pick(c, avail);
        if (task) {
          avail.splice(avail.indexOf(task), 1);
          task.state = "active";
          c.task = task;
          this.leadCursorByTask.set(task.id, c.id);
          c.worked = true;
          if (this.isSticky(task)) {
            c.sticky = true;
            c.y -= this.stick;
          }
          c.idleFor = 0;
          c.gen = this.run(c, task);
        } else {
          this.squadCoordinator.tryAssignAssistant(this, c);
        }
      }
    }

    for (const c of [...this.cursors]) {
      if (c.follow) continue;
      c.press = Math.max(0, c.press - dt * 6);
      if (c.angle !== 0) {
        c.angle =
          Math.abs(c.angle) < 0.5 ? 0 : c.angle * (1 - Math.min(1, dt * 10));
      }
      if (!c.task) {
        c.idleFor += dt;
        if (
          !c.leaving &&
          this.started &&
          c.idleFor > 2.5 &&
          this.cursors.filter((w) => !w.leaving).length > this.minCursorsCount &&
          !c.home
        ) {
          c.leaving = true;
          c.gen = this.leave(c);
        }
        if (!c.gen) {
          c.gen = this.idle(c);
        }
      }
      if (c.gen && c.gen.next(dt).done) {
        if (c.task) {
          const finishedTask = c.task;
          const leadId = this.leadCursorByTask.get(finishedTask.id);
          c.task = null;
          c.ov = null;
          if (c.sticky) {
            c.sticky = false;
            c.y += this.stick;
          }
          c.shape = "arrow";
          if (leadId === undefined || leadId === c.id) {
            finishedTask.state = "done";
            finishedTask.doneAt = this.time;
            this.leadCursorByTask.delete(finishedTask.id);
            notifyTaskCompleted(this, finishedTask, this.options.onElementDone);
          }
        }
        c.gen = null;
        if (c.leaving) {
          if (c.worked) this.retiredWorkers++;
          this.cursors.splice(this.cursors.indexOf(c), 1);
        }
      }
    }

    this.soaBuffer.syncFromCursors(this.cursors);
  }

  public flockTarget(): Point2D {
    if (this.mouse) {
      return this.fromViewport(this.mouse.x, this.mouse.y);
    }
    const t = this.time;
    return this.fromViewport(
      this.vp.vw * (0.5 + 0.28 * Math.sin(t * 0.37)),
      this.vp.vh * (0.5 + 0.25 * Math.sin(t * 0.53 + 1))
    );
  }

  public flock(dt: number): void {
    this.spawnCooldown -= dt;
    if (
      this.cursors.length < this.flockCursorsCount &&
      this.spawnCooldown <= 0
    ) {
      const fromLeft = Math.random() < 0.5;
      const pos = this.fromViewport(
        fromLeft ? -30 : this.vp.vw + 30,
        rand(0.1, 0.9) * this.vp.vh
      );
      const cursor = this.makeCursor(pos.x, pos.y);
      cursor.follow = true;
      this.cursors.push(cursor);
      this.spawnCooldown = 0.04;
    }
    this.follow(dt, this.cursors);
  }

  public follow(
    dt: number,
    cursors: SwarmCursor[],
    explicitCenter?: Point2D,
    radiusScale = 1
  ): boolean {
    const mouseWorld = this.mouse
      ? this.fromViewport(this.mouse.x, this.mouse.y)
      : null;
    const center = explicitCenter ?? this.flockTarget();
    const ctx = {
      time: this.time,
      mouseWorld,
      lastMouseWorld: this.lastT,
      mouseVel: this.tv,
    };
    const touched = stepBoidsFlock(dt, cursors, center, ctx, radiusScale);
    this.lastT = ctx.lastMouseWorld;
    return touched;
  }

  public available(): Array<Required<SwarmTask>> {
    return getAvailableTasks(this);
  }

  public pick(
    cursor: SwarmCursor,
    avail: Array<Required<SwarmTask>>
  ): Required<SwarmTask> | null {
    return pickBestTaskForCursor(this, cursor, avail);
  }

  public *wait(seconds: number): Generator<void, void, number> {
    yield* waitCoroutine(this, seconds);
  }

  public *moveTo(
    cursor: SwarmCursor,
    targetOrFn: Point2D | (() => Point2D),
    opts: {
      speed?: number;
      drag?: boolean;
      bend?: number;
      onStep?: () => void;
    } = {}
  ): Generator<void, void, number> {
    yield* moveToCoroutine(this, cursor, targetOrFn, opts);
  }

  public *click(cursor: SwarmCursor): Generator<void, void, number> {
    yield* clickCoroutine(this, cursor);
  }

  public *type(
    el: SwarmTextEl,
    str: string,
    replaceAll = false
  ): Generator<void, void, number> {
    yield* typeTextCoroutine(this, el, str, replaceAll);
  }

  public *idle(cursor: SwarmCursor): Generator<void, void, number> {
    yield* idleCoroutine(this, cursor);
  }

  public *leave(cursor: SwarmCursor): Generator<void, void, number> {
    yield* leaveCoroutine(this, cursor);
  }

  public run(
    cursor: SwarmCursor,
    task: Required<SwarmTask>
  ): Generator<void, void, number> {
    const spec = task.spec;
    const plugin = defaultToolRegistry.get(spec.type);
    if (plugin) {
      return plugin.runLead(this, cursor, task);
    }
    switch (spec.type) {
      case "path":
        return this.drawPath(cursor, this.els.get(spec.el) as SwarmPathEl);
      case "rect":
        return this.drawRect(cursor, this.els.get(spec.el) as SwarmRectEl);
      case "text":
        return this.drawText(
          cursor,
          this.els.get(spec.el) as SwarmTextEl,
          spec.snap ? (this.els.get(spec.snap) as SwarmGuideEl) : null,
          !!spec.grow
        );
      case "guide":
        return this.dragGuide(cursor, this.els.get(spec.el) as SwarmGuideEl);
      case "dup":
        return this.duplicate(cursor, this.groups.get(spec.group)!, spec.k);
      case "edit":
        return this.editText(cursor, this.els.get(spec.el) as SwarmTextEl);
      case "3d":
        return defaultToolRegistry.get("3d")!.runLead(this, cursor, task);
      case "image":
        return defaultToolRegistry.get("image")!.runLead(this, cursor, task);
    }
  }

  public *drawPath(
    cursor: SwarmCursor,
    el: SwarmPathEl
  ): Generator<void, void, number> {
    yield* drawPathCoroutine(this, cursor, el);
  }

  public *drawLogo(
    cursor: SwarmCursor,
    el: SwarmPathEl
  ): Generator<void, void, number> {
    yield* drawLogoCoroutine(this, cursor, el);
  }

  public *drawRect(
    cursor: SwarmCursor,
    el: SwarmRectEl
  ): Generator<void, void, number> {
    yield* drawRectCoroutine(this, cursor, el);
  }

  public *drawText(
    cursor: SwarmCursor,
    el: SwarmTextEl,
    guide: SwarmGuideEl | null,
    grow: boolean
  ): Generator<void, void, number> {
    yield* drawTextCoroutine(this, cursor, el, guide, grow);
  }

  public *dragGuide(
    cursor: SwarmCursor,
    guide: SwarmGuideEl
  ): Generator<void, void, number> {
    yield* dragGuideCoroutine(this, cursor, guide);
  }

  public *duplicate(
    cursor: SwarmCursor,
    group: SwarmDupGroup,
    copyIdx: number
  ): Generator<void, void, number> {
    yield* duplicateGroupCoroutine(this, cursor, group, copyIdx);
  }

  public *editText(
    cursor: SwarmCursor,
    el: SwarmTextEl
  ): Generator<void, void, number> {
    yield* editTextCoroutine(this, cursor, el);
  }
}
