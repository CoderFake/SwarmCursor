import {
  AGENT_COLORS,
  AGENT_NAMES,
  BLEED_LEFT,
  BLEED_RIGHT,
  DESIGN_WIDTH,
  FLOCK_TARGET_CURSORS,
  INITIAL_CURSORS,
  MAX_CURSORS,
  MIN_CURSORS,
  NAV_OFFSET_TOP,
  RULER_SIZE,
} from "./constants";
import { clamp, stepBoidsFlock } from "./physics";
import { getLineHeightPx, measureTextBlock } from "./text-measure";
import { buildSwarmLandingScene } from "../presets/swarm-landing";
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
  SwarmOverlayItem,
  SwarmPathEl,
  SwarmRectEl,
  SwarmTask,
  SwarmTextEl,
  ViewportState,
} from "./types";

const rand = (min: number, max: number): number =>
  min + Math.random() * (max - min);

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export const bumpVersion = (el: SwarmElementNode): void => {
  el.v++;
};

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
  public lastT: Point2D | null = null;
  public tv: Point2D = { x: 0, y: 0 };
  public mouse: Point2D | null = null;
  public guideDeps = new Map<string, Array<Required<SwarmTask>>>();
  public retiredWorkers = 0;
  public height = 4060;
  public designWidth = DESIGN_WIDTH;

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
    this.els.clear();
    this.list = [];
    this.tasks = [];
    this.byTask.clear();
    this.groups.clear();
    this.cursors = [];
    this.guideDeps.clear();
    this.started = false;
    this.flocking = false;
    this.frontier = 0;
    this.vel = 0;
    this.time = 0;
    this.retiredWorkers = 0;
    this.rulers = { want: 0, t: 0, lastNeed: -10 };

    const getWorkerCount = () =>
      this.cursors.filter((c) => c.worked).length + this.retiredWorkers;

    const scene =
      typeof this.options.scene === "function"
        ? this.options.scene(getWorkerCount)
        : this.options.scene ?? buildSwarmLandingScene(getWorkerCount);

    this.height = scene.height;
    if (scene.width) this.designWidth = scene.width;

    for (const el of scene.els) {
      const copy = { ...el, v: 0, vis: false, dx: 0, dy: 0 } as SwarmElementNode;
      if (copy.kind === "text") {
        copy.shown = "";
        copy.editing = false;
        copy.selAll = false;
        copy.size = copy.st.size;
      } else if (copy.kind === "rect") {
        copy.draw = null;
        copy.styled = false;
      } else if (copy.kind === "path") {
        copy.placed = 0;
        copy.shut = false;
        copy.edit = false;
        copy.owner = null;
        copy.fillOn = false;
      } else if (copy.kind === "guide") {
        copy.cur = copy.pos;
        copy.op = 1;
        copy.flash = 0;
        copy.dragging = false;
      }
      this.els.set(copy.id, copy);
      this.list.push(copy);
    }

    for (const task of scene.tasks) {
      const taskState: Required<SwarmTask> = {
        ...task,
        state: "wait",
        doneAt: 0,
      };
      this.tasks.push(taskState);
      this.byTask.set(task.id, taskState);
      if (task.spec.type === "text" && task.spec.snap) {
        const list = this.guideDeps.get(task.spec.snap) ?? [];
        list.push(taskState);
        this.guideDeps.set(task.spec.snap, list);
      }
    }

    for (const group of scene.groups) {
      this.groups.set(group.id, group);
    }

    for (let i = 0; i < this.initialCursorsCount; i++) {
      const angle = (i / this.initialCursorsCount) * Math.PI * 2;
      const cursor = this.makeCursor(
        this.designWidth / 2 + Math.cos(angle) * 160,
        400 + Math.sin(angle) * 160,
        i < this.minCursorsCount ? { x: 0, y: 0 } : null
      );
      cursor.follow = true;
      this.cursors.push(cursor);
    }
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
    const id = this.nextId++;
    const isFast = Math.random() < 0.25;
    return {
      id,
      x,
      y,
      home,
      name: AGENT_NAMES[id % AGENT_NAMES.length],
      color: AGENT_COLORS[id % AGENT_COLORS.length],
      shape: "arrow",
      press: 0,
      task: null,
      gen: null,
      ov: null,
      idleFor: 0,
      leaving: false,
      worked: false,
      sticky: false,
      vx: 0,
      vy: 0,
      angle: 0,
      ...(isFast
        ? {
            speed: rand(1000, 1500),
            force: rand(3500, 6000),
            spin: rand(2.2, 3.4),
          }
        : {
            speed: rand(300, 750),
            force: rand(700, 1800),
            spin: rand(0.8, 1.8),
          }),
      curl: rand(-1, 1),
      ph: rand(0, Math.PI * 2),
      orbit: rand(70, 170),
      follow: false,
    };
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
    if (el.kind === "text") {
      const m = measureTextBlock(el.shown || " ", el.st, el.size, el.w);
      return {
        x: el.x + el.dx,
        y: el.y + el.dy,
        w: el.w ?? Math.max(m.w, 2),
        h: Math.max(m.h, getLineHeightPx(el.st, el.size)),
      };
    }
    if (el.kind === "rect") {
      return {
        x: el.x + el.dx,
        y: el.y + el.dy,
        w: el.draw?.w ?? el.w,
        h: el.draw?.h ?? el.h,
      };
    }
    if (el.kind === "path") {
      const xs = el.pts.map((p) => p.x);
      const ys = el.pts.map((p) => p.y);
      return {
        x: Math.min(...xs),
        y: Math.min(...ys),
        w: Math.max(...xs) - Math.min(...xs),
        h: Math.max(...ys) - Math.min(...ys),
      };
    }
    return { x: el.pos, y: 0, w: 0, h: 0 };
  }

  public unionBounds(ids: string[]): BoundingBox {
    const boxes = ids
      .map((id) => this.els.get(id))
      .filter((e): e is SwarmElementNode => !!e)
      .map((e) => this.bounds(e));
    if (boxes.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
    const minX = Math.min(...boxes.map((b) => b.x));
    const minY = Math.min(...boxes.map((b) => b.y));
    return {
      x: minX,
      y: minY,
      w: Math.max(...boxes.map((b) => b.x + b.w)) - minX,
      h: Math.max(...boxes.map((b) => b.y + b.h)) - minY,
    };
  }

  public textUnderline(el: SwarmTextEl): BoundingBox {
    const m = measureTextBlock(el.shown || " ", el.st, el.size, el.w);
    const b = this.bounds(el);
    const firstLineW = m.lines[0] ?? 0;
    return {
      x: el.align === "center" && el.w ? b.x + (el.w - firstLineW) / 2 : b.x,
      y: b.y + getLineHeightPx(el.st, el.size) * 0.5 + el.size * 0.42,
      w: firstLineW,
      h: 0,
    };
  }

  public selection(
    el: SwarmElementNode,
    extra: Partial<BoxOverlayItem> = {}
  ): BoxOverlayItem {
    const b = this.bounds(el);
    return {
      t: "box",
      b,
      handles: true,
      badge: `${Math.round(b.w)} × ${Math.round(b.h)}`,
      rulerLines: true,
      underline: el.kind === "text" ? this.textUnderline(el) : undefined,
      ...extra,
    };
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
      this.frontier = Math.max(this.frontier, this.viewBot);
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

    for (const c of this.cursors) {
      if (c.task || c.leaving || c.follow || !this.started) continue;
      const task = this.pick(c, avail);
      if (task) {
        avail.splice(avail.indexOf(task), 1);
        task.state = "active";
        c.task = task;
        c.worked = true;
        if (this.isSticky(task)) {
          c.sticky = true;
          c.y -= this.stick;
        }
        c.idleFor = 0;
        c.gen = this.run(c, task);
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
          c.task.state = "done";
          c.task.doneAt = this.time;
          this.notifyTaskDone(c.task);
          c.task = null;
          c.ov = null;
          if (c.sticky) {
            c.sticky = false;
            c.y += this.stick;
          }
          c.shape = "arrow";
        }
        c.gen = null;
        if (c.leaving) {
          if (c.worked) this.retiredWorkers++;
          this.cursors.splice(this.cursors.indexOf(c), 1);
        }
      }
    }
  }

  private notifyTaskDone(task: Required<SwarmTask>): void {
    const spec = task.spec;
    if ("el" in spec) {
      const el = this.els.get(spec.el);
      if (el) {
        if (el.domEl) {
          el.domEl.setAttribute("data-swarm-done", "true");
        }
        this.options.onElementDone?.(el);
      }
    } else if (spec.type === "dup") {
      const group = this.groups.get(spec.group);
      const copy = group?.copies[spec.k];
      copy?.ids.forEach((id) => {
        const el = this.els.get(id);
        if (el) {
          if (el.domEl) {
            el.domEl.setAttribute("data-swarm-done", "true");
          }
          this.options.onElementDone?.(el);
        }
      });
    }
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
    const out: Array<Required<SwarmTask>> = [];
    for (const t of this.tasks) {
      if (t.state !== "wait" || t.y > this.frontier) continue;
      if (t.deps.every((depId) => this.byTask.get(depId)?.state === "done")) {
        out.push(t);
      }
    }
    return out;
  }

  public pick(
    cursor: SwarmCursor,
    avail: Array<Required<SwarmTask>>
  ): Required<SwarmTask> | null {
    let best: Required<SwarmTask> | null = null;
    let bestScore = Infinity;
    const top = this.viewTop - 40;
    const bot = this.viewBot;

    for (const task of avail) {
      const bucket = task.y >= top && task.y <= bot ? 0 : task.y < top ? 1 : 2;
      const score =
        bucket * 1e6 +
        (bucket === 1 ? top - task.y : task.y) * 0.6 +
        Math.abs(task.y - cursor.y) * 0.4;
      if (score < bestScore) {
        bestScore = score;
        best = task;
      }
    }
    return best;
  }

  public *wait(seconds: number): Generator<void, void, number> {
    let elapsed = 0;
    while (elapsed < seconds) {
      const dt = yield;
      elapsed += (dt ?? 0.016) * this.tempo;
    }
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
    const getTarget =
      typeof targetOrFn === "function" ? targetOrFn : () => targetOrFn;
    const startX = cursor.x;
    const startY = cursor.y;
    const initialTarget = getTarget();
    const dist = Math.hypot(initialTarget.x - startX, initialTarget.y - startY);

    if (dist < 0.5) {
      cursor.x = initialTarget.x;
      cursor.y = initialTarget.y;
      opts.onStep?.();
      return;
    }

    const duration =
      clamp(0.12 + Math.sqrt(dist) * 0.021, 0.14, 0.9) / (opts.speed ?? 1);
    const arcBend =
      (opts.bend ?? (Math.random() < 0.5 ? -1 : 1) * rand(0.04, 0.14)) *
      Math.min(dist, 600);

    let elapsed = 0;
    while (elapsed < duration) {
      const dt = yield;
      elapsed += (dt ?? 0.016) * this.tempo;
      const progress = Math.min(1, elapsed / duration);
      const eased =
        opts.drag || progress < 0.15
          ? easeInOutCubic(progress)
          : easeOutCubic(progress);
      const target = getTarget();
      const dx = target.x - startX;
      const dy = target.y - startY;
      const len = Math.hypot(dx, dy) || 1;
      const normalOffset = Math.sin(Math.PI * eased) * arcBend;
      cursor.x = startX + dx * eased + (-dy / len) * normalOffset;
      cursor.y = startY + dy * eased + (dx / len) * normalOffset;
      opts.onStep?.();
    }

    const finalTarget = getTarget();
    cursor.x = finalTarget.x;
    cursor.y = finalTarget.y;
    opts.onStep?.();
  }

  public *click(cursor: SwarmCursor): Generator<void, void, number> {
    cursor.press = 1;
    yield* this.wait(0.07);
  }

  public *type(
    el: SwarmTextEl,
    str: string,
    replaceAll = false
  ): Generator<void, void, number> {
    for (let i = 0; i < str.length; i++) {
      if (i === 0 && replaceAll) el.shown = "";
      el.shown += str[i];
      el.selAll = false;
      bumpVersion(el);
      let delay = rand(0.012, 0.04);
      if (str[i] === " ") delay += rand(0, 0.03);
      if (str[i] === "\n") delay += 0.1;
      if (Math.random() < 0.025) delay += rand(0.08, 0.2);
      yield* this.wait(delay);
    }
  }

  public *idle(cursor: SwarmCursor): Generator<void, void, number> {
    if (!this.started && cursor.home) {
      const home = cursor.home;
      const phase = rand(0, 6);
      while (!this.started) {
        const t = this.time;
        cursor.x = home.x + Math.sin(t * 1.3 + phase) * 3;
        cursor.y = home.y + Math.cos(t * 1.7 + phase) * 2.5;
        yield;
      }
    }
    for (;;) {
      const top = this.viewTop;
      const bot = this.viewBot;
      const dest = {
        x: rand(220, 1060),
        y: rand(top + (bot - top) * 0.2, top + (bot - top) * 0.8),
      };
      yield* this.moveTo(cursor, dest, { speed: 0.35 });
      let pause = rand(0.4, 1.4);
      while (pause > 0) {
        const dt = yield;
        pause -= dt ?? 0.016;
        if (cursor.y < this.viewTop || cursor.y > this.viewBot) break;
      }
    }
  }

  public *leave(cursor: SwarmCursor): Generator<void, void, number> {
    const exitRight = cursor.x > this.designWidth / 2;
    yield* this.moveTo(
      cursor,
      () =>
        this.fromViewport(
          exitRight ? this.vp.vw + 60 : -60,
          (cursor.y - this.viewTop) * this.vp.s
        ),
      { speed: 0.8 }
    );
  }

  public run(
    cursor: SwarmCursor,
    task: Required<SwarmTask>
  ): Generator<void, void, number> {
    const spec = task.spec;
    switch (spec.type) {
      case "path":
        return this.drawPath(
          cursor,
          this.els.get(spec.el) as SwarmPathEl
        );
      case "rect":
        return this.drawRect(
          cursor,
          this.els.get(spec.el) as SwarmRectEl
        );
      case "text":
        return this.drawText(
          cursor,
          this.els.get(spec.el) as SwarmTextEl,
          spec.snap ? (this.els.get(spec.snap) as SwarmGuideEl) : null,
          !!spec.grow
        );
      case "guide":
        return this.dragGuide(
          cursor,
          this.els.get(spec.el) as SwarmGuideEl
        );
      case "dup":
        return this.duplicate(
          cursor,
          this.groups.get(spec.group)!,
          spec.k
        );
      case "edit":
        return this.editText(
          cursor,
          this.els.get(spec.el) as SwarmTextEl
        );
    }
  }

  public anchor(pt: Point2D): Point2D | (() => Point2D) {
    if (pt.x <= BLEED_LEFT) {
      return () => ({ x: this.fromViewport(6, 0).x, y: pt.y });
    }
    if (pt.x >= BLEED_RIGHT) {
      return () => ({ x: this.fromViewport(this.vp.vw - 6, 0).x, y: pt.y });
    }
    return pt;
  }

  public *drawPath(
    cursor: SwarmCursor,
    el: SwarmPathEl
  ): Generator<void, void, number> {
    if (el.d) return yield* this.drawLogo(cursor, el);
    cursor.shape = el.add ? "pen-add" : "pen";
    yield* this.moveTo(cursor, this.anchor(el.pts[0]));
    yield* this.click(cursor);
    el.vis = true;
    el.edit = true;
    el.placed = 1;
    el.owner = cursor.id;
    bumpVersion(el);
    cursor.shape = "pen";

    for (let i = 1; i < el.pts.length; i++) {
      yield* this.moveTo(cursor, this.anchor(el.pts[i]), {
        bend: rand(-0.03, 0.03),
      });
      yield* this.click(cursor);
      el.placed = i + 1;
      bumpVersion(el);
      yield* this.wait(rand(0.04, 0.12));
    }

    if (el.closed) {
      cursor.shape = "pen-close";
      yield* this.moveTo(cursor, el.pts[0], { bend: rand(-0.03, 0.03) });
      yield* this.click(cursor);
      el.shut = true;
      bumpVersion(el);
    }

    el.owner = null;
    bumpVersion(el);
    cursor.shape = "pen";
    yield* this.moveTo(
      cursor,
      { x: cursor.x + rand(14, 30), y: cursor.y + rand(10, 24) },
      { speed: 1.4 }
    );
    yield* this.wait(0.3);
    el.edit = false;
    if (el.fill) el.fillOn = true;
    bumpVersion(el);
  }

  public *drawLogo(
    cursor: SwarmCursor,
    el: SwarmPathEl
  ): Generator<void, void, number> {
    cursor.shape = "pen";
    yield* this.moveTo(cursor, this.anchor(el.pts[0]));
    el.vis = true;
    el.placed = 1;
    bumpVersion(el);
    for (let i = 1; i <= el.pts.length; i++) {
      yield* this.moveTo(cursor, el.pts[i % el.pts.length], { speed: 1.6 });
      el.placed = i + 1;
      bumpVersion(el);
    }
    el.shut = true;
    el.fillOn = true;
    bumpVersion(el);
    yield* this.moveTo(
      cursor,
      { x: cursor.x + rand(14, 30), y: cursor.y + rand(10, 24) },
      { speed: 1.4 }
    );
  }

  public *drawRect(
    cursor: SwarmCursor,
    el: SwarmRectEl
  ): Generator<void, void, number> {
    cursor.shape = "cross";
    yield* this.moveTo(cursor, { x: el.x, y: el.y });
    cursor.press = 1;
    el.vis = true;
    el.draw = { w: 0, h: 0 };
    bumpVersion(el);
    cursor.ov = () => [this.selection(el)];

    yield* this.moveTo(
      cursor,
      { x: el.x + el.w, y: el.y + el.h },
      {
        speed: 0.75,
        drag: true,
        bend: 0,
        onStep: () => {
          el.draw = {
            w: Math.max(0, cursor.x - el.x),
            h: Math.max(0, cursor.y - el.y),
          };
          bumpVersion(el);
        },
      }
    );

    el.draw = null;
    bumpVersion(el);
    cursor.shape = "arrow";
    yield* this.wait(rand(0.18, 0.3));
    el.styled = true;
    bumpVersion(el);
    yield* this.wait(0.35);
    cursor.ov = null;
  }

  public *drawText(
    cursor: SwarmCursor,
    el: SwarmTextEl,
    guide: SwarmGuideEl | null,
    grow: boolean
  ): Generator<void, void, number> {
    if (el.dyn) el.text = el.dyn();
    if (guide) {
      if (guide.axis === "x") {
        el.dx = rand(28, 64);
        el.dy = rand(-8, 8);
      } else {
        el.dx = rand(-8, 8);
        el.dy = rand(18, 34) * (Math.random() < 0.5 ? -1 : 1);
      }
    }
    if (grow) el.size = 18;

    const startX = el.x + el.dx;
    const startY = el.y + el.dy;
    cursor.shape = "cross";
    yield* this.moveTo(cursor, { x: startX, y: startY });

    if (el.w == null) {
      yield* this.click(cursor);
      el.vis = true;
      el.editing = true;
      bumpVersion(el);
    } else {
      cursor.press = 1;
      const tempRect: SwarmRectEl = {
        kind: "rect",
        id: "",
        v: 0,
        vis: true,
        dx: 0,
        dy: 0,
        x: startX,
        y: startY,
        w: 0,
        h: 0,
        r: 0,
        fill: "",
        draw: null,
        styled: true,
      };
      const boxH = getLineHeightPx(el.st, el.size);
      cursor.ov = () => [this.selection(tempRect)];
      yield* this.moveTo(
        cursor,
        { x: startX + el.w, y: startY + boxH },
        {
          speed: 0.9,
          drag: true,
          bend: 0,
          onStep: () => {
            tempRect.w = Math.max(0, cursor.x - startX);
            tempRect.h = Math.max(0, cursor.y - startY);
          },
        }
      );
      el.vis = true;
      el.editing = true;
      bumpVersion(el);
    }

    cursor.shape = "ibeam";
    cursor.ov = () => [{ t: "box", b: this.bounds(el) }];
    yield* this.moveTo(
      cursor,
      { x: cursor.x + rand(-30, 10), y: cursor.y + rand(10, 30) },
      { speed: 1.5 }
    );
    yield* this.type(el, el.text);
    yield* this.wait(0.12);
    el.editing = false;
    bumpVersion(el);

    cursor.shape = "arrow";
    cursor.ov = () => [this.selection(el)];

    if (grow) {
      const steps = [24, 32, 40, 48, 56, 64, 72].filter((s) => s < el.st.size);
      for (const sz of [...steps, el.st.size]) {
        yield* this.wait(0.06);
        el.size = sz;
        bumpVersion(el);
      }
      yield* this.wait(0.15);
    }

    if (guide) {
      const guideTask = this.byTask.get("g:" + guide.id);
      while (guideTask && guideTask.state !== "done") yield;

      const b = this.bounds(el);
      const grabPt = {
        x: b.x + Math.min(b.w * 0.4, 60) + rand(-6, 6),
        y: b.y + Math.min(b.h * 0.5, 22),
      };
      yield* this.moveTo(cursor, grabPt);
      cursor.press = 1;

      const targetGrab = { x: grabPt.x - el.dx, y: grabPt.y - el.dy };
      const overshootGrab = {
        x: targetGrab.x + (guide.axis === "x" ? -rand(2, 5) : rand(-6, 6)),
        y: targetGrab.y + (guide.axis === "y" ? -rand(2, 5) : rand(-3, 3)),
      };

      const onDragStep = () => {
        let nx = cursor.x - targetGrab.x;
        let ny = cursor.y - targetGrab.y;
        if (guide.axis === "x" && Math.abs(nx) < 9) {
          if (nx !== 0 && el.dx !== 0) guide.flash = 1;
          nx = 0;
        }
        if (guide.axis === "y" && Math.abs(ny) < 9) {
          if (ny !== 0 && el.dy !== 0) guide.flash = 1;
          ny = 0;
        }
        el.dx = nx;
        el.dy = ny;
        bumpVersion(el);
        bumpVersion(guide);
      };

      yield* this.moveTo(cursor, overshootGrab, {
        speed: 0.6,
        drag: true,
        onStep: onDragStep,
      });
      yield* this.wait(0.1);
      yield* this.moveTo(cursor, targetGrab, {
        speed: 2,
        onStep: onDragStep,
      });
      el.dx = 0;
      el.dy = 0;
      bumpVersion(el);
      yield* this.wait(0.25);
    } else {
      yield* this.wait(0.2);
    }

    cursor.ov = null;
  }

  public *dragGuide(
    cursor: SwarmCursor,
    guide: SwarmGuideEl
  ): Generator<void, void, number> {
    this.rulers.want++;
    try {
      const jitter = rand(-0.15, 0.15);
      const getRulerOrigin = () =>
        guide.axis === "x"
          ? this.fromViewport(10, this.vp.vh * (0.45 + jitter))
          : this.fromViewport(
              this.vp.left +
                (guide.pos > 0 ? 400 : 300) * this.vp.s +
                jitter * 200,
              10
            );

      cursor.shape = "arrow";
      yield* this.moveTo(cursor, getRulerOrigin);
      while (this.rulers.t < 0.95) yield;

      yield* this.moveTo(cursor, getRulerOrigin, { speed: 3 });
      cursor.press = 1;
      cursor.shape = guide.axis === "x" ? "ew" : "ns";
      guide.vis = true;
      guide.dragging = true;
      guide.op = 1;

      const updatePos = () => {
        guide.cur = guide.axis === "x" ? cursor.x : cursor.y;
        bumpVersion(guide);
      };
      updatePos();

      const getDest = () => {
        const orig = getRulerOrigin();
        return guide.axis === "x"
          ? { x: guide.pos, y: orig.y + 40 }
          : { x: orig.x + 30, y: guide.pos };
      };

      yield* this.moveTo(cursor, getDest, {
        speed: 0.55,
        drag: true,
        onStep: updatePos,
      });
      guide.cur = guide.pos;
      guide.dragging = false;
      bumpVersion(guide);
      cursor.shape = "arrow";
      yield* this.wait(0.25);
    } finally {
      this.rulers.want--;
    }
  }

  public *duplicate(
    cursor: SwarmCursor,
    group: SwarmDupGroup,
    copyIdx: number
  ): Generator<void, void, number> {
    const targetCopy = group.copies[copyIdx];
    const completedSources = [
      { dx: 0, dy: 0, ids: group.ids },
      ...group.copies.filter(
        (_, idx) => this.byTask.get(`d:${group.id}:${idx}`)?.state === "done"
      ),
    ];

    let nearestSource = completedSources[0];
    for (const candidate of completedSources) {
      if (
        Math.hypot(candidate.dx - targetCopy.dx, candidate.dy - targetCopy.dy) <
        Math.hypot(
          nearestSource.dx - targetCopy.dx,
          nearestSource.dy - targetCopy.dy
        )
      ) {
        nearestSource = candidate;
      }
    }

    const srcBounds = this.unionBounds(nearestSource.ids);
    cursor.shape = "arrow";
    const grabPt = {
      x: srcBounds.x + Math.min(srcBounds.w * 0.45, 70) + rand(-8, 8),
      y: srcBounds.y + Math.min(srcBounds.h * 0.45, 30) + rand(-4, 4),
    };

    yield* this.moveTo(cursor, grabPt);
    yield* this.click(cursor);
    cursor.ov = () => [
      {
        t: "box",
        b: srcBounds,
        handles: true,
        badge: `${Math.round(srcBounds.w)} × ${Math.round(srcBounds.h)}`,
      },
    ];
    yield* this.wait(rand(0.15, 0.3));

    cursor.shape = "dup";
    yield* this.wait(0.12);
    cursor.press = 1;

    const startOffsetX = nearestSource.dx - targetCopy.dx;
    const startOffsetY = nearestSource.dy - targetCopy.dy;

    targetCopy.ids.forEach((cloneId, idx) => {
      const cloneEl = this.els.get(cloneId);
      const baseEl = this.els.get(group.ids[idx]);
      if (!cloneEl || !baseEl) return;
      cloneEl.vis = true;
      cloneEl.dx = startOffsetX;
      cloneEl.dy = startOffsetY;
      if (cloneEl.kind === "text" && baseEl.kind === "text") {
        cloneEl.shown = baseEl.text;
      }
      if (cloneEl.kind === "rect") {
        cloneEl.styled = true;
      }
      bumpVersion(cloneEl);
    });

    const destPt = { x: grabPt.x - startOffsetX, y: grabPt.y - startOffsetY };
    cursor.ov = () => {
      const dstBounds = this.unionBounds(targetCopy.ids);
      const overlays: SwarmOverlayItem[] = [
        { t: "box", b: srcBounds, color: "red" },
        { t: "box", b: dstBounds, color: "red" },
      ];
      const measure = this.spacing(srcBounds, dstBounds);
      if (measure) overlays.push(measure);
      return overlays;
    };

    yield* this.moveTo(cursor, destPt, {
      speed: 0.6,
      drag: true,
      onStep: () => {
        targetCopy.ids.forEach((cloneId) => {
          const cloneEl = this.els.get(cloneId);
          if (!cloneEl) return;
          cloneEl.dx = cursor.x - destPt.x;
          cloneEl.dy = cursor.y - destPt.y;
          bumpVersion(cloneEl);
        });
      },
    });

    yield* this.wait(0.1);
    cursor.shape = "arrow";
    cursor.ov = () => {
      const dstBounds = this.unionBounds(targetCopy.ids);
      return [
        {
          t: "box",
          b: dstBounds,
          handles: true,
          badge: `${Math.round(dstBounds.w)} × ${Math.round(dstBounds.h)}`,
        },
      ];
    };
    yield* this.wait(0.35);
  }

  public spacing(
    boxA: BoundingBox,
    boxB: BoundingBox
  ): MeasureOverlayItem | null {
    const overlapY =
      Math.min(boxA.y + boxA.h, boxB.y + boxB.h) - Math.max(boxA.y, boxB.y);
    const overlapX =
      Math.min(boxA.x + boxA.w, boxB.x + boxB.w) - Math.max(boxA.x, boxB.x);

    if (overlapY > 0) {
      const midY = Math.max(boxA.y, boxB.y) + overlapY / 2;
      const [leftBox, rightBox] = boxA.x < boxB.x ? [boxA, boxB] : [boxB, boxA];
      const gap = rightBox.x - (leftBox.x + leftBox.w);
      if (gap > 0) {
        return {
          t: "measure",
          a: { x: leftBox.x + leftBox.w, y: midY },
          b: { x: rightBox.x, y: midY },
          label: String(Math.round(gap)),
        };
      }
    } else if (overlapX > 0) {
      const midX = Math.max(boxA.x, boxB.x) + overlapX / 2;
      const [topBox, botBox] = boxA.y < boxB.y ? [boxA, boxB] : [boxB, boxA];
      const gap = botBox.y - (topBox.y + topBox.h);
      if (gap > 0) {
        return {
          t: "measure",
          a: { x: midX, y: topBox.y + topBox.h },
          b: { x: midX, y: botBox.y },
          label: String(Math.round(gap)),
        };
      }
    }
    return null;
  }

  public *editText(
    cursor: SwarmCursor,
    el: SwarmTextEl
  ): Generator<void, void, number> {
    cursor.shape = "arrow";
    const b = this.bounds(el);
    const firstLineW =
      measureTextBlock(el.shown, el.st, el.size, el.w).lines[0] ?? b.w;
    const textStartX =
      el.align === "center" && el.w ? b.x + (el.w - firstLineW) / 2 : b.x;

    yield* this.moveTo(cursor, {
      x: textStartX + Math.min(firstLineW * 0.5, 50) + rand(-5, 5),
      y: b.y + getLineHeightPx(el.st, el.size) * 0.55,
    });
    yield* this.click(cursor);
    yield* this.wait(0.08);
    yield* this.click(cursor);

    el.editing = true;
    el.selAll = true;
    bumpVersion(el);
    cursor.shape = "ibeam";
    cursor.ov = () => [{ t: "box", b: this.bounds(el) }];
    yield* this.wait(rand(0.2, 0.35));

    yield* this.type(el, el.text, true);
    yield* this.wait(0.12);
    el.editing = false;
    bumpVersion(el);
    cursor.shape = "arrow";
    cursor.ov = () => [this.selection(el)];
    yield* this.wait(0.3);
  }
}
