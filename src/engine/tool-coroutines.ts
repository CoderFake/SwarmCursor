import { getLineHeightPx, measureTextBlock } from "../core/text-measure";
import type {
  SwarmCursor,
  SwarmDupGroup,
  SwarmGuideEl,
  SwarmOverlayItem,
  SwarmPathEl,
  SwarmRectEl,
  SwarmTask,
  SwarmTextEl,
} from "../core/types";
import { bumpVersion, rand } from "./scene-loader";
import type { SwarmEngine } from "./SwarmEngine";

export function* drawPathCoroutine(
  engine: SwarmEngine,
  cursor: SwarmCursor,
  el: SwarmPathEl
): Generator<void, void, number> {
  if (el.d) return yield* engine.drawLogo(cursor, el);
  cursor.shape = el.add ? "pen-add" : "pen";
  yield* engine.moveTo(cursor, engine.anchor(el.pts[0]));
  yield* engine.click(cursor);
  el.vis = true;
  el.edit = true;
  el.placed = 1;
  el.owner = cursor.id;
  bumpVersion(el);
  cursor.shape = "pen";

  for (let i = 1; i < el.pts.length; i++) {
    yield* engine.moveTo(cursor, engine.anchor(el.pts[i]), {
      speed: 1.8,
      bend: rand(-0.03, 0.03),
    });
    yield* engine.click(cursor);
    el.placed = i + 1;
    bumpVersion(el);
    yield* engine.wait(rand(0.015, 0.035));
  }

  if (el.closed) {
    cursor.shape = "pen-close";
    yield* engine.moveTo(cursor, el.pts[0], {
      speed: 1.8,
      bend: rand(-0.03, 0.03),
    });
    yield* engine.click(cursor);
    el.shut = true;
    bumpVersion(el);
  }

  el.owner = null;
  bumpVersion(el);
  cursor.shape = "pen";
  yield* engine.moveTo(
    cursor,
    { x: cursor.x + rand(14, 30), y: cursor.y + rand(10, 24) },
    { speed: 2.0 }
  );
  yield* engine.wait(0.06);
  el.edit = false;
  if (el.fill) el.fillOn = true;
  bumpVersion(el);
}

export function* drawLogoCoroutine(
  engine: SwarmEngine,
  cursor: SwarmCursor,
  el: SwarmPathEl
): Generator<void, void, number> {
  cursor.shape = "pen";
  yield* engine.moveTo(cursor, engine.anchor(el.pts[0]));
  el.vis = true;
  el.placed = 1;
  bumpVersion(el);
  for (let i = 1; i <= el.pts.length; i++) {
    yield* engine.moveTo(cursor, el.pts[i % el.pts.length], { speed: 1.6 });
    el.placed = i + 1;
    bumpVersion(el);
  }
  el.shut = true;
  el.fillOn = true;
  bumpVersion(el);
  yield* engine.moveTo(
    cursor,
    { x: cursor.x + rand(14, 30), y: cursor.y + rand(10, 24) },
    { speed: 1.4 }
  );
}

