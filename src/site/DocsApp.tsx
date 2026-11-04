import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SwarmCanvas,
  SwarmControls,
  SwarmElement,
  SwarmProvider,
} from "../react";
import { wasmKernel } from "../kernel";
import { buildSwarmLandingScene } from "../presets/swarm-landing";
import { DocSectionCard } from "./components/DocSectionCard";
import {
  HubSidebar,
  HubTopbar,
  ModuleIcon,
  type HubModuleGroup,
  type HubModuleKey,
  type SiteViewMode,
} from "./components/DocsNavbar";
import { getDocsLocale } from "./locales";
import type { DocSection, DocsLocaleBundle, Lang } from "./types";

const SUBPACKAGE_PATHS = [
  { pkg: "swarm-cursor", descEn: "Full Bundle", descVi: "Gói tổng hợp" },
  { pkg: "swarm-cursor/react", descEn: "7 React Components", descVi: "7 React Components" },
  { pkg: "swarm-cursor/three", descEn: "3D & GLB Sculptor", descVi: "Điêu khắc 3D & GLB" },
  { pkg: "swarm-cursor/tools", descEn: "2D Image & Pen Tools", descVi: "Quét ảnh 2D & Công cụ vẽ" },
  { pkg: "swarm-cursor/kernel", descEn: "Rust/WASM SIMD128", descVi: "Lõi Rust/WASM SIMD128" },
  { pkg: "swarm-cursor/engine", descEn: "ECS & Task Auction", descVi: "ECS & Đấu giá tác vụ" },
  { pkg: "swarm-cursor/scanner", descEn: "DOM Auto-Scanner", descVi: "Bộ quét DOM tự động" },
  { pkg: "swarm-cursor/renderers", descEn: "Zero-Tick Renderers", descVi: "Bộ dựng 60fps trực tiếp" },
];

