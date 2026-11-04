export type CursorShape =
  | "arrow"
  | "dup"
  | "pen"
  | "pen-add"
  | "pen-close"
  | "cross"
  | "ibeam"
  | "ew"
  | "ns";

export type ScrollMode = "manual" | "auto" | "hybrid";

export interface Point2D {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TextStyleSpec {
  font: "sans" | "mono";
  size: number;
  weight: number;
  lh: number;
  color: string;
  ls?: number;
  upper?: boolean;
  code?: boolean;
  pre?: boolean;
}

export interface BaseElementNode {
  id: string;
  v: number;
  vis: boolean;
  dx: number;
  dy: number;
  sticky?: boolean;
  domEl?: HTMLElement | null;
}

export interface SwarmPathEl extends BaseElementNode {
  kind: "path";
  pts: Point2D[];
  closed: boolean;
  stroke: string;
  sw: number;
  fill?: string;
  d?: string;
  tf?: { x: number; y: number; s: number };
  add: boolean;
  placed: number;
  shut: boolean;
  edit: boolean;
  owner: number | null;
  fillOn: boolean;
}

export interface SwarmRectEl extends BaseElementNode {
  kind: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  fill: string;
  stroke?: string;
  draw: { w: number; h: number } | null;
  styled: boolean;
}

export interface SwarmTextEl extends BaseElementNode {
  kind: "text";
  x: number;
  y: number;
  w?: number;
  align: "left" | "center" | "right";
  text: string;
  shown: string;
  st: TextStyleSpec;
  size: number;
  editing: boolean;
  selAll: boolean;
  dyn?: () => string;
}

export interface SwarmGuideEl extends BaseElementNode {
  kind: "guide";
  axis: "x" | "y";
  pos: number;
  cur: number;
  op: number;
  flash: number;
  dragging: boolean;
}

export type Swarm3DBuildMode = "extrude" | "particles" | "slice" | "all";
export type SwarmImageBuildMode = "mosaic" | "scanline" | "halftone" | "all";

export interface Swarm3DEl extends BaseElementNode {
  kind: "3d";
  x: number;
  y: number;
  w: number;
  h: number;
  buildMode: Swarm3DBuildMode;
  squadSize: number;
  progress: number;
  phase: "idle" | "extrude" | "particles" | "slice" | "done";
  src?: string;
}

export interface SwarmImageEl extends BaseElementNode {
  kind: "image";
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  buildMode: SwarmImageBuildMode;
  progress: number;
  phase: "idle" | "mosaic" | "scanline" | "halftone" | "done";
  src?: string;
}

export type SwarmElementNode =
  | SwarmPathEl
  | SwarmRectEl
  | SwarmTextEl
  | SwarmGuideEl
  | Swarm3DEl
  | SwarmImageEl;

export type SwarmTaskSpec =
  | { type: "path"; el: string }
  | { type: "rect"; el: string }
  | { type: "text"; el: string; snap?: string; grow?: boolean }
  | { type: "guide"; el: string }
  | { type: "dup"; group: string; k: number }
  | { type: "edit"; el: string }
  | { type: "3d"; el: string; buildMode?: Swarm3DBuildMode; squadSize?: number }
  | { type: "image"; el: string; buildMode?: SwarmImageBuildMode };

export interface SwarmTask {
  id: string;
  y: number;
  spec: SwarmTaskSpec;
  deps: string[];
  state?: "wait" | "active" | "done";
  doneAt?: number;
}

export interface SwarmDupCopy {
  dx: number;
  dy: number;
  ids: string[];
}

export interface SwarmDupGroup {
  id: string;
  ids: string[];
  copies: SwarmDupCopy[];
}

export interface SwarmScene {
  els: SwarmElementNode[];
  tasks: SwarmTask[];
  groups: SwarmDupGroup[];
  height: number;
  width?: number;
}

export interface BoxOverlayItem {
  t: "box";
  b: BoundingBox;
  handles?: boolean;
  badge?: string;
  rulerLines?: boolean;
  underline?: BoundingBox;
  color?: "blue" | "red";
}

export interface MeasureOverlayItem {
  t: "measure";
  a: Point2D;
  b: Point2D;
  label: string;
}

export interface Gizmo3DOverlayItem {
  t: "gizmo3d";
  corners: Point2D[];
  origin: Point2D;
  axes: { x: Point2D; y: Point2D; z: Point2D };
  progress: number;
  phase: string;
  badge?: string;
}

export interface Laser3DOverlayItem {
  t: "laser3d";
  leftPt: Point2D;
  rightPt: Point2D;
  cursorPt: Point2D;
  progress: number;
  mode: "slice" | "particles";
}

export interface ImageBuildOverlayItem {
  t: "imagebuild";
  b: BoundingBox;
  progress: number;
  mode: SwarmImageBuildMode;
  phase: "mosaic" | "scanline" | "halftone";
  badge?: string;
}

export type SwarmOverlayItem =
  | BoxOverlayItem
  | MeasureOverlayItem
  | Gizmo3DOverlayItem
  | Laser3DOverlayItem
  | ImageBuildOverlayItem;

export interface SwarmCursor {
  id: number;
  x: number;
  y: number;
  home: Point2D | null;
  name: string;
  color: string;
  shape: CursorShape;
  press: number;
  task: Required<SwarmTask> | null;
  gen: Generator<void, void, number> | null;
  ov: (() => SwarmOverlayItem[]) | null;
  idleFor: number;
  leaving: boolean;
  worked: boolean;
  sticky: boolean;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  force: number;
  spin: number;
  curl: number;
  ph: number;
  orbit: number;
  follow: boolean;
}

export interface ViewportState {
  scrollY: number;
  vh: number;
  vw: number;
  s: number;
  left: number;
}

export interface SwarmEngineOptions {
  scene?: SwarmScene | ((getWorkerCount: () => number) => SwarmScene);
  designWidth?: number;
  initialCursors?: number;
  minCursors?: number;
  maxCursors?: number;
  flockCursors?: number;
  tempoMultiplier?: number;
  onElementDone?: (el: SwarmElementNode) => void;
  onAllTasksDone?: () => void;
}
