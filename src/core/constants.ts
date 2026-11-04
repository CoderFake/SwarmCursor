import type { CursorShape, TextStyleSpec } from "./types";

export const DESIGN_WIDTH = 1280;
export const MARGIN_LEFT = 80;
export const MARGIN_RIGHT = 1200;
export const BLEED_LEFT = -10000;
export const BLEED_RIGHT = 10000;
export const CONTENT_X = MARGIN_LEFT + 36;

export const NAV_OFFSET_TOP = 24;
export const NAV_HEIGHT = 64;
export const RULER_SIZE = 20;

export const INITIAL_CURSORS = 18;
export const MIN_CURSORS = 6;
export const FLOCK_TARGET_CURSORS = 36;
export const MAX_CURSORS = 48;

export const SELECTION_BLUE = "#0D99FF";
export const GUIDE_RED = "#F24822";

export const CURSOR_HOTSPOTS: Record<CursorShape, [number, number]> = {
  arrow: [5, 3.5],
  dup: [5, 3.5],
  pen: [3, 3],
  "pen-add": [3, 3],
  "pen-close": [3, 3],
  cross: [12, 12],
  ibeam: [12, 12],
  ew: [12, 12],
  ns: [12, 12],
};

export const ARROW_CURSOR_PATH =
  "M4.6 3.9 C4.2 3.1 4.9 2.4 5.7 2.8 L20.6 9.4 C21.5 9.8 21.4 11.1 20.4 11.3 L13.9 12.9 C13.4 13 13 13.4 12.9 13.9 L11.3 20.4 C11.1 21.4 9.8 21.5 9.4 20.6 Z";

export const AGENT_NAMES = [
  "Ada", "Linus", "Grace", "Alan", "Margaret", "Ken", "Barbara", "Dennis",
  "Radia", "Guido", "Frances", "Bjarne", "Hedy", "Tim", "Katherine", "Edsger",
  "Joan", "Donald", "Sophie", "Niklaus", "Anita", "Brian", "Mary", "Rob",
  "Ida", "Yukihiro", "Shafi", "Leslie", "Jean", "Vint", "Lynn", "Bram",
];

export const AGENT_COLORS = [
  "#F24E1E", "#A259FF", "#1ABCFE", "#0ACF83", "#FF7262", "#FFC700",
  "#9747FF", "#E8467C", "#14AE5C", "#0D99FF", "#FF8A00", "#00B5CE",
];

export const PALETTE = {
  paper: "#F8F9FA",
  ink: "#121417",
  muted: "#62666D",
  line: "#D7DADE",
  accent: "#4C5BD4",
  card: "#FFFFFF",
  code: "#131518",
};

export const sansStyle = (
  size: number,
  weight: number,
  lh: number,
  color = PALETTE.ink,
  ls = 0
): TextStyleSpec => ({
  font: "sans",
  size,
  weight,
  lh,
  color,
  ls,
});

export const monoStyle = (
  size: number,
  color = PALETTE.muted,
  weight = 400,
  extra: Partial<TextStyleSpec> = {}
): TextStyleSpec => ({
  font: "mono",
  size,
  weight,
  lh: 1.45,
  color,
  ...extra,
});

export const TYPE_STYLES = {
  h1: sansStyle(64, 600, 1.02, PALETTE.ink, -0.035),
  h2: sansStyle(40, 600, 1.08, PALETTE.ink, -0.03),
  h3: sansStyle(21, 600, 1.25, PALETTE.ink, -0.012),
  lead: sansStyle(19, 400, 1.5, PALETTE.muted, -0.005),
  body: sansStyle(15.5, 400, 1.55, PALETTE.muted),
  item: sansStyle(14.5, 450, 1.4, PALETTE.ink),
  nav: sansStyle(14, 500, 1.4, PALETTE.ink),
  btn: sansStyle(14.5, 600, 1.4, "#FFFFFF"),
  btnDark: sansStyle(14.5, 600, 1.4, PALETTE.ink),
  logo: sansStyle(19, 650, 1.3, "#43474E", -0.025),
  brand: sansStyle(18, 650, 1.3, PALETTE.ink, -0.02),
  stat: sansStyle(52, 600, 1, PALETTE.ink, -0.04),
  price: sansStyle(44, 600, 1.05, PALETTE.ink, -0.035),
  code: monoStyle(13.5, "#E0E2E5", 400, { lh: 1.7, code: true, pre: true }),
  codeDim: monoStyle(12, "#81868D"),
  nodeName: monoStyle(13, PALETTE.ink, 500),
  nodeWhite: monoStyle(14, "#FFFFFF", 500),
  small: monoStyle(12, PALETTE.muted),
};

export const SWARM_LOGO_PATHS: Array<{
  d: string;
  anchors: Array<[number, number]>;
}> = [
  {
    d: "M 86.1 28.8 A 42 42 0 1 0 35.5 95.5 L 41.2 84.8 A 30 30 0 1 1 78.1 37.7 Z",
    anchors: [
      [86.1, 28.8],
      [48, 18],
      [18, 56],
      [35.5, 95.5],
      [41.2, 84.8],
      [30, 56],
      [54, 30],
      [78.1, 37.7],
    ],
  },
  {
    d: "M 48.5 100.9 A 42 42 0 0 0 92.0 84.7 L 82.3 77.6 A 30 30 0 0 1 53.5 89.7 Z",
    anchors: [
      [48.5, 100.9],
      [72, 98],
      [92.0, 84.7],
      [82.3, 77.6],
      [68, 88],
      [53.5, 89.7],
    ],
  },
  {
    d: "M 40.0 105.0 L 61.0 43.0 H 99.0 L 93.2 55.0 H 68.8 L 63.6 68.0 H 86.0 L 80.2 79.5 H 59.0 L 49.0 98.5 Z",
    anchors: [
      [40.0, 105.0],
      [61.0, 43.0],
      [99.0, 43.0],
      [93.2, 55.0],
      [68.8, 55.0],
      [63.6, 68.0],
      [86.0, 68.0],
      [80.2, 79.5],
      [59.0, 79.5],
      [49.0, 98.5],
    ],
  },
];
