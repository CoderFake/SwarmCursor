import React, { useEffect, useMemo, useState } from "react";
import {
  SwarmCanvas,
  SwarmControls,
  SwarmElement,
  SwarmProvider,
  useSwarm,
} from "../react";
import { wasmKernel } from "../kernel";
import { buildSwarmLandingScene } from "../presets/swarm-landing";
import { CoderFakeLogo } from "./components/CoderFakeLogo";
import { DocSectionCard } from "./components/DocSectionCard";
import { DocsNavbar, type SiteViewMode } from "./components/DocsNavbar";
import { getDocsLocale } from "./locales";
import type { DocsLocaleBundle, Lang } from "./types";

const SUBPACKAGE_MATRIX = [
  { pkg: "/engine", role: "ECS & Scheduler", target: "subsystems-reference", accent: "#8B5CF6" },
  { pkg: "/kernel", role: "Rust/WASM SIMD128", target: "subsystems-reference", accent: "#0EA5E9" },
  { pkg: "/three", role: "3D Mesh & Slicing", target: "swarm-3d", accent: "#10B981" },
  { pkg: "/tools", role: "2D Image & Pen", target: "swarm-image", accent: "#F59E0B" },
  { pkg: "/scanner", role: "DOM Auto-Scanner", target: "swarm-provider", accent: "#EC4899" },
  { pkg: "/renderers", role: "SVG & Rulers", target: "swarm-canvas", accent: "#3B82F6" },
  { pkg: "/react", role: "7 Components", target: "quick-start", accent: "#6366F1" },
  { pkg: "/presets", role: "Scenes & Themes", target: "theming-and-attributes", accent: "#14B8A6" },
];

const SQUAD_AGENTS = [
  { name: "Architect", color: "#6D5DF6" },
  { name: "Sculptor 3D", color: "#0EA5E9" },
  { name: "Scanner 2D", color: "#10B981" },
  { name: "Typist", color: "#F59E0B" },
  { name: "Inspector", color: "#EF4444" },
];

