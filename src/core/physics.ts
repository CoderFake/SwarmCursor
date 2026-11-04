import type { Point2D, SwarmCursor } from "./types";

export const clamp = (val: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, val));

export interface FlockContext {
  time: number;
  mouseWorld: Point2D | null;
  lastMouseWorld: Point2D | null;
  mouseVel: Point2D;
}

export function stepBoidsFlock(
  dt: number,
  cursors: SwarmCursor[],
  center: Point2D,
  ctx: FlockContext,
  radiusScale = 1
): boolean {
  const { time: t, mouseWorld } = ctx;

  if (mouseWorld && ctx.lastMouseWorld && dt > 0) {
    const k = Math.min(1, dt * 18);
    ctx.mouseVel.x +=
      ((mouseWorld.x - ctx.lastMouseWorld.x) / dt - ctx.mouseVel.x) * k;
    ctx.mouseVel.y +=
      ((mouseWorld.y - ctx.lastMouseWorld.y) / dt - ctx.mouseVel.y) * k;
  }
  ctx.lastMouseWorld = mouseWorld;

  const baseOrbit = 135 * radiusScale * (1 + 0.18 * Math.sin(t * 0.55));
  const swirlDir = Math.tanh(Math.cos(t * 0.11) * 3);
  const desiredVel: Array<[number, number]> = [];

  for (const c of cursors) {
    const dx = c.x - center.x;
    const dy = c.y - center.y;
    const dist = Math.hypot(dx, dy) || 0.01;
    const nx = dx / dist;
    const ny = dy / dist;
    const theta = Math.atan2(dy, dx);
    const orbitOffset = (c.orbit - 120) * 0.55 * radiusScale;
    const targetR =
      baseOrbit * (1 + 0.3 * Math.sin(3 * theta + t * 0.7)) + orbitOffset;
    const tangentSpeed = 300 * (0.7 + c.spin * 0.2) * swirlDir;
    const radialPull = clamp((targetR - dist) * 4, -2600, 1400);
    const farFactor = Math.min(1, Math.max(0, (dist - targetR) / 600));

    desiredVel.push([
      -ny * tangentSpeed + nx * radialPull - ny * c.curl * 400 * farFactor,
      nx * tangentSpeed + ny * radialPull + nx * c.curl * 400 * farFactor,
    ]);
  }

  for (let i = 0; i < cursors.length; i++) {
    const c = cursors[i];
    let alignVx = 0;
    let alignVy = 0;
    let weightSum = 0;

    for (let j = 0; j < cursors.length; j++) {
      if (j === i) continue;
      const other = cursors[j];
      const d = Math.hypot(other.x - c.x, other.y - c.y);
      if (d > 90) continue;
      const w = 1 - d / 90;
      alignVx += other.vx * w;
      alignVy += other.vy * w;
      weightSum += w;
    }

    let [vx, vy] = desiredVel[i];
    if (weightSum > 0) {
      vx = vx * 0.7 + (alignVx / weightSum) * 0.3;
      vy = vy * 0.7 + (alignVy / weightSum) * 0.3;
    }

    const distFromCenter = Math.max(
      0,
      Math.hypot(c.x - center.x, c.y - center.y) - 180 * radiusScale
    );
    const maxSpeed = c.speed * (1.3 + Math.min(3.2, distFromCenter / 90));
    const speed = Math.hypot(vx, vy);
    if (speed > maxSpeed) {
      vx *= maxSpeed / speed;
      vy *= maxSpeed / speed;
    }

    let ax = (vx - c.vx) * 6;
    let ay = (vy - c.vy) * 6;
    const maxForce = c.force * (1.4 + Math.min(5, distFromCenter / 50));
    const force = Math.hypot(ax, ay);
    if (force > maxForce) {
      ax *= maxForce / force;
      ay *= maxForce / force;
    }

    c.vx += ax * dt;
    c.vy += ay * dt;
    c.x += c.vx * dt;
    c.y += c.vy * dt;
  }

  // 48px Mouse Repulsion Bubble
  const repelRadius = 48;
  let touchedMouse = false;
  if (mouseWorld) {
    for (const c of cursors) {
      const dx = c.x - mouseWorld.x;
      const dy = c.y - mouseWorld.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      if (dist >= repelRadius) continue;
      touchedMouse = true;
      const nx = dx / dist;
      const ny = dy / dist;
      c.x = mouseWorld.x + nx * repelRadius;
      c.y = mouseWorld.y + ny * repelRadius;
      const relDot =
        (c.vx - ctx.mouseVel.x) * nx + (c.vy - ctx.mouseVel.y) * ny;
      if (relDot < 0) {
        c.vx -= nx * relDot * 1.6;
        c.vy -= ny * relDot * 1.6;
      }
      c.vx += nx * 260;
      c.vy += ny * 260;
    }
  }

  // Smoothly align cursor rotation angle with velocity vector
  for (const c of cursors) {
    const { vx, vy } = c;
    if (Math.hypot(vx, vy) < 30) continue;
    const angleDiff =
      (((Math.atan2(vy, vx) * 180) / Math.PI + 128 - c.angle + 540) % 360) -
      180;
    c.angle += angleDiff * Math.min(1, dt * 8);
    c.press = Math.max(0, c.press - dt * 6);
  }

  return touchedMouse;
}
