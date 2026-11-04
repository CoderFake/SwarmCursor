import React from "react";
import { GUIDE_RED, RULER_SIZE, SELECTION_BLUE } from "../core/constants";
import type { SwarmEngine } from "../core/engine";
import { CursorView } from "./CursorSvg";

export function SelectionAndGuidesOverlay({ engine }: { engine: SwarmEngine }) {
  const { s, left, vw, scrollY } = engine.vp;
  const toScreenX = (x: number) => left + x * s;
  const toScreenY = (y: number) => y * s;
  const totalHeight = engine.height * s;
  const svgNodes: React.ReactNode[] = [];
  const badgeNodes: React.ReactNode[] = [];
  let keyCounter = 0;

  for (const el of engine.list) {
    if (el.kind === "guide" && el.vis && el.op > 0) {
      const glow =
        el.flash > 0
          ? `drop-shadow(0 0 ${2 + el.flash * 3}px ${GUIDE_RED})`
          : undefined;
      const sw = 1 + el.flash;
      svgNodes.push(
        el.axis === "x" ? (
          <line
            key={keyCounter++}
            x1={toScreenX(el.cur)}
            x2={toScreenX(el.cur)}
            y1={0}
            y2={totalHeight}
            stroke={GUIDE_RED}
            strokeWidth={sw}
            opacity={el.op}
            style={{ filter: glow }}
          />
        ) : (
          <line
            key={keyCounter++}
            x1={0}
            x2={vw}
            y1={toScreenY(el.cur)}
            y2={toScreenY(el.cur)}
            stroke={GUIDE_RED}
            strokeWidth={sw}
            opacity={el.op}
            style={{ filter: glow }}
          />
        )
      );
    }

    if (el.kind === "path" && el.edit) {
      const stickyY = el.sticky ? engine.stick : 0;
      const placedPts = el.pts
        .slice(0, el.placed)
        .map((pt) => ({ x: toScreenX(pt.x), y: toScreenY(pt.y + stickyY) }));
      const ownerCursor =
        el.owner != null
          ? engine.cursors.find((c) => c.id === el.owner)
          : null;
      const previewPts = [
        ...placedPts,
        ...(ownerCursor
          ? [
              {
                x: toScreenX(ownerCursor.x),
                y: toScreenY(ownerCursor.y + stickyY),
              },
            ]
          : []),
      ];

      svgNodes.push(
        <polyline
          key={keyCounter++}
          points={
            previewPts.map((pt) => `${pt.x},${pt.y}`).join(" ") +
            (el.shut ? ` ${placedPts[0].x},${placedPts[0].y}` : "")
          }
          fill="none"
          stroke={SELECTION_BLUE}
          strokeWidth={1.5}
        />
      );
      placedPts.forEach((pt) =>
        svgNodes.push(
          <circle
            key={keyCounter++}
            cx={pt.x}
            cy={pt.y}
            r={3.6}
            fill="#fff"
            stroke={SELECTION_BLUE}
            strokeWidth={1.5}
          />
        )
      );
    }
  }

  const rulerAlpha = engine.rulers.t;
  for (const cursor of engine.cursors) {
    if (!cursor.ov) continue;
    const toCursorScreenY = (y: number) =>
      (y + (cursor.sticky ? engine.stick : 0)) * s;

    for (const item of cursor.ov()) {
      if (item.t === "box") {
        const x = toScreenX(item.b.x);
        const y = toCursorScreenY(item.b.y);
        const w = item.b.w * s;
        const h = item.b.h * s;
        const color = item.color === "red" ? GUIDE_RED : SELECTION_BLUE;

        svgNodes.push(
          <rect
            key={keyCounter++}
            x={x}
            y={y}
            width={w}
            height={h}
            fill="none"
            stroke={color}
            strokeWidth={1}
          />
        );

        if (item.underline && item.underline.w > 0) {
          const ul = item.underline;
          svgNodes.push(
            <line
              key={keyCounter++}
              x1={toScreenX(ul.x)}
              x2={toScreenX(ul.x + ul.w)}
              y1={toCursorScreenY(ul.y)}
              y2={toCursorScreenY(ul.y)}
              stroke={SELECTION_BLUE}
              strokeWidth={1.5}
            />
          );
        }

        if (item.rulerLines && rulerAlpha > 0.05) {
          svgNodes.push(
            <g
              key={keyCounter++}
              stroke={SELECTION_BLUE}
              strokeWidth={1}
              strokeDasharray="2 2"
              opacity={rulerAlpha}
            >
              <line x1={RULER_SIZE} x2={x} y1={y + h / 2} y2={y + h / 2} />
              <line
                x1={x + w / 2}
                x2={x + w / 2}
                y1={scrollY + RULER_SIZE}
                y2={y}
              />
            </g>
          );
        }

        if (item.handles) {
          for (const [hx, hy] of [
            [x, y],
            [x + w, y],
            [x, y + h],
            [x + w, y + h],
          ]) {
            svgNodes.push(
              <rect
                key={keyCounter++}
                x={hx - 3.5}
                y={hy - 3.5}
                width={7}
                height={7}
                fill="#fff"
                stroke={SELECTION_BLUE}
                strokeWidth={1}
              />
            );
          }
        }

        if (item.badge && w > 0) {
          badgeNodes.push(
            <div
              key={keyCounter++}
              className="badge"
              style={{ left: x + w / 2, top: y + h + 8, background: color }}
            >
              {item.badge}
            </div>
          );
        }
      } else if (item.t === "gizmo3d") {
        const pts = item.corners.map((p) => ({
          x: toScreenX(p.x),
          y: toCursorScreenY(p.y),
        }));
        const edges: ReadonlyArray<[number, number]> = [
          [0, 1], [1, 2], [2, 3], [3, 0],
          [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [1, 5], [2, 6], [3, 7],
        ];
        if (pts.length >= 8) {
          svgNodes.push(
            <g
              key={keyCounter++}
              stroke="#0D99FF"
              strokeWidth={1.25}
              strokeDasharray="4 3"
              opacity={0.85}
            >
              {edges.map(([i, j], eIdx) => (
                <line
                  key={eIdx}
                  x1={pts[i].x}
                  y1={pts[i].y}
                  x2={pts[j].x}
                  y2={pts[j].y}
                />
              ))}
            </g>
          );
          const orig = {
            x: toScreenX(item.origin.x),
            y: toCursorScreenY(item.origin.y),
          };
          const axX = {
            x: toScreenX(item.axes.x.x),
            y: toCursorScreenY(item.axes.x.y),
          };
          const axY = {
            x: toScreenX(item.axes.y.x),
            y: toCursorScreenY(item.axes.y.y),
          };
          const axZ = {
            x: toScreenX(item.axes.z.x),
            y: toCursorScreenY(item.axes.z.y),
          };
          svgNodes.push(
            <g key={keyCounter++} strokeWidth={2}>
              <line x1={orig.x} y1={orig.y} x2={axX.x} y2={axX.y} stroke="#F24822" />
              <line x1={orig.x} y1={orig.y} x2={axY.x} y2={axY.y} stroke="#14AE5C" />
              <line x1={orig.x} y1={orig.y} x2={axZ.x} y2={axZ.y} stroke="#0D99FF" />
            </g>
          );
          if (item.badge) {
            badgeNodes.push(
              <div
                key={keyCounter++}
                className="badge"
                style={{
                  left: orig.x,
                  top: Math.max(...pts.map((p) => p.y)) + 8,
                  background: "#7C3AED",
                }}
              >
                {item.badge}
              </div>
            );
          }
        }
      } else if (item.t === "laser3d") {
        const lPt = {
          x: toScreenX(item.leftPt.x),
          y: toCursorScreenY(item.leftPt.y),
        };
        const rPt = {
          x: toScreenX(item.rightPt.x),
          y: toCursorScreenY(item.rightPt.y),
        };
        const cPt = {
          x: toScreenX(item.cursorPt.x),
          y: toCursorScreenY(item.cursorPt.y),
        };
        const midX = (lPt.x + rPt.x) * 0.5;
        const midY = (lPt.y + rPt.y) * 0.5;
        svgNodes.push(
          <g key={keyCounter++}>
            {item.mode === "slice" && (
              <line
                x1={lPt.x}
                y1={lPt.y}
                x2={rPt.x}
                y2={rPt.y}
                stroke="#38BDF8"
                strokeWidth={2.2}
              />
            )}
            <line
              x1={cPt.x}
              y1={cPt.y}
              x2={midX}
              y2={midY}
              stroke="#7C3AED"
              strokeWidth={1.3}
              strokeDasharray="3 3"
            />
          </g>
        );
      } else {
        const ptA = { x: toScreenX(item.a.x), y: toCursorScreenY(item.a.y) };
        const ptB = { x: toScreenX(item.b.x), y: toCursorScreenY(item.b.y) };
        svgNodes.push(
          <line
            key={keyCounter++}
            x1={ptA.x}
            y1={ptA.y}
            x2={ptB.x}
            y2={ptB.y}
            stroke={GUIDE_RED}
            strokeWidth={1}
          />
        );
        const isHorizontal = ptA.y === ptB.y;
        badgeNodes.push(
          <div
            key={keyCounter++}
            className="badge"
            style={{
              left: isHorizontal ? (ptA.x + ptB.x) / 2 : ptA.x + 18,
              top: isHorizontal ? ptA.y + 8 : (ptA.y + ptB.y) / 2 - 9,
              background: GUIDE_RED,
            }}
          >
            {item.label}
          </div>
        );
      }
    }
  }

  return (
    <div className="overlay" style={{ height: totalHeight }}>
      <svg width={vw} height={totalHeight}>
        {svgNodes}
      </svg>
      {badgeNodes}
    </div>
  );
}

export function CursorsLayer({
  engine,
  showLabels = false,
}: {
  engine: SwarmEngine;
  showLabels?: boolean;
}) {
  const { s, left } = engine.vp;
  return (
    <div className="cursors" style={{ height: engine.height * s }}>
      {engine.cursors.map((c) => (
        <CursorView
          key={c.id}
          c={c}
          X={left + c.x * s}
          Y={(c.y + (c.sticky ? engine.stick : 0)) * s}
          showLabel={showLabels}
        />
      ))}
    </div>
  );
}

export function RulersOverlay({ engine }: { engine: SwarmEngine }) {
  const t = engine.rulers.t;
  if (t <= 0.001) return null;

  const { s, left, vw, vh, scrollY } = engine.vp;
  const step = s > 0.6 ? 100 : s > 0.3 ? 200 : 500;
  const topTicks: React.ReactNode[] = [];
  const leftTicks: React.ReactNode[] = [];

  const startX = Math.floor(-left / s / step) * step;
  for (let val = startX; left + val * s < vw; val += step / 2) {
    const px = left + val * s;
    const isMajor = val % step === 0;
    topTicks.push(
      <line
        key={"t" + val}
        x1={px}
        x2={px}
        y1={isMajor ? 13 : 16}
        y2={RULER_SIZE}
        stroke="#5E5E5E"
      />
    );
    if (isMajor) {
      topTicks.push(
        <text key={"l" + val} x={px + 3} y={11} className="rtext">
          {val}
        </text>
      );
    }
  }

  const startY = Math.floor(scrollY / s / step) * step;
  for (let val = startY; val * s - scrollY < vh; val += step / 2) {
    const py = val * s - scrollY;
    const isMajor = val % step === 0;
    leftTicks.push(
      <line
        key={"t" + val}
        y1={py}
        y2={py}
        x1={isMajor ? 13 : 16}
        x2={RULER_SIZE}
        stroke="#5E5E5E"
      />
    );
    if (isMajor) {
      leftTicks.push(
        <text
          key={"l" + val}
          x={11}
          y={py - 3}
          className="rtext"
          transform={`rotate(-90 11 ${py - 3})`}
        >
          {val}
        </text>
      );
    }
  }

  for (const c of engine.cursors) {
    if (!c.ov) continue;
    for (const item of c.ov()) {
      if (item.t !== "box" || !item.handles) continue;
      const x1 = left + item.b.x * s;
      const x2 = left + (item.b.x + item.b.w) * s;
      const y1 = item.b.y * s - scrollY;
      const y2 = (item.b.y + item.b.h) * s - scrollY;

      topTicks.unshift(
        <rect
          key={"s" + c.id}
          x={x1}
          y={0}
          width={x2 - x1}
          height={RULER_SIZE}
          fill="rgba(13,153,255,0.22)"
        />
      );
      topTicks.push(
        <text key={"sa" + c.id} x={x1 + 3} y={11} className="rtext rsel">
          {Math.round(item.b.x)}
        </text>
      );
      leftTicks.unshift(
        <rect
          key={"s" + c.id}
          y={y1}
          x={0}
          height={y2 - y1}
          width={RULER_SIZE}
          fill="rgba(13,153,255,0.22)"
        />
      );
    }
  }

  for (const el of engine.list) {
    if (el.kind !== "guide" || !el.dragging) continue;
    if (el.axis === "x") {
      const px = left + el.cur * s;
      topTicks.push(
        <line
          key={"g" + el.id}
          x1={px}
          x2={px}
          y1={0}
          y2={RULER_SIZE}
          stroke={GUIDE_RED}
        />
      );
      topTicks.push(
        <text
          key={"gl" + el.id}
          x={px + 4}
          y={11}
          className="rtext"
          fill={GUIDE_RED}
        >
          {Math.round(el.cur)}
        </text>
      );
    } else {
      const py = el.cur * s - scrollY;
      leftTicks.push(
        <line
          key={"g" + el.id}
          y1={py}
          y2={py}
          x1={0}
          x2={RULER_SIZE}
          stroke={GUIDE_RED}
        />
      );
    }
  }

  return (
    <>
      <div
        className="ruler ruler-top"
        style={{ transform: `translateY(${(t - 1) * 100}%)` }}
      >
        <svg width={vw} height={RULER_SIZE}>
          {topTicks}
        </svg>
      </div>
      <div
        className="ruler ruler-left"
        style={{ transform: `translateX(${(t - 1) * 100}%)` }}
      >
        <svg width={RULER_SIZE} height={vh}>
          {leftTicks}
        </svg>
      </div>
      <div className="ruler-corner" style={{ opacity: t }} />
    </>
  );
}