export function* drawRectCoroutine(
  engine: SwarmEngine,
  cursor: SwarmCursor,
  el: SwarmRectEl
): Generator<void, void, number> {
  const isCompactChild =
    el.w * el.h <= 18000 ||
    el.domEl?.getAttribute("data-swarm-auto") === "true";
  cursor.shape = "cross";
  yield* engine.moveTo(cursor, () => ({ x: el.x, y: el.y }), {
    speed: isCompactChild ? 1.95 : 1.0,
  });
  cursor.press = 1;
  el.vis = true;
  el.draw = { w: 0, h: 0 };
  bumpVersion(el);
  cursor.ov = () => [engine.selection(el)];

  yield* engine.moveTo(
    cursor,
    () => ({ x: el.x + el.w, y: el.y + el.h }),
    {
      speed: isCompactChild ? 2.15 : 1.35,
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
  yield* engine.wait(isCompactChild ? 0.02 : rand(0.04, 0.08));
  el.styled = true;
  bumpVersion(el);
  yield* engine.wait(isCompactChild ? 0.025 : 0.06);
  cursor.ov = null;
}

export function* drawTextCoroutine(
  engine: SwarmEngine,
  cursor: SwarmCursor,
  el: SwarmTextEl,
  guide: SwarmGuideEl | null,
  grow: boolean
): Generator<void, void, number> {
  if (el.dyn) el.text = el.dyn();
  const isDomBacked = !!el.domEl;
  const isChildSubtask = el.domEl?.getAttribute("data-swarm-auto") === "true";
  if (guide && !isDomBacked) {
    if (guide.axis === "x") {
      el.dx = rand(28, 64);
      el.dy = rand(-8, 8);
    } else {
      el.dx = rand(-8, 8);
      el.dy = rand(18, 34) * (Math.random() < 0.5 ? -1 : 1);
    }
  } else if (isDomBacked) {
    el.dx = 0;
    el.dy = 0;
  }
  if (grow && !isDomBacked) el.size = 18;

  cursor.shape = "cross";
  yield* engine.moveTo(
    cursor,
    () => ({ x: el.x + el.dx, y: el.y + el.dy }),
    { speed: isChildSubtask ? 1.85 : 1.0 }
  );

  if (el.w == null) {
    yield* engine.click(cursor);
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
      x: el.x + el.dx,
      y: el.y + el.dy,
      w: 0,
      h: 0,
      r: 0,
      fill: "",
      draw: null,
      styled: true,
    };
    cursor.ov = () => [engine.selection(tempRect)];
    yield* engine.moveTo(
      cursor,
      () => {
        const b = engine.bounds(el);
        const boxH = isDomBacked
          ? Math.max(getLineHeightPx(el.st, el.size), b.h)
          : getLineHeightPx(el.st, el.size);
        return {
          x: el.x + el.dx + (el.w ?? b.w),
          y: el.y + el.dy + boxH,
        };
      },
      {
        speed: 1.5,
        drag: true,
        bend: 0,
        onStep: () => {
          tempRect.x = el.x + el.dx;
          tempRect.y = el.y + el.dy;
          tempRect.w = Math.max(0, cursor.x - tempRect.x);
          tempRect.h = Math.max(0, cursor.y - tempRect.y);
        },
      }
    );
    el.vis = true;
    el.editing = true;
    bumpVersion(el);
  }

  cursor.shape = "ibeam";
  cursor.ov = () => [{ t: "box", b: engine.bounds(el) }];
  yield* engine.moveTo(
    cursor,
    () => ({
      x: el.x + el.dx + Math.min(24, (el.w ?? 48) * 0.25),
      y: el.y + el.dy + Math.min(14, getLineHeightPx(el.st, el.size) * 0.55),
    }),
    { speed: 2.2 }
  );
  yield* engine.type(el, el.text);
  yield* engine.wait(0.04);
  el.editing = false;
  bumpVersion(el);

  cursor.shape = "arrow";
  cursor.ov = () => [engine.selection(el)];

  if (grow && !isDomBacked) {
    const steps = [24, 36, 52, 68].filter((s) => s < el.st.size);
    for (const sz of [...steps, el.st.size]) {
      yield* engine.wait(0.025);
      el.size = sz;
      bumpVersion(el);
    }
    yield* engine.wait(0.05);
  }

  if (guide && !isDomBacked) {
    const guideTask = engine.byTask.get("g:" + guide.id);
    while (guideTask && guideTask.state !== "done") yield;

    const b = engine.bounds(el);
    const grabPt = {
      x: b.x + Math.min(b.w * 0.4, 60) + rand(-6, 6),
      y: b.y + Math.min(b.h * 0.5, 22),
    };
    yield* engine.moveTo(cursor, grabPt);
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

    yield* engine.moveTo(cursor, overshootGrab, {
      speed: 0.6,
      drag: true,
      onStep: onDragStep,
    });
    yield* engine.wait(0.1);
    yield* engine.moveTo(cursor, targetGrab, {
      speed: 2,
      onStep: onDragStep,
    });
    el.dx = 0;
    el.dy = 0;
    bumpVersion(el);
    yield* engine.wait(0.25);
  } else {
    yield* engine.wait(isChildSubtask ? 0.04 : 0.2);
  }

  cursor.ov = null;
}

export function* dragGuideCoroutine(
  engine: SwarmEngine,
  cursor: SwarmCursor,
  guide: SwarmGuideEl
): Generator<void, void, number> {
  engine.rulers.want++;
  try {
    const jitter = rand(-0.15, 0.15);
    const getRulerOrigin = () =>
      guide.axis === "x"
        ? engine.fromViewport(10, engine.vp.vh * (0.45 + jitter))
        : engine.fromViewport(
            engine.vp.left +
              (guide.pos > 0 ? 400 : 300) * engine.vp.s +
              jitter * 200,
            10
          );

    cursor.shape = "arrow";
    yield* engine.moveTo(cursor, getRulerOrigin);
    while (engine.rulers.t < 0.95) yield;

    yield* engine.moveTo(cursor, getRulerOrigin, { speed: 3 });
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

    yield* engine.moveTo(cursor, getDest, {
      speed: 0.55,
      drag: true,
      onStep: updatePos,
    });
    guide.cur = guide.pos;
    guide.dragging = false;
    bumpVersion(guide);
    cursor.shape = "arrow";
    yield* engine.wait(0.25);
  } finally {
    engine.rulers.want--;
  }
}

export function* duplicateGroupCoroutine(
  engine: SwarmEngine,
  cursor: SwarmCursor,
  group: SwarmDupGroup,
  copyIdx: number
): Generator<void, void, number> {
  const targetCopy = group.copies[copyIdx];
  const completedSources = [
    { dx: 0, dy: 0, ids: group.ids },
    ...group.copies.filter(
      (_, idx) => engine.byTask.get(`d:${group.id}:${idx}`)?.state === "done"
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

  const srcBounds = engine.unionBounds(nearestSource.ids);
  cursor.shape = "arrow";
  const grabPt = {
    x: srcBounds.x + Math.min(srcBounds.w * 0.45, 70) + rand(-8, 8),
    y: srcBounds.y + Math.min(srcBounds.h * 0.45, 30) + rand(-4, 4),
  };

  yield* engine.moveTo(cursor, grabPt);
  yield* engine.click(cursor);
  cursor.ov = () => [
    {
      t: "box",
      b: srcBounds,
      handles: true,
      badge: `${Math.round(srcBounds.w)} × ${Math.round(srcBounds.h)}`,
    },
  ];
  yield* engine.wait(rand(0.15, 0.3));

  cursor.shape = "dup";
  yield* engine.wait(0.12);
  cursor.press = 1;

  const startOffsetX = nearestSource.dx - targetCopy.dx;
  const startOffsetY = nearestSource.dy - targetCopy.dy;

  targetCopy.ids.forEach((cloneId, idx) => {
    const cloneEl = engine.els.get(cloneId);
    const baseEl = engine.els.get(group.ids[idx]);
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
    const dstBounds = engine.unionBounds(targetCopy.ids);
    const overlays: SwarmOverlayItem[] = [
      { t: "box", b: srcBounds, color: "red" },
      { t: "box", b: dstBounds, color: "red" },
    ];
    const measure = engine.spacing(srcBounds, dstBounds);
    if (measure) overlays.push(measure);
    return overlays;
  };

  yield* engine.moveTo(cursor, destPt, {
    speed: 0.6,
    drag: true,
    onStep: () => {
      targetCopy.ids.forEach((cloneId) => {
        const cloneEl = engine.els.get(cloneId);
        if (!cloneEl) return;
        cloneEl.dx = cursor.x - destPt.x;
        cloneEl.dy = cursor.y - destPt.y;
        bumpVersion(cloneEl);
      });
    },
  });

  yield* engine.wait(0.1);
  cursor.shape = "arrow";
  cursor.ov = () => {
    const dstBounds = engine.unionBounds(targetCopy.ids);
    return [
      {
        t: "box",
        b: dstBounds,
        handles: true,
        badge: `${Math.round(dstBounds.w)} × ${Math.round(dstBounds.h)}`,
      },
    ];
  };
  yield* engine.wait(0.35);
}

export function* editTextCoroutine(
  engine: SwarmEngine,
  cursor: SwarmCursor,
  el: SwarmTextEl
): Generator<void, void, number> {
  cursor.shape = "arrow";
  const b = engine.bounds(el);
  const firstLineW =
    measureTextBlock(el.shown, el.st, el.size, el.w).lines[0] ?? b.w;
  const textStartX =
    el.align === "center" && el.w ? b.x + (el.w - firstLineW) / 2 : b.x;

  yield* engine.moveTo(cursor, {
    x: textStartX + Math.min(firstLineW * 0.5, 50) + rand(-5, 5),
    y: b.y + getLineHeightPx(el.st, el.size) * 0.55,
  });
  yield* engine.click(cursor);
  yield* engine.wait(0.08);
  yield* engine.click(cursor);

  el.editing = true;
  el.selAll = true;
  bumpVersion(el);
  cursor.shape = "ibeam";
  cursor.ov = () => [{ t: "box", b: engine.bounds(el) }];
  yield* engine.wait(rand(0.2, 0.35));

  yield* engine.type(el, el.text, true);
  yield* engine.wait(0.12);
  el.editing = false;
  bumpVersion(el);
  cursor.shape = "arrow";
  cursor.ov = () => [engine.selection(el)];
  yield* engine.wait(0.3);
}

export function* assistSubtaskCoroutine(
  engine: SwarmEngine,
  cursor: SwarmCursor,
  task: Required<SwarmTask>
): Generator<void, void, number> {
  const elId = "el" in task.spec ? task.spec.el : "";
  const el = engine.els.get(elId);
  if (!el || !("x" in el)) return;

  cursor.shape = el.kind === "text" ? "ibeam" : "cross";
  const b = engine.bounds(el);
  const targetX = b.x + Math.max(24, b.w * rand(0.52, 0.86));
  const targetY = b.y + Math.max(10, b.h * rand(0.35, 0.72));

  yield* engine.moveTo(cursor, { x: targetX, y: targetY }, { speed: 1.95 });
  if (task.state !== "active") {
    cursor.shape = "arrow";
    cursor.ov = null;
    return;
  }

  yield* engine.click(cursor);
  let steps = 0;
  while (task.state === "active" && steps < 18) {
    steps++;
    if (el.kind === "text" && el.editing && el.shown.length < el.text.length) {
      const boost = Math.max(1, Math.ceil(el.text.length / 26));
      el.shown = el.text.slice(0, Math.min(el.text.length, el.shown.length + boost));
      bumpVersion(el);
    }
    yield* engine.wait(0.032);
  }
  cursor.shape = "arrow";
  cursor.ov = null;
}
