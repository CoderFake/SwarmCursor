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
import {
  DocsNavbar,
  type DocsCategoryKey,
  type ResponsivePreviewMode,
  type SiteViewMode,
} from "./components/DocsNavbar";
import { getDocsLocale } from "./locales";
import type { DocSection, DocsLocaleBundle, Lang } from "./types";

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

export interface SidebarGroup {
  key: Exclude<DocsCategoryKey, "all">;
  titleEn: string;
  titleVi: string;
  badge: string;
  items: DocSection[];
}

function getSectionCategoryKey(sec: DocSection): Exclude<DocsCategoryKey, "all"> {
  if (sec.category === "getting-started") return "getting-started";
  if (sec.category === "subsystems") return "subsystems";
  if (sec.id === "swarm-3d" || sec.id === "swarm-image") return "media-builders";
  return "dom-components";
}

function DocsInnerStage({
  lang,
  bundle,
  activeId,
  activeCategory,
  displayScope,
  responsiveMode,
  mobileMenuOpen,
  onSelectSection,
  onSelectCategory,
  onToggleDisplayScope,
  onResponsiveModeChange,
  onCloseMobileMenu,
  onOpenArtboard,
}: {
  lang: Lang;
  bundle: DocsLocaleBundle;
  activeId: string;
  activeCategory: DocsCategoryKey;
  displayScope: "single" | "category";
  responsiveMode: ResponsivePreviewMode;
  mobileMenuOpen: boolean;
  onSelectSection: (id: string) => void;
  onSelectCategory: (cat: DocsCategoryKey) => void;
  onToggleDisplayScope: (scope: "single" | "category") => void;
  onResponsiveModeChange: (mode: ResponsivePreviewMode) => void;
  onCloseMobileMenu: () => void;
  onOpenArtboard: () => void;
}) {
  const { engine, start } = useSwarm();
  const { ui, gettingStarted, components, subsystems } = bundle;
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const allSections = useMemo(
    () => [...gettingStarted, ...components, ...subsystems],
    [gettingStarted, components, subsystems]
  );

  const sidebarGroups: SidebarGroup[] = useMemo(() => {
    const domItems = components.filter(
      (c) => c.id !== "swarm-3d" && c.id !== "swarm-image"
    );
    const mediaItems = components.filter(
      (c) => c.id === "swarm-3d" || c.id === "swarm-image"
    );
    return [
      {
        key: "getting-started",
        titleEn: "Getting Started",
        titleVi: "1. Bắt đầu (Getting Started)",
        badge: "01",
        items: gettingStarted,
      },
      {
        key: "dom-components",
        titleEn: "DOM & React Components",
        titleVi: "2. DOM & React Components",
        badge: "02",
        items: domItems,
      },
      {
        key: "media-builders",
        titleEn: "3D & 2D Image Builders",
        titleVi: "3. Bộ dựng 3D & Ảnh 2D",
        badge: "03",
        items: mediaItems,
      },
      {
        key: "subsystems",
        titleEn: "Rust/WASM & Customization",
        titleVi: "4. Lõi WASM & Tùy biến CSS",
        badge: "04",
        items: subsystems,
      },
    ];
  }, [gettingStarted, components, subsystems]);

  const visibleGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sidebarGroups
      .filter((g) => activeCategory === "all" || g.key === activeCategory)
      .map((g) => {
        if (!q) return g;
        return {
          ...g,
          items: g.items.filter(
            (s) =>
              s.title.toLowerCase().includes(q) ||
              s.summary.toLowerCase().includes(q) ||
              s.badge.toLowerCase().includes(q) ||
              s.propsTable?.rows.some(
                (r) =>
                  r.name.toLowerCase().includes(q) ||
                  r.desc.toLowerCase().includes(q)
              )
          ),
        };
      })
      .filter((g) => g.items.length > 0);
  }, [sidebarGroups, activeCategory, searchQuery]);

  const activeSection = useMemo(
    () => allSections.find((s) => s.id === activeId) ?? allSections[0],
    [allSections, activeId]
  );

  const activeIndex = useMemo(
    () => allSections.findIndex((s) => s.id === activeSection.id),
    [allSections, activeSection]
  );

  const prevSection = activeIndex > 0 ? allSections[activeIndex - 1] : null;
  const nextSection =
    activeIndex >= 0 && activeIndex < allSections.length - 1
      ? allSections[activeIndex + 1]
      : null;

  const displayedSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return allSections.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.badge.toLowerCase().includes(q)
      );
    }
    if (displayScope === "single" && activeId !== "overview") {
      return [activeSection];
    }
    if (activeCategory === "all") {
      return allSections;
    }
    return allSections.filter((s) => getSectionCategoryKey(s) === activeCategory);
  }, [allSections, searchQuery, displayScope, activeId, activeSection, activeCategory]);

  const handleNavigate = (id: string) => {
    onSelectSection(id);
    onCloseMobileMenu();
    if (displayScope === "single") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          engine.setScroll(window.scrollY);
          start();
        }
      }, 40);
    }
  };

  const scrollToSubAnchor = (anchorId: string) => {
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const installCmd = "npm install git+https://github.com/CoderFake/SwarmCursor.git";

  const copyInstallCmd = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(installCmd);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 1800);
    }
  };

  const showHeroOverview = activeId === "overview" || displayScope === "category";

  return (
    <div id="top" className={`docs-shell is-viewport-${responsiveMode}`}>
      {/* Mobile Off-Canvas Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          className="docs-drawer-backdrop"
          onClick={onCloseMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Responsive 3-Column App Grid: Left Sidebar + Main Stage + Right TOC */}
      <div className="docs-body-grid">
        {/* LEFT SIDEBAR (Fixed on Desktop >= 1024px, Slide-Over Drawer on Tablet/Mobile < 1024px) */}
        <aside
          className={`docs-sidebar ${mobileMenuOpen ? "is-open" : ""}`}
          data-swarm-ignore="true"
        >
          <div className="docs-sidebar-sticky">
            {/* Mobile Drawer Top Header */}
            <div className="docs-drawer-header">
              <div className="docs-drawer-brand">
                <CoderFakeLogo size={26} />
                <strong>SwarmCursor Docs</strong>
              </div>
              <button
                type="button"
                className="docs-drawer-close"
                onClick={onCloseMobileMenu}
                aria-label="Close sidebar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Search Filter Input */}
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

            {/* View Scope Switcher: Single Topic vs Category Scroll */}
            <div className="docs-scope-switch">
              <button
                type="button"
                className={`docs-scope-btn ${displayScope === "single" ? "is-active" : ""}`}
                onClick={() => onToggleDisplayScope("single")}
              >
                {lang === "vi" ? "Từng bài (Single)" : "Single Guide"}
              </button>
              <button
                type="button"
                className={`docs-scope-btn ${displayScope === "category" ? "is-active" : ""}`}
                onClick={() => onToggleDisplayScope("category")}
              >
                {lang === "vi" ? "Theo nhóm (All)" : "Category Scroll"}
              </button>
            </div>

            {/* Overview / Architecture Home Item */}
            <button
              type="button"
              className={`docs-nav-link docs-nav-overview ${activeId === "overview" ? "is-active" : ""}`}
              onClick={() => {
                onSelectCategory("all");
                handleNavigate("overview");
              }}
            >
              <span className="docs-nav-num">00</span>
              <span className="docs-nav-label">
                {lang === "vi" ? "Tổng quan & Kiến trúc" : "Overview & Architecture"}
              </span>
            </button>

            {/* Category Sidebar Groups */}
            <div className="docs-sidebar-groups">
              {visibleGroups.map((group) => {
                const isCollapsed = !!collapsedGroups[group.key];
                const isCatActive = activeCategory === group.key;
                return (
                  <div
                    key={group.key}
                    className={`docs-nav-group ${isCatActive ? "is-cat-active" : ""}`}
                  >
                    <button
                      type="button"
                      className="docs-nav-group-header"
                      onClick={() => toggleGroup(group.key)}
                    >
                      <div className="docs-nav-group-title-wrap">
                        <span className="docs-group-badge">{group.badge}</span>
                        <span className="docs-nav-group-title">
                          {lang === "vi" ? group.titleVi : group.titleEn}
                        </span>
                      </div>
                      <span className="docs-group-chevron">
                        {isCollapsed ? "+" : "−"}
                      </span>
                    </button>

                    {!isCollapsed && (
                      <div className="docs-nav-group-items">
                        {group.items.map((s) => {
                          const globalIdx = allSections.findIndex((x) => x.id === s.id);
                          const isActive = activeId === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              className={`docs-nav-link ${isActive ? "is-active" : ""}`}
                              onClick={() => handleNavigate(s.id)}
                            >
                              <span className="docs-nav-num">
                                {String(globalIdx + 1).padStart(2, "0")}
                              </span>
                              <span className="docs-nav-label">{s.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
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

        {/* CENTER MAIN DOCUMENTATION STAGE */}
        <main className="docs-main-column">
          {/* Responsive Mode Banner when testing Desktop / Tablet / Mobile frame */}
          {responsiveMode !== "full" && (
            <div className="docs-viewport-banner" data-swarm-ignore="true">
              <div className="docs-viewport-info">
                <span className="docs-pulse-dot" />
                <strong>
                  {lang === "vi" ? "Khung nhìn Responsive:" : "Responsive Viewport:"}{" "}
                  {responsiveMode.toUpperCase()}
                </strong>
                <span>
                  {responsiveMode === "desktop"
                    ? "1280px Container"
                    : responsiveMode === "tablet"
                    ? "768px iPad / Tablet Breakpoint"
                    : "390px iPhone / Mobile Breakpoint"}
                </span>
              </div>
              <button
                type="button"
                className="docs-viewport-reset"
                onClick={() => onResponsiveModeChange("full")}
              >
                {lang === "vi" ? "Đặt lại Auto (100%)" : "Reset to Auto (100%)"}
              </button>
            </div>
          )}

          {/* Architectural Hero Bento (Shown on Overview or Category Scroll) */}
          {showHeroOverview && (
            <section id="docs-hero" className="docs-hero">
              <div className="docs-hero-left" id="docs-hero-card" data-swarm="rect">
                <div className="docs-hero-pill-row">
                  <CoderFakeLogo size={38} />
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
                  <button
                    type="button"
                    className="docs-primary-btn"
                    onClick={() => handleNavigate("installation")}
                  >
                    <span>{ui.hero.ctaStart}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
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
                      onClick={() => handleNavigate(item.target)}
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
          )}

          {/* Category Quick Cards when on Overview */}
          {activeId === "overview" && displayScope === "single" && (
            <section className="docs-category-overview-grid">
              {sidebarGroups.map((grp) => (
                <div
                  key={grp.key}
                  id={`cat-card-${grp.key}`}
                  className="docs-category-card"
                  data-swarm="rect"
                >
                  <div className="docs-category-card-head">
                    <span className="docs-section-index">GROUP {grp.badge}</span>
                    <span className="docs-section-badge">
                      {grp.items.length} {lang === "vi" ? "bài hướng dẫn" : "guides"}
                    </span>
                  </div>
                  <h3>{lang === "vi" ? grp.titleVi : grp.titleEn}</h3>
                  <div className="docs-category-card-links">
                    {grp.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="docs-category-item-btn"
                        onClick={() => handleNavigate(item.id)}
                      >
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.summary}</p>
                        </div>
                        <span>→</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Active Guide Cards */}
          {(activeId !== "overview" || displayScope === "category") &&
            displayedSections.map((section) => {
              const globalIdx = allSections.findIndex((x) => x.id === section.id);
              return (
                <DocSectionCard
                  key={section.id}
                  section={section}
                  index={globalIdx >= 0 ? globalIdx : 0}
                  ui={ui}
                />
              );
            })}

          {/* Previous / Next Guide Pagination Bar */}
          {activeId !== "overview" && displayScope === "single" && (
            <nav className="docs-pagination" aria-label="Guide Pagination">
              {prevSection ? (
                <button
                  type="button"
                  className="docs-page-btn is-prev"
                  onClick={() => handleNavigate(prevSection.id)}
                >
                  <span className="docs-page-hint">
                    ← {lang === "vi" ? "Bài trước" : "Previous Guide"}
                  </span>
                  <strong>{prevSection.title}</strong>
                </button>
              ) : (
                <button
                  type="button"
                  className="docs-page-btn is-prev"
                  onClick={() => handleNavigate("overview")}
                >
                  <span className="docs-page-hint">
                    ← {lang === "vi" ? "Quay lại" : "Back to"}
                  </span>
                  <strong>
                    {lang === "vi" ? "00. Tổng quan & Kiến trúc" : "00. Overview & Architecture"}
                  </strong>
                </button>
              )}

              {nextSection && (
                <button
                  type="button"
                  className="docs-page-btn is-next"
                  onClick={() => handleNavigate(nextSection.id)}
                >
                  <span className="docs-page-hint">
                    {lang === "vi" ? "Bài tiếp theo" : "Next Guide"} →
                  </span>
                  <strong>{nextSection.title}</strong>
                </button>
              )}
            </nav>
          )}

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

        {/* RIGHT SIDEBAR: "On This Page" Outline + Responsive Breakpoints Inspector */}
        <aside className="docs-right-toc" data-swarm-ignore="true">
          <div className="docs-toc-sticky">
            <div className="docs-toc-section">
              <div className="docs-toc-title">
                {lang === "vi" ? "TRÊN TRANG NÀY" : "ON THIS PAGE"}
              </div>
              {activeId === "overview" && displayScope === "single" ? (
                <div className="docs-toc-links">
                  <button
                    type="button"
                    className="docs-toc-link"
                    onClick={() => scrollToSubAnchor("docs-hero")}
                  >
                    {lang === "vi" ? "Hero & Cài đặt nhanh" : "Hero & Quick Install"}
                  </button>
                  <button
                    type="button"
                    className="docs-toc-link"
                    onClick={() => scrollToSubAnchor("docs-hero-stats")}
                  >
                    {lang === "vi" ? "Ma trận 8 Sub-Packages" : "8 Sub-Packages Matrix"}
                  </button>
                  {sidebarGroups.map((grp) => (
                    <button
                      key={grp.key}
                      type="button"
                      className="docs-toc-link"
                      onClick={() => scrollToSubAnchor(`cat-card-${grp.key}`)}
                    >
                      {lang === "vi" ? grp.titleVi : grp.titleEn}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="docs-toc-links">
                  <button
                    type="button"
                    className="docs-toc-link"
                    onClick={() => scrollToSubAnchor(`${activeSection.id}-overview`)}
                  >
                    {lang === "vi" ? "1. Tổng quan" : "1. Overview"}
                  </button>
                  {activeSection.steps && activeSection.steps.length > 0 && (
                    <button
                      type="button"
                      className="docs-toc-link"
                      onClick={() => scrollToSubAnchor(`${activeSection.id}-steps`)}
                    >
                      {lang === "vi" ? "2. Quy trình 3 bước" : "2. 3-Step Workflow"}
                    </button>
                  )}
                  {activeSection.sandbox && (
                    <button
                      type="button"
                      className="docs-toc-link is-highlight"
                      onClick={() => scrollToSubAnchor(`${activeSection.id}-sandbox`)}
                    >
                      {lang === "vi" ? "★ Live Sandbox" : "★ Live Sandbox"}
                    </button>
                  )}
                  {activeSection.codeExamples.map((ex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="docs-toc-link docs-toc-sublink"
                      onClick={() => scrollToSubAnchor(`${activeSection.id}-code-${idx}`)}
                    >
                      {ex.filename}
                    </button>
                  ))}
                  {activeSection.propsTable && (
                    <button
                      type="button"
                      className="docs-toc-link"
                      onClick={() => scrollToSubAnchor(`${activeSection.id}-props`)}
                    >
                      {lang === "vi" ? "Bảng Props & API" : "Props & API Table"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Responsive Breakpoints Card in Right Sidebar */}
            <div className="docs-toc-resp-card">
              <div className="docs-toc-title">
                {lang === "vi" ? "KIỂM THỬ RESPONSIVE" : "RESPONSIVE PREVIEW"}
              </div>
              <div className="docs-toc-resp-grid">
                {(
                  [
                    { id: "full", label: "Auto (100%)", size: "Fluid" },
                    { id: "desktop", label: "Desktop", size: "1280px" },
                    { id: "tablet", label: "Tablet", size: "768px" },
                    { id: "mobile", label: "Mobile", size: "390px" },
                  ] as Array<{ id: ResponsivePreviewMode; label: string; size: string }>
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`docs-toc-resp-btn ${responsiveMode === item.id ? "is-active" : ""}`}
                    onClick={() => onResponsiveModeChange(item.id)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.size}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
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
  const [activeCategory, setActiveCategory] = useState<DocsCategoryKey>("all");
  const [displayScope, setDisplayScope] = useState<"single" | "category">("single");
  const [responsiveMode, setResponsiveMode] = useState<ResponsivePreviewMode>("full");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const currentSectionTitle = useMemo(() => {
    if (activeId === "overview") {
      return lang === "vi" ? "Tổng quan & Kiến trúc" : "Overview & Architecture";
    }
    const found = allSections.find((s) => s.id === activeId);
    return found ? found.title : allSections[0].title;
  }, [activeId, allSections, lang]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  useEffect(() => {
    if (viewMode !== "docs" || displayScope === "single") return;
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
  }, [viewMode, displayScope, allSections]);

  const handleSelectCategory = (cat: DocsCategoryKey) => {
    setActiveCategory(cat);
    if (cat === "all") {
      setActiveId("overview");
    } else {
      const firstMatch = allSections.find((s) => getSectionCategoryKey(s) === cat);
      if (firstMatch) {
        setActiveId(firstMatch.id);
      }
    }
    setReplaySignal((n) => n + 1);
  };

  const handleSelectSection = (id: string) => {
    setActiveId(id);
    if (id !== "overview") {
      const found = allSections.find((s) => s.id === id);
      if (found && activeCategory !== "all" && getSectionCategoryKey(found) !== activeCategory) {
        setActiveCategory("all");
      }
    }
    setReplaySignal((n) => n + 1);
  };

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
          setMobileMenuOpen(false);
          window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        }}
        onReplaySwarm={() => setReplaySignal((n) => n + 1)}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        responsiveMode={responsiveMode}
        onResponsiveModeChange={setResponsiveMode}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((o) => !o)}
        currentSectionTitle={currentSectionTitle}
      />

      {viewMode === "docs" ? (
        <SwarmProvider
          key={`docs-provider-${lang}-${activeId}-${displayScope}-${replaySignal}`}
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
            activeCategory={activeCategory}
            displayScope={displayScope}
            responsiveMode={responsiveMode}
            mobileMenuOpen={mobileMenuOpen}
            onSelectSection={handleSelectSection}
            onSelectCategory={handleSelectCategory}
            onToggleDisplayScope={(scope) => {
              setDisplayScope(scope);
              setReplaySignal((n) => n + 1);
            }}
            onResponsiveModeChange={setResponsiveMode}
            onCloseMobileMenu={() => setMobileMenuOpen(false)}
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