function DocsInnerStage({
  lang,
  bundle,
  activeId,
  onSelectSection,
  onOpenArtboard,
}: {
  lang: Lang;
  bundle: DocsLocaleBundle;
  activeId: string;
  onSelectSection: (id: string) => void;
  onOpenArtboard: () => void;
}) {
  const { engine, start } = useSwarm();
  const { ui, gettingStarted, components, subsystems } = bundle;
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const allSections = useMemo(
    () => [...gettingStarted, ...components, ...subsystems],
    [gettingStarted, components, subsystems]
  );

  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allSections;
    return allSections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.badge.toLowerCase().includes(q) ||
        s.propsTable?.rows.some(
          (r) => r.name.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q)
        )
    );
  }, [allSections, searchQuery]);

  const scrollToSection = (id: string) => {
    onSelectSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      engine.setScroll(window.scrollY);
      start();
    }
  };

  const installCmd = "npm install git+https://github.com/CoderFake/SwarmCursor.git";

  const copyInstallCmd = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(installCmd);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 1800);
    }
  };

  return (
    <div id="top" className="docs-shell">
      {/* Architectural Hero Bento */}
      <section id="docs-hero" className="docs-hero">
        <div className="docs-hero-left" id="docs-hero-card" data-swarm="rect">
          <div className="docs-hero-pill-row">
            <CoderFakeLogo size={40} />
            <div className="docs-hero-tag-wrap">
              <span className="docs-hero-tag">{ui.hero.tag}</span>
            </div>
          </div>

          <SwarmElement id="docs-hero-h1" tool="text" grow snapAxis="x">
            <h1 className="docs-hero-title">{ui.hero.title}</h1>
          </SwarmElement>

          <p className="docs-hero-lead">{ui.hero.lead}</p>

          <div className="docs-terminal-bar">
            <div className="docs-terminal-code">
              <span className="docs-terminal-prompt">$</span>
              <code>{installCmd}</code>
            </div>
            <button
              type="button"
              className={`docs-terminal-copy ${copiedCmd ? "is-copied" : ""}`}
              onClick={copyInstallCmd}
            >
              {copiedCmd ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{ui.table.copiedBtn.replace("✓ ", "")}</span>
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>{ui.table.copyBtn}</span>
                </>
              )}
            </button>
          </div>

          <div className="docs-hero-cta-row">
            <a
              href="#installation"
              className="docs-primary-btn"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("installation");
              }}
            >
              <span>{ui.hero.ctaStart}</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
            </a>
            <button
              type="button"
              className="docs-secondary-btn"
              onClick={onOpenArtboard}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
              <span>{ui.nav.artboardMode}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Dark Architectural Telemetry Console */}
        <div id="docs-hero-stats" className="docs-hero-console" data-swarm="rect">
          <div className="docs-console-topbar">
            <div className="docs-console-status">
              <span className="docs-pulse-dot" />
              <span>
                {wasmKernel.isWasmAccelerated
                  ? "RUST/WASM SIMD128 ACTIVE"
                  : "SIMD128 KERNEL READY"}
              </span>
            </div>
            <div className="docs-squad-pills">
              {SQUAD_AGENTS.map((ag) => (
                <span
                  key={ag.name}
                  className="docs-squad-dot"
                  style={{ background: ag.color }}
                  title={ag.name}
                />
              ))}
            </div>
          </div>

          <div className="docs-subpkg-grid">
            {SUBPACKAGE_MATRIX.map((item) => (
              <button
                key={item.pkg}
                type="button"
                className="docs-subpkg-card"
                onClick={() => scrollToSection(item.target)}
              >
                <div className="docs-subpkg-head">
                  <span className="docs-subpkg-dot" style={{ background: item.accent }} />
                  <code>{item.pkg}</code>
                </div>
                <span className="docs-subpkg-role">{item.role}</span>
              </button>
            ))}
          </div>

          <div className="docs-console-stats">
            {ui.hero.stats.map((st, idx) => (
              <div key={idx} className="docs-stat-box">
                <strong>{st.title}</strong>
                <span>{st.subtitle}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout: Sticky Sidebar + Modular Guide Sections */}
      <div className="docs-body-grid">
        <aside className="docs-sidebar" data-swarm-ignore="true">
          <div className="docs-sidebar-sticky">
            <div className="docs-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "vi" ? "Tìm mục hoặc prop..." : "Filter guides & props..."}
                className="docs-search-input"
              />
            </div>

            <div className="docs-nav-group">
              <div className="docs-nav-group-title">{ui.sidebar.gettingStarted}</div>
              {gettingStarted.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  className={`docs-nav-link ${activeId === s.id ? "is-active" : ""}`}
                  onClick={() => scrollToSection(s.id)}
                >
                  <span className="docs-nav-num">0{idx + 1}</span>
                  <span className="docs-nav-label">{s.title}</span>
                </button>
              ))}
            </div>

            <div className="docs-nav-group">
              <div className="docs-nav-group-title">{ui.sidebar.components}</div>
              {components.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  className={`docs-nav-link ${activeId === s.id ? "is-active" : ""}`}
                  onClick={() => scrollToSection(s.id)}
                >
                  <span className="docs-nav-num">0{gettingStarted.length + idx + 1}</span>
                  <span className="docs-nav-label">{s.title}</span>
                </button>
              ))}
            </div>

            <div className="docs-nav-group">
              <div className="docs-nav-group-title">{ui.sidebar.subsystems}</div>
              {subsystems.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  className={`docs-nav-link ${activeId === s.id ? "is-active" : ""}`}
                  onClick={() => scrollToSection(s.id)}
                >
                  <span className="docs-nav-num">
                    0{gettingStarted.length + components.length + idx + 1}
                  </span>
                  <span className="docs-nav-label">{s.title}</span>
                </button>
              ))}
            </div>

            <div className="docs-sidebar-footer">
              <a
                href={`https://github.com/CoderFake/SwarmCursor/tree/main/docs/${lang}`}
                target="_blank"
                rel="noreferrer"
                className="docs-md-tree-link"
              >
                <span>docs/{lang}/ Markdown Tree</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </aside>

        <main className="docs-main-column">
          {filteredSections.map((section, idx) => (
            <DocSectionCard
              key={section.id}
              section={section}
              index={idx}
              ui={ui}
            />
          ))}

          <footer id="docs-footer" className="docs-footer" data-swarm="rect">
            <div className="docs-footer-brand">
              <CoderFakeLogo size={36} />
              <div>
                <strong>{ui.footer.title}</strong>
                <p>{ui.footer.subtitle}</p>
              </div>
            </div>
            <div className="docs-footer-links">
              <a
                href="https://github.com/CoderFake/SwarmCursor/tree/main/docs/en"
                target="_blank"
                rel="noreferrer"
                className="docs-github-btn"
              >
                docs/en ↗
              </a>
              <a
                href="https://github.com/CoderFake/SwarmCursor/tree/main/docs/vi"
                target="_blank"
                rel="noreferrer"
                className="docs-github-btn"
              >
                docs/vi ↗
              </a>
              <a
                href="https://github.com/CoderFake/SwarmCursor"
                target="_blank"
                rel="noreferrer"
                className="docs-github-btn"
              >
                GitHub ↗
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export function DocsApp() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get("lang");
      if (urlLang === "en" || urlLang === "vi") return urlLang;
    }
    return "en";
  });
  const [viewMode, setViewMode] = useState<SiteViewMode>("docs");
  const [activeId, setActiveId] = useState<string>("installation");
  const [replaySignal, setReplaySignal] = useState<number>(0);

  const bundle = useMemo(() => getDocsLocale(lang), [lang]);
  const allSections = useMemo(
    () => [
      ...bundle.gettingStarted,
      ...bundle.components,
      ...bundle.subsystems,
    ],
    [bundle]
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  useEffect(() => {
    if (viewMode !== "docs") return;
    const onScroll = () => {
      const scrollY = window.scrollY + 180;
      for (let i = allSections.length - 1; i >= 0; i--) {
        const el = document.getElementById(allSections[i].id);
        if (el && el.offsetTop <= scrollY) {
          setActiveId(allSections[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [viewMode, allSections]);

  return (
    <div className="docs-root">
      <DocsNavbar
        lang={lang}
        ui={bundle.ui}
        onLangChange={(nextLang) => {
          setLang(nextLang);
          if (typeof window !== "undefined" && window.history?.replaceState) {
            const url = new URL(window.location.href);
            url.searchParams.set("lang", nextLang);
            window.history.replaceState({}, "", url.toString());
          }
          setReplaySignal((n) => n + 1);
        }}
        viewMode={viewMode}
        onViewModeChange={(m) => {
          setViewMode(m);
          window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        }}
        onReplaySwarm={() => setReplaySignal((n) => n + 1)}
      />

      {viewMode === "docs" ? (
        <SwarmProvider
          key={`docs-provider-${lang}-${replaySignal}`}
          scrollMode="manual"
          autoScrollSpeed={180}
          autoStart={true}
          deepScan={false}
          fastMode={true}
          showCursorLabels={true}
          agentPill={{ maxIcons: 5, position: "bottom-center" }}
        >
          <DocsInnerStage
            lang={lang}
            bundle={bundle}
            activeId={activeId}
            onSelectSection={setActiveId}
            onOpenArtboard={() => {
              setViewMode("artboard");
              window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
            }}
          />
          <SwarmControls position="bottom-right" />
        </SwarmProvider>
      ) : (
        <div className="docs-artboard-stage">
          <SwarmCanvas
            key="artboard-canvas"
            scene={buildSwarmLandingScene}
            scrollMode="hybrid"
            autoScrollSpeed={180}
            controls={true}
            controlsPosition="bottom-right"
            showCursorLabels={true}
            showIntroLogo={true}
            agentPill={{ maxIcons: 5, position: "bottom-center" }}
          />
        </div>
      )}
    </div>
  );
}