function HubCatalogView({
  lang,
  bundle,
  modules,
  onSelectModule,
  onSelectSection,
  onOpenArtboard,
}: {
  lang: Lang;
  bundle: DocsLocaleBundle;
  modules: HubModuleGroup[];
  onSelectModule: (key: HubModuleKey) => void;
  onSelectSection: (id: string) => void;
  onOpenArtboard: () => void;
}) {
  const { ui } = bundle;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const installCmd = "npm install git+https://github.com/CoderFake/SwarmCursor.git";

  const copyText = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1600);
    }
  };

  return (
    <div className="hub-page-stack">
      {/* PageTitle (Identical to WEUP_MCP_HUB/shared/ui/page-title.tsx) */}
      <div className="hub-page-title">
        <div className="hub-page-title-main">
          <SwarmElement id="hub-catalog-h1" tool="text" grow snapAxis="x">
            <h1>
              {lang === "vi"
                ? "Kho Module & Tài liệu SwarmCursor 2.0"
                : "SwarmCursor 2.0 Module & Documentation Hub"}
            </h1>
          </SwarmElement>
          <p className="hub-page-desc">{ui.hero.lead}</p>
        </div>
        <div className="hub-page-title-actions">
          <button
            type="button"
            className="hub-btn-primary"
            onClick={() => onSelectSection("installation")}
          >
            <span>{ui.hero.ctaStart}</span>
            <span>→</span>
          </button>
          <button
            type="button"
            className="hub-btn-outline"
            onClick={onOpenArtboard}
          >
            <span>{ui.nav.artboardMode}</span>
            <span>↗</span>
          </button>
        </div>
      </div>

      {/* Module Catalog Grid (Identical to WEUP_MCP_HUB CatalogCard Grid) */}
      <div className="hub-catalog-grid">
        {modules.map((mod) => (
          <section
            key={mod.key}
            id={`catalog-card-${mod.key}`}
            className="hub-catalog-card"
            data-swarm="rect"
          >
            <div className="hub-catalog-head">
              <div className="hub-catalog-icon">
                <ModuleIcon moduleKey={mod.key} size={22} />
              </div>
              <div className="hub-catalog-meta">
                <h2>{lang === "vi" ? mod.titleVi : mod.titleEn}</h2>
                <p>
                  {mod.items.length} {lang === "vi" ? "tài liệu" : "guides"} · v2.0.0
                </p>
              </div>
            </div>

            <div className="hub-catalog-badges">
              <span className="hub-badge is-success">
                {lang === "vi" ? "Sẵn sàng 60fps" : "60fps Ready"}
              </span>
              <span className="hub-badge is-soft">
                {lang === "vi" ? mod.badgeVi : mod.badgeEn}
              </span>
            </div>

            <p className="hub-catalog-desc">
              {lang === "vi" ? mod.subtitleVi : mod.subtitleEn}
            </p>

            <code className="hub-code-value">{mod.importPath}</code>

            {/* Direct Guide Links inside this Module */}
            <div className="hub-catalog-topics">
              {mod.items.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  className="hub-topic-pill"
                  onClick={() => onSelectSection(sec.id)}
                >
                  <span>{sec.title}</span>
                  <span>→</span>
                </button>
              ))}
            </div>

            <div className="hub-catalog-footer">
              <button
                type="button"
                className="hub-btn-outline is-sm"
                onClick={() => onSelectModule(mod.key)}
              >
                <span>
                  {lang === "vi" ? "Mở Không gian Module" : "Open Module Workspace"}
                </span>
                <span>↗</span>
              </button>
            </div>
          </section>
        ))}
      </div>

      {/* Quick Connection & Sub-Packages Panel (WEUP_MCP_HUB McpUrlsPanel style) */}
      <section
        id="hub-quick-install"
        className="hub-panel"
        data-swarm="rect"
      >
        <div className="hub-panel-header">
          <div>
            <h2>
              {lang === "vi"
                ? "Cài đặt nhanh & 8 Sub-Packages độc lập"
                : "Quick Installation & 8 Tree-Shakeable Sub-Packages"}
            </h2>
            <p>
              {lang === "vi"
                ? "Cài đặt trực tiếp từ GitHub và chỉ import đúng sub-package bạn cần sử dụng."
                : "Install directly from GitHub and import only the sub-packages your application requires."}
            </p>
          </div>
          <span className="hub-badge is-success">
            {wasmKernel.isWasmAccelerated
              ? "SIMD128 Accelerated"
              : "SIMD128 Ready"}
          </span>
        </div>

        <div className="hub-panel-body">
          <div className="hub-install-row">
            <code className="hub-code-value is-lg">{installCmd}</code>
            <button
              type="button"
              className={`hub-btn-outline is-sm ${copiedKey === "install" ? "is-copied" : ""}`}
              onClick={() => copyText(installCmd, "install")}
            >
              {copiedKey === "install"
                ? ui.table.copiedBtn.replace("✓ ", "")
                : ui.table.copyBtn}
            </button>
          </div>

          <div className="hub-subpkg-grid">
            {SUBPACKAGE_PATHS.map((sp) => (
              <div key={sp.pkg} className="hub-subpkg-row">
                <div className="hub-subpkg-info">
                  <code>{sp.pkg}</code>
                  <span>{lang === "vi" ? sp.descVi : sp.descEn}</span>
                </div>
                <button
                  type="button"
                  className="hub-copy-mini"
                  onClick={() =>
                    copyText(`import {} from "${sp.pkg}";`, sp.pkg)
                  }
                >
                  {copiedKey === sp.pkg
                    ? ui.table.copiedBtn.replace("✓ ", "")
                    : ui.table.copyBtn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
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
  const [activePageId, setActivePageId] = useState<string>("catalog");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [replaySignal, setReplaySignal] = useState(0);
  const mainScrollRef = useRef<HTMLElement | null>(null);

  const bundle = useMemo(() => getDocsLocale(lang), [lang]);
  const allSections = useMemo(
    () => [
      ...bundle.gettingStarted,
      ...bundle.components,
      ...bundle.subsystems,
    ],
    [bundle]
  );

  const modules: HubModuleGroup[] = useMemo(() => {
    const domItems = bundle.components.filter(
      (c) => c.id !== "swarm-3d" && c.id !== "swarm-image"
    );
    const mediaItems = bundle.components.filter(
      (c) => c.id === "swarm-3d" || c.id === "swarm-image"
    );
    return [
      {
        key: "getting-started",
        titleEn: "Getting Started",
        titleVi: "Bắt đầu & Cài đặt",
        subtitleEn:
          "Install SwarmCursor 2.0, explore the 8 modular sub-packages, and choose from 3 integration modes.",
        subtitleVi:
          "Cài đặt SwarmCursor 2.0, khám phá kiến trúc 8 sub-packages và 3 chế độ tích hợp nhanh.",
        badgeEn: "Setup & Quick Start",
        badgeVi: "Cài đặt & Khởi tạo",
        importPath: 'import { SwarmProvider } from "swarm-cursor/react"',
        items: bundle.gettingStarted,
      },
      {
        key: "dom-components",
        titleEn: "DOM & React Components",
        titleVi: "DOM & React Components",
        subtitleEn:
          "Auto-scan live HTML/React DOM layouts with <SwarmProvider>, <SwarmCanvas>, <SwarmFollower>, and <SwarmControls>.",
        subtitleVi:
          "Tự động quét và dựng giao diện React/DOM bằng <SwarmProvider>, <SwarmCanvas>, <SwarmFollower> và <SwarmControls>.",
        badgeEn: "React 18 / 19",
        badgeVi: "React 18 / 19",
        importPath: 'import { SwarmProvider, SwarmElement } from "swarm-cursor/react"',
        items: domItems,
      },
      {
        key: "media-builders",
        titleEn: "3D & 2D Media Builders",
        titleVi: "Bộ dựng 3D & Ảnh 2D",
        subtitleEn:
          "Choreograph Three.js/GLB 3D meshes (extrude, particles, slice) and 2D images (mosaic, scanline, halftone).",
        subtitleVi:
          "Điêu khắc mô hình 3D Three.js/GLB (extrude, particles, slice) và quét ảnh 2D (mosaic, scanline, halftone).",
        badgeEn: "Three.js & 2D Image",
        badgeVi: "Three.js & Ảnh 2D",
        importPath: 'import { Swarm3D, SwarmImage } from "swarm-cursor/react"',
        items: mediaItems,
      },
      {
        key: "subsystems",
        titleEn: "Rust/WASM & CSS Theming",
        titleVi: "Lõi WASM & Thuộc tính CSS",
        subtitleEn:
          "Direct access to the 5 Rust/WASM SIMD128 kernels, ECS scheduler, data-swarm-* HTML attributes, and CSS tokens.",
        subtitleVi:
          "Truy cập trực tiếp 5 hàm lõi Rust/WASM SIMD128, bộ lập lịch ECS, thuộc tính data-swarm-* và biến CSS.",
        badgeEn: "SIMD128 & Tokens",
        badgeVi: "SIMD128 & Biến CSS",
        importPath: 'import { wasmKernel } from "swarm-cursor/kernel"',
        items: bundle.subsystems,
      },
    ];
  }, [bundle]);

  const activeSection: DocSection | null = useMemo(() => {
    if (activePageId === "catalog") return null;
    return allSections.find((s) => s.id === activePageId) ?? allSections[0];
  }, [activePageId, allSections]);

  const activeModule: HubModuleGroup | null = useMemo(() => {
    if (!activeSection) return null;
    return (
      modules.find((m) => m.items.some((i) => i.id === activeSection.id)) ??
      null
    );
  }, [activeSection, modules]);

  const activeSectionIdx = useMemo(() => {
    if (!activeSection) return -1;
    return allSections.findIndex((s) => s.id === activeSection.id);
  }, [activeSection, allSections]);

  const prevSection =
    activeSectionIdx > 0 ? allSections[activeSectionIdx - 1] : null;
  const nextSection =
    activeSectionIdx >= 0 && activeSectionIdx < allSections.length - 1
      ? allSections[activeSectionIdx + 1]
      : null;

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const scrollMainToTop = () => {
    mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectCatalog = () => {
    setActivePageId("catalog");
    setReplaySignal((n) => n + 1);
    scrollMainToTop();
  };

  const handleSelectModule = (modKey: HubModuleKey) => {
    const found = modules.find((m) => m.key === modKey);
    if (found && found.items.length > 0) {
      setActivePageId(found.items[0].id);
      setReplaySignal((n) => n + 1);
      scrollMainToTop();
    }
  };

  const handleSelectSection = (secId: string) => {
    setActivePageId(secId);
    setReplaySignal((n) => n + 1);
    scrollMainToTop();
  };

  const handleScrollToAnchor = (anchorId: string) => {
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="hub-shell">
      {/* Left Floating Rounded-[28px] Context-Aware Sidebar (Identical to WEUP_MCP_HUB) */}
      <HubSidebar
        lang={lang}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        viewMode={viewMode}
        onViewModeChange={(m) => {
          setViewMode(m);
          scrollMainToTop();
        }}
        activePageId={activePageId}
        activeModule={activeModule}
        modules={modules}
        activeSection={activeSection}
        onSelectCatalog={handleSelectCatalog}
        onSelectModule={handleSelectModule}
        onSelectSection={handleSelectSection}
        onScrollToAnchor={handleScrollToAnchor}
        onLangChange={(nextLang) => {
          setLang(nextLang);
          if (typeof window !== "undefined" && window.history?.replaceState) {
            const url = new URL(window.location.href);
            url.searchParams.set("lang", nextLang);
            window.history.replaceState({}, "", url.toString());
          }
          setReplaySignal((n) => n + 1);
        }}
      />

      {/* Right Workspace Column */}
      <div
        className={`hub-workspace ${
          sidebarCollapsed ? "is-sidebar-collapsed" : ""
        }`}
      >
        {/* Subtle Aurora Background */}
        <div className="hub-aurora" aria-hidden="true" />

        {/* Single Floating Pill Header (NO double header!) */}
        <HubTopbar
          lang={lang}
          ui={bundle.ui}
          viewMode={viewMode}
          activePageId={activePageId}
          activeModule={activeModule}
          activeSection={activeSection}
          onOpenMobile={() => setMobileOpen(true)}
          onSelectCatalog={handleSelectCatalog}
          onSelectModule={handleSelectModule}
          onViewModeChange={(m) => {
            setViewMode(m);
            scrollMainToTop();
          }}
          onReplaySwarm={() => setReplaySignal((n) => n + 1)}
          onLangChange={(nextLang) => {
            setLang(nextLang);
            if (typeof window !== "undefined" && window.history?.replaceState) {
              const url = new URL(window.location.href);
              url.searchParams.set("lang", nextLang);
              window.history.replaceState({}, "", url.toString());
            }
            setReplaySignal((n) => n + 1);
          }}
        />

        {/* Scrollable Main Content Area */}
        <main id="main" ref={mainScrollRef} className="hub-main">
          {viewMode === "docs" ? (
            <SwarmProvider
              key={`hub-swarm-${lang}-${activePageId}-${replaySignal}`}
              scrollMode="manual"
              autoScrollSpeed={180}
              autoStart={true}
              showRulers={false}
              deepScan={false}
              fastMode={true}
              showCursorLabels={true}
              agentPill={{ maxIcons: 5, position: "bottom-center" }}
            >
              {activePageId === "catalog" || !activeSection ? (
                <HubCatalogView
                  lang={lang}
                  bundle={bundle}
                  modules={modules}
                  onSelectModule={handleSelectModule}
                  onSelectSection={handleSelectSection}
                  onOpenArtboard={() => {
                    setViewMode("artboard");
                    scrollMainToTop();
                  }}
                />
              ) : (
                <DocSectionCard
                  lang={lang}
                  section={activeSection}
                  ui={bundle.ui}
                  prevSection={prevSection}
                  nextSection={nextSection}
                  onBackToCatalog={handleSelectCatalog}
                  onNavigateSection={handleSelectSection}
                />
              )}
              <SwarmControls position="bottom-right" />
            </SwarmProvider>
          ) : (
            <div className="hub-artboard-wrap">
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
        </main>

        {/* Minimal Workspace Footer (Identical to WEUP_MCP_HUB) */}
        <footer className="hub-footer" data-swarm-ignore="true">
          <div className="hub-footer-inner">
            <span>{bundle.ui.footer.title}</span>
            <span>{bundle.ui.footer.subtitle}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
