import type { Point2D } from "../core/types";

export interface Box3Bounds {
  min: [number, number, number];
  max: [number, number, number];
}

export interface Screen3DAnchors {
  boxCorners: Point2D[];
  origin: Point2D;
  axes: { x: Point2D; y: Point2D; z: Point2D };
  laserLeft: Point2D;
  laserRight: Point2D;
  surfaceWaypoints: Point2D[];
}

/**
 * Projects 3D bounding box corners, X/Y/Z gizmo handles, laser slice endpoints,
 * and surface waypoints onto 2D Swarm world coordinates.
 */
export function computeScreen3DAnchors(
  containerRect: { left: number; top: number; width: number; height: number },
  vp: { left: number; scrollY: number; s: number },
  bounds: Box3Bounds,
  progress: number,
  extrudeScaleY = 1
): Screen3DAnchors {
  const cx =
    (containerRect.left - vp.left) / vp.s +
    (containerRect.width * 0.5) / vp.s;
  const cy =
    (vp.scrollY + containerRect.top) / vp.s +
    (containerRect.height * 0.5) / vp.s;
  const rx = Math.max(40, (containerRect.width * 0.36) / vp.s);
  const ry = Math.max(40, (containerRect.height * 0.36) / vp.s);

  // Isometric-perspective projection of the 8 3D bounding box vertices
  const isoProject = (nx: number, ny: number, nz: number): Point2D => {
    const sy = ny * extrudeScaleY;
    const px = cx + (nx * 0.82 - nz * 0.34) * rx;
    const py = cy + (-sy * 0.86 + (nx + nz) * 0.22) * ry;
    return { x: px, y: py };
  };

  const corners: Point2D[] = [
    isoProject(-1, -1, -1),
    isoProject(1, -1, -1),
    isoProject(1, -1, 1),
    isoProject(-1, -1, 1),
    isoProject(-1, 1, -1),
    isoProject(1, 1, -1),
    isoProject(1, 1, 1),
    isoProject(-1, 1, 1),
  ];

  const origin = isoProject(0, 0, 0);
  const axes = {
    x: isoProject(1.25, 0, 0),
    y: isoProject(0, 1.25, 0),
    z: isoProject(0, 0, 1.25),
  };

  // Slice plane moves from bottom (-1) to top (+1)
  const sliceNormY = -1 + progress * 2;
  const chordScale = Math.sqrt(Math.max(0.15, 1 - sliceNormY * sliceNormY * 0.65));
  const laserLeft = isoProject(-1.05 * chordScale, sliceNormY, 0.2);
  const laserRight = isoProject(1.05 * chordScale, sliceNormY, -0.2);

  const surfaceWaypoints: Point2D[] = [];
  const rings = 6;
  for (let i = 0; i < rings; i++) {
    const angle = (i / rings) * Math.PI * 2 + progress * Math.PI * 2;
    const wy = Math.sin(angle * 1.5) * 0.75;
    const wx = Math.cos(angle) * 0.85;
    const wz = Math.sin(angle) * 0.85;
    surfaceWaypoints.push(isoProject(wx, wy, wz));
  }

  return {
    boxCorners: corners,
    origin,
    axes,
    laserLeft,
    laserRight,
    surfaceWaypoints,
  };
}
