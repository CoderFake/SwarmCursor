import {
  BLEED_LEFT,
  BLEED_RIGHT,
  CONTENT_X,
  DESIGN_WIDTH,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  PALETTE,
  TYPE_STYLES,
  monoStyle,
  sansStyle,
} from "../core/constants";
import { SceneBuilder } from "../core/scene-builder";
import type { SwarmScene } from "../core/types";

export function buildSwarmLandingScene(
  getWorkerCount: () => number = () => 18
): SwarmScene {
  const b = new SceneBuilder(DESIGN_WIDTH);

  // --- Sticky Navigation ---
  const navStart = b.els.length;
  b.addPath(
    "rule-top",
    [
      { x: BLEED_LEFT, y: 24 },
      { x: BLEED_RIGHT, y: 24 },
    ],
    { add: false }
  );
  b.addSectionFrame("nav", 24, 88, true);
  b.addLogoMark("mark", MARGIN_LEFT + 24, 45, 22);
  b.addText("brand", MARGIN_LEFT + 52, 44, "SwarmCursor", TYPE_STYLES.brand);
  b.addText("nav0", 540, 46, "Components", TYPE_STYLES.nav);
  b.addDupGroup(
    "nav",
    ["nav0"],
    [
      { dx: 96, dy: 0, edits: ["Physics"] },
      { dx: 192, dy: 0, edits: ["Docs"] },
      { dx: 288, dy: 0, edits: ["GitHub"] },
    ]
  );
  b.addVLine("nav-div", MARGIN_RIGHT - 176, 24, 88);
  b.addRect("nav-btn", MARGIN_RIGHT - 156, 36, 136, 40, {
    r: 8,
    fill: PALETTE.ink,
  });
  b.addText("nav-btn-t", MARGIN_RIGHT - 156, 46, "Get access", TYPE_STYLES.btn, {
    w: 136,
    align: "center",
    deps: ["r:nav-btn"],
  });
  b.markStickyFrom(navStart);

  // --- Hero Section ---
  b.addSectionFrame("hero", 88, 660);
  b.addVLine("hero-div", 740, 88, 660);
  b.addGuide("g-hero", "x", CONTENT_X, 120);
  b.addGuide("g-hero-r", "x", 776, 120);
  b.addText(
    "h-title",
    CONTENT_X,
    192,
    "Run a thousand\nagents as one.",
    TYPE_STYLES.h1,
    { w: 580, snap: "g-hero", grow: true }
  );
  b.addText(
    "h-lead",
    CONTENT_X,
    356,
    "Swarm schedules, routes and supervises AI agents across your stack, and runs their work in parallel.",
    TYPE_STYLES.lead,
    { w: 500, snap: "g-hero" }
  );
  b.addRect("h-btn1", CONTENT_X, 488, 184, 48, { r: 8, fill: PALETTE.ink });
  b.addText("h-btn1-t", CONTENT_X, 501, "Start building", TYPE_STYLES.btn, {
    w: 184,
    align: "center",
    deps: ["r:h-btn1"],
  });
  b.addRect("h-btn2", CONTENT_X + 196, 488, 156, 48, {
    r: 8,
    fill: PALETTE.card,
    stroke: PALETTE.line,
  });
  b.addText(
    "h-btn2-t",
    CONTENT_X + 196,
    501,
    "Read the docs",
    TYPE_STYLES.btnDark,
    { w: 156, align: "center", deps: ["r:h-btn2"] }
  );

  // Hero Diagram
  b.addRect("g-disp", 776, 162, 388, 64, { r: 10, fill: PALETTE.ink });
  b.addText("g-disp-t", 800, 172, "swarm.dispatch(task)", TYPE_STYLES.nodeWhite, {
    deps: ["r:g-disp"],
  });
  b.addText(
    "g-disp-s",
    800,
    194,
    "orchestrator · 18 tasks queued",
    monoStyle(12, "#8F949B"),
    { deps: ["r:g-disp"] }
  );
  const stem = b.addPath(
    "g-stem",
    [
      { x: 970, y: 226 },
      { x: 970, y: 258 },
    ],
    { stroke: "#9DA2A9", deps: ["r:g-disp"] }
  );
  b.addPath(
    "g-bus",
    [
      { x: 866, y: 290 },
      { x: 866, y: 258 },
      { x: 1074, y: 258 },
      { x: 1074, y: 290 },
    ],
    { stroke: "#9DA2A9", deps: [stem] }
  );
  b.addRect("w0", 776, 290, 180, 64, {
    r: 10,
    fill: PALETTE.card,
    stroke: PALETTE.line,
  });
  b.addText("w0-n", 796, 301, "agent/research", TYPE_STYLES.nodeName, {
    deps: ["r:w0"],
  });
  b.addText("w0-s", 796, 323, "● 12 replicas", monoStyle(12, PALETTE.accent), {
    deps: ["r:w0"],
  });
  b.addDupGroup(
    "workers",
    ["w0", "w0-n", "w0-s"],
    [
      { dx: 208, dy: 0, edits: ["agent/writer", "● 4 replicas"] },
      { dx: 0, dy: 104, edits: ["agent/review", "● 2 replicas"] },
      { dx: 208, dy: 104, edits: ["agent/deploy", "○ waiting"] },
    ]
  );
  b.addPath(
    "g-l1",
    [
      { x: 866, y: 354 },
      { x: 866, y: 394 },
    ],
    { stroke: "#9DA2A9", deps: ["d:workers:2"] }
  );
  b.addPath(
    "g-l2",
    [
      { x: 1074, y: 354 },
      { x: 1074, y: 394 },
    ],
    { stroke: "#9DA2A9", deps: ["d:workers:2"] }
  );
  b.addRect("g-track", 776, 540, 388, 6, { r: 3, fill: "#E1E3E6" });
  b.addRect("g-fill", 776, 540, 252, 6, {
    r: 3,
    fill: PALETTE.accent,
    deps: ["r:g-track"],
  });
  b.addText(
    "g-stat",
    776,
    562,
    "4 agents · 18 tasks in flight · 0 conflicts",
    TYPE_STYLES.small,
    { snap: "g-hero-r" }
  );

  // --- Logos Strip ---
  b.addSectionFrame("logos", 660, 772, true);
  b.addText("l-label", CONTENT_X, 699, "Used by teams at", TYPE_STYLES.small, {
    w: 230,
  });
  for (let i = 0; i < 5; i++) {
    b.addVLine("l-div" + i, 360 + i * 168, 660, 772);
  }
  b.addText("logo0", 388, 703, "Northwind", TYPE_STYLES.logo);
  b.addDupGroup(
    "logos",
    ["logo0"],
    ["Halcyon", "Parallax", "Meridian", "Kestrel"].map((name, idx) => ({
      dx: 168 * (idx + 1),
      dy: 0,
      edits: [name],
    }))
  );

  // --- Features Section ---
  b.addSectionFrame("fhead", 772, 960);
  b.addGuide("g-feat", "x", CONTENT_X, 790);
  b.addGuide("g-feat-r", "x", 760, 790);
  b.addText(
    "f-title",
    CONTENT_X,
    834,
    "Built for running agents\nin production.",
    TYPE_STYLES.h2,
    { w: 580, snap: "g-feat", grow: true }
  );
  b.addText(
    "f-lead",
    760,
    840,
    "Routing, memory, supervision, fan-out, tracing and guardrails all come with the orchestrator.",
    TYPE_STYLES.body,
    { w: 380, snap: "g-feat-r" }
  );

  b.addSectionFrame("fgrid", 960, 1440, true);
  b.addHLine("f-mid", 1200);
  b.addVLine("f-v1", 453, 960, 1440);
  b.addVLine("f-v2", 826, 960, 1440);
  b.addGuide("g-cell", "x", MARGIN_LEFT + 36, 975);
  b.addGuide("g-cell-y", "y", 1000, 975);
  b.addText("fc-title", MARGIN_LEFT + 36, 1000, "Smart routing", TYPE_STYLES.h3, {
    snap: "g-cell-y",
  });
  b.addText(
    "fc-body",
    MARGIN_LEFT + 36,
    1036,
    "Send every task to the agent best equipped for it, based on skills, cost and live load.",
    TYPE_STYLES.body,
    { w: 296, snap: "g-cell" }
  );
  b.addDupGroup(
    "features",
    ["fc-title", "fc-body"],
    [
      {
        dx: 373,
        dy: 0,
        edits: [
          "Shared memory",
          "Agents read and write one consistent context, so nobody does the same work twice.",
        ],
      },
      {
        dx: 746,
        dy: 0,
        edits: [
          "Supervisors",
          "Retry, escalate or hand off automatically when an agent gets stuck or drifts.",
        ],
      },
      {
        dx: 0,
        dy: 240,
        edits: [
          "Fan-out, fan-in",
          "Split big jobs across hundreds of workers and merge the results deterministically.",
        ],
      },
      {
        dx: 373,
        dy: 240,
        edits: [
          "Live traces",
          "Watch every decision as it happens, with replays down to a single tool call.",
        ],
      },
      {
        dx: 746,
        dy: 240,
        edits: [
          "Guardrails",
          "Budgets, approvals and policies that every agent in the swarm respects by default.",
        ],
      },
    ]
  );

  // --- Code Section ---
  b.addSectionFrame("code", 1440, 1920);
  b.addVLine("c-div", 600, 1440, 1920);
  b.addGuide("g-code", "x", CONTENT_X, 1460);
  b.addGuide("g-code-y", "y", 1772, 1600);
  b.addText(
    "c-title",
    CONTENT_X,
    1522,
    "One file describes\nthe whole swarm.",
    TYPE_STYLES.h2,
    { w: 440, snap: "g-code", grow: true }
  );
  b.addText(
    "c-body",
    CONTENT_X,
    1630,
    "One declarative file sets your agents, how work is routed between them, and what they’re allowed to spend. Review it in a pull request like any other code.",
    TYPE_STYLES.body,
    { w: 400, snap: "g-code" }
  );
  b.addText(
    "c-link",
    CONTENT_X,
    1772,
    "Read the spec",
    monoStyle(13, PALETTE.ink, 500),
    { snap: "g-code-y" }
  );

  const codeWin = b.addRect("c-win", 640, 1488, 520, 384, {
    r: 12,
    fill: PALETTE.code,
  });
  for (let i = 0; i < 3; i++) {
    b.addRect("c-dot" + i, 664 + i * 18, 1507, 10, 10, {
      r: 5,
      fill: "#30343A",
      deps: [codeWin],
    });
  }
  b.addText(
    "c-file",
    1136 - b.measureTextWidth("swarm.yaml", TYPE_STYLES.codeDim),
    1503,
    "swarm.yaml",
    TYPE_STYLES.codeDim,
    { deps: [codeWin] }
  );
  b.addPath(
    "c-sep",
    [
      { x: 640, y: 1536 },
      { x: 1160, y: 1536 },
    ],
    { stroke: "#25282D", deps: [codeWin] }
  );
  [
    "# swarm.yaml",
    "swarm: launch-week",
    "agents:",
    "  research: { model: fast, replicas: 12 }",
    "  writer:   { model: smart, replicas: 4 }",
    "  reviewer: { model: smart, replicas: 2 }",
    "routing:",
    "  strategy: skills-first",
    "  fallback: reviewer",
    "budget:",
    "  max_spend: $40/day",
    "  on_exceed: pause",
  ].forEach((line, idx) =>
    b.addText("c-ln" + idx, 664, 1556 + idx * 23, line, TYPE_STYLES.code, {
      deps: [codeWin],
    })
  );

  // --- Stats Section ---
  b.addSectionFrame("stats", 1920, 2120, true);
  for (const x of [360, 640, 920]) {
    b.addVLine("s-div" + x, x, 1920, 2120);
  }
  b.addGuide("g-stats", "y", 1960, 1930);
  b.addGuide("g-stats-x", "x", MARGIN_LEFT + 36, 1930);
  b.addText("st-n", MARGIN_LEFT + 36, 1960, "10k+", TYPE_STYLES.stat, {
    snap: "g-stats",
  });
  b.addText(
    "st-l",
    MARGIN_LEFT + 36,
    2028,
    "agents in a single swarm",
    TYPE_STYLES.body,
    { w: 220, snap: "g-stats-x" }
  );
  b.addDupGroup(
    "stats",
    ["st-n", "st-l"],
    [
      { dx: 280, dy: 0, edits: ["38ms", "median agent-to-agent handoff"] },
      {
        dx: 560,
        dy: 0,
        edits: ["99.99%", "orchestrator uptime, last 12 months"],
      },
      { dx: 840, dy: 0, edits: ["0", "tasks dropped last quarter"] },
    ]
  );

  // --- Steps Section ---
  b.addSectionFrame("steps", 2120, 2640);
  b.addGuide("g-steps", "x", CONTENT_X, 2140);
  b.addGuide("g-steps-c", "x", MARGIN_LEFT + 36, 2330);
  b.addText(
    "p-title",
    CONTENT_X,
    2194,
    "How a task moves\nthrough Swarm.",
    TYPE_STYLES.h2,
    { w: 640, snap: "g-steps", grow: true }
  );
  const midLine = b.addHLine("p-mid", 2320);
  b.addVLine("p-v1", 453, 2320, 2640, [midLine]);
  b.addVLine("p-v2", 826, 2320, 2640, [midLine]);
  b.addText(
    "ps-t",
    MARGIN_LEFT + 36,
    2364,
    "Define",
    sansStyle(26, 600, 1.2, PALETTE.ink, -0.02),
    { snap: "g-steps-c" }
  );
  b.addText(
    "ps-b",
    MARGIN_LEFT + 36,
    2404,
    "Declare agents, skills and budgets in one file, versioned right next to your code.",
    TYPE_STYLES.body,
    { w: 296, snap: "g-steps-c" }
  );
  b.addDupGroup(
    "steps",
    ["ps-t", "ps-b"],
    [
      {
        dx: 373,
        dy: 0,
        edits: [
          "Dispatch",
          "Swarm fans tasks out to the best agents and keeps every handoff ordered and observable.",
        ],
      },
      {
        dx: 746,
        dy: 0,
        edits: [
          "Converge",
          "Results stream back, get checked by supervisors, and land as one coherent change.",
        ],
      },
    ]
  );

  // --- Pricing Section ---
  b.addSectionFrame("pricing", 2640, 3280, true);
  b.addGuide("g-price", "x", CONTENT_X, 2660);
  b.addGuide("g-price-r", "x", 760, 2660);
  b.addGuide("g-plan", "x", 144, 2860);
  b.addText(
    "$-title",
    CONTENT_X,
    2714,
    "Priced by the size\nof your swarm.",
    TYPE_STYLES.h2,
    { w: 520, snap: "g-price", grow: true }
  );
  b.addText(
    "$-lead",
    760,
    2730,
    "Every plan includes the full orchestrator. You only pay more when your swarm gets bigger.",
    TYPE_STYLES.body,
    { w: 380, snap: "g-price-r" }
  );

  const planCard = [
    b.addRect("pc", 116, 2850, 330, 398, {
      r: 14,
      fill: PALETTE.card,
      stroke: PALETTE.line,
    }),
  ];
  b.addText("pc-name", 144, 2878, "Hive", sansStyle(16, 600, 1.3), {
    deps: planCard,
    snap: "g-plan",
  });
  b.addText("pc-price", 144, 2912, "$0", TYPE_STYLES.price, {
    deps: planCard,
    snap: "g-plan",
  });
  b.addText("pc-per", 144, 2966, "free forever", TYPE_STYLES.small, {
    deps: planCard,
  });
  b.addText(
    "pc-desc",
    144,
    3000,
    "For tinkering with your first swarm on a weekend.",
    TYPE_STYLES.body,
    { w: 274, deps: planCard, snap: "g-plan" }
  );
  b.addRect("pc-rule", 144, 3070, 274, 1, {
    fill: PALETTE.line,
    deps: planCard,
  });
  b.addText("pc-f1", 144, 3088, "✓  Up to 10 agents", TYPE_STYLES.item, {
    deps: planCard,
  });
  b.addText("pc-f2", 144, 3116, "✓  Community support", TYPE_STYLES.item, {
    deps: planCard,
  });
  b.addText("pc-f3", 144, 3144, "✓  7-day trace history", TYPE_STYLES.item, {
    deps: planCard,
  });
  b.addRect("pc-btn", 144, 3176, 274, 44, {
    r: 8,
    fill: PALETTE.ink,
    deps: planCard,
  });
  b.addText("pc-btn-t", 144, 3187, "Start free", TYPE_STYLES.btn, {
    w: 274,
    align: "center",
    deps: ["r:pc-btn"],
  });
  b.addDupGroup(
    "plans",
    [
      "pc",
      "pc-name",
      "pc-price",
      "pc-per",
      "pc-desc",
      "pc-rule",
      "pc-f1",
      "pc-f2",
      "pc-f3",
      "pc-btn",
      "pc-btn-t",
    ],
    [
      {
        dx: 355,
        dy: 0,
        edits: [
          "Colony",
          "$49",
          "per month, billed monthly",
          "For teams running agents in production, every day.",
          "✓  Up to 500 agents",
          "✓  Shared memory + supervisors",
          "✓  30-day trace history",
          "Get Colony",
        ],
      },
      {
        dx: 710,
        dy: 0,
        edits: [
          "Swarm",
          "Let’s talk",
          "annual contract",
          "For fleets that never sleep and never stop shipping.",
          "✓  Unlimited agents",
          "✓  SSO, audit logs, VPC",
          "✓  Dedicated orchestrator",
          "Contact sales",
        ],
      },
    ]
  );

  // --- CTA Section ---
  b.addSectionFrame("cta", 3280, 3690);
  b.addVLine("cta-div", 800, 3280, 3690);
  b.addGuide("g-cta", "x", CONTENT_X, 3300);
  b.addGuide("g-cta-r", "x", 840, 3300);
  b.addText(
    "x-title",
    CONTENT_X,
    3352,
    "Let the swarm\nbuild it.",
    TYPE_STYLES.h1,
    { w: 560, snap: "g-cta", grow: true }
  );
  b.addText(
    "x-lead",
    CONTENT_X,
    3506,
    "Start with ten agents for free. Scale to ten thousand when you’re ready.",
    TYPE_STYLES.lead,
    { w: 460, snap: "g-cta" }
  );
  b.addRect("x-btn", CONTENT_X, 3596, 184, 48, { r: 8, fill: PALETTE.ink });
  b.addText("x-btn-t", CONTENT_X, 3609, "Start building", TYPE_STYLES.btn, {
    w: 184,
    align: "center",
    deps: ["r:x-btn"],
  });
  b.addText("x-count", 840, 3352, "", monoStyle(13, PALETTE.accent, 500), {
    w: 320,
    snap: "g-cta-r",
    dyn: () =>
      `This page was built by ${getWorkerCount()} agents while you scrolled.`,
  });
  b.addText(
    "x-note",
    840,
    3414,
    "Every line, guide and word above was placed by a cursor working alongside the others.",
    TYPE_STYLES.body,
    { w: 320, snap: "g-cta-r" }
  );

  // --- Footer Section ---
  b.addSectionFrame("footer", 3690, 3970, true);
  b.addGuide("g-foot", "x", 560, 3700);
  b.addLogoMark("fmark", MARGIN_LEFT + 36, 3735, 22);
  b.addText("f-brand", MARGIN_LEFT + 62, 3734, "SwarmCursor", TYPE_STYLES.brand);
  b.addText(
    "f-copy",
    MARGIN_LEFT + 36,
    3916,
    "© 2026 CoderFake · SwarmCursor MIT License.",
    TYPE_STYLES.small
  );
  b.addText(
    "fc-h",
    560,
    3738,
    "Product",
    sansStyle(14.5, 600, 1.4, PALETTE.ink),
    { snap: "g-foot" }
  );
  b.addText("fc-1", 560, 3772, "Agents", TYPE_STYLES.item, { snap: "g-foot" });
  b.addText("fc-2", 560, 3802, "Routing", TYPE_STYLES.item);
  b.addText("fc-3", 560, 3832, "Pricing", TYPE_STYLES.item);
  b.addDupGroup(
    "fcols",
    ["fc-h", "fc-1", "fc-2", "fc-3"],
    [
      { dx: 200, dy: 0, edits: ["Company", "About", "Careers", "Blog"] },
      {
        dx: 400,
        dy: 0,
        edits: ["Developers", "Docs", "API reference", "Status"],
      },
    ]
  );

  return b.build(4060);
}

export const buildSwarmShowcaseScene = buildSwarmLandingScene;
