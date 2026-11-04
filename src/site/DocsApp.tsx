import React, { useEffect, useMemo, useRef, useState } from "react";
import { SwarmCanvas } from "../react";
import { wasmKernel } from "../kernel";
import { buildSwarmLandingScene } from "../presets/swarm-landing";
import { DocSectionCard } from "./components/DocSectionCard";
import {
  HubSidebar,
  HubTopbar,
  ModuleIcon,
  getShortNavLabel,
  type HubModuleGroup,
  type HubModuleKey,
  type SiteViewMode,
} from "./components/DocsNavbar";
import { getDocsLocale } from "./locales";
import type { DocSection, DocsLocaleBundle, Lang } from "./types";

const SUBPACKAGE_PATHS = [
  { pkg: "swarm-cursor", descEn: "Full Bundle", descVi: "Gói đầy đủ" },
  { pkg: "swarm-cursor/react", descEn: "React Components", descVi: "React Components" },
  { pkg: "swarm-cursor/three", descEn: "3D & GLB", descVi: "3D & GLB" },
  { pkg: "swarm-cursor/tools", descEn: "2D Image & Pen", descVi: "Ảnh 2D & Vẽ" },
  { pkg: "swarm-cursor/kernel", descEn: "Rust/WASM SIMD128", descVi: "Lõi WASM SIMD128" },
  { pkg: "swarm-cursor/engine", descEn: "ECS & Auction", descVi: "ECS & Đấu giá" },
  { pkg: "swarm-cursor/scanner", descEn: "DOM Scanner", descVi: "Quét DOM" },
  { pkg: "swarm-cursor/renderers", descEn: "60fps Renderers", descVi: "Dựng 60fps" },
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
      <div className="hub-page-title">
        <div className="hub-page-title-main">
          <h1>
            {lang === "vi" ? "Kho Module SwarmCursor 2.0" : "SwarmCursor 2.0 Hub"}
          </h1>
          <p className="hub-page-desc">
            {lang === "vi"
              ? "Thư viện điều phối bầy đàn con trỏ AI cho DOM, 3D Three.js/GLB và ảnh 2D tăng tốc bởi Rust/WASM SIMD128."
              : "Multi-agent AI cursor choreography for React DOM, Three.js/GLB 3D meshes, and 2D images powered by Rust/WASM SIMD128."}
          </p>
        </div>
        <div className="hub-page-title-actions">
          <button
            type="button"
            className="hub-btn-primary"
            onClick={() => onSelectSection("installation")}
          >
            <span>{lang === "vi" ? "Bắt đầu" : "Get Started"}</span>
            <span>→</span>
          </button>
          <button
            type="button"
            className="hub-btn-outline"
            onClick={onOpenArtboard}
          >
            <span>Showcase</span>
            <span>↗</span>
          </button>
        </div>
      </div>

      <div className="hub-catalog-grid">
        {modules.map((mod) => (
          <section
            key={mod.key}
            id={`catalog-card-${mod.key}`}
            className="hub-catalog-card"
          >
            <div className="hub-catalog-head">
              <div className="hub-catalog-icon">
                <ModuleIcon moduleKey={mod.key} size={20} />
              </div>
              <div className="hub-catalog-meta">
                <h2>{lang === "vi" ? mod.titleVi : mod.titleEn}</h2>
                <p>
                  {mod.items.length} {lang === "vi" ? "bài" : "guides"} ·{" "}
                  {lang === "vi" ? mod.badgeVi : mod.badgeEn}
                </p>
              </div>
            </div>

            <p className="hub-catalog-desc">
              {lang === "vi" ? mod.subtitleVi : mod.subtitleEn}
            </p>

            <code className="hub-code-value">{mod.importPath}</code>

            <div className="hub-catalog-topics">
              {mod.items.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  className="hub-topic-pill"
                  onClick={() => onSelectSection(sec.id)}
                >
                  <span>{getShortNavLabel(sec.id, sec.title, lang)}</span>
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
                <span>{lang === "vi" ? "Mở Module" : "Open Module"}</span>
                <span>↗</span>
              </button>
            </div>
          </section>
        ))}
      </div>

      <section id="hub-quick-install" className="hub-panel">
        <div className="hub-panel-header">
          <div>
            <h2>
              {lang === "vi"
                ? "Cài đặt & 8 Sub-Packages"
                : "Installation & 8 Sub-Packages"}
            </h2>
          </div>
          <span className="hub-badge is-success">
            {wasmKernel.isWasmAccelerated ? "SIMD128 Active" : "SIMD128 Ready"}
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
        titleVi: "Bắt đầu",
        subtitleEn: "Install SwarmCursor 2.0 and set up 3 integration modes.",
        subtitleVi: "Cài đặt SwarmCursor 2.0 và cấu hình 3 chế độ tích hợp.",
        badgeEn: "Setup",
        badgeVi: "Cài đặt",
        importPath: 'import { SwarmProvider } from "swarm-cursor/react"',
        items: bundle.gettingStarted,
      },
      {
        key: "dom-components",
        titleEn: "DOM & React",
        titleVi: "DOM & React",
        subtitleEn: "Auto-scan React/HTML layouts with SwarmProvider, SwarmCanvas & SwarmFollower.",
        subtitleVi: "Tự động quét giao diện React/HTML với SwarmProvider, SwarmCanvas & SwarmFollower.",
        badgeEn: "React 18/19",
        badgeVi: "React 18/19",
        importPath: 'import { SwarmProvider, SwarmElement } from "swarm-cursor/react"',
        items: domItems,
      },
      {
        key: "media-builders",
        titleEn: "3D & 2D Media",
        titleVi: "3D & Ảnh 2D",
        subtitleEn: "Sculpt Three.js/GLB 3D meshes and progressive 2D images.",
        subtitleVi: "Điêu khắc mô hình 3D Three.js/GLB và quét ảnh 2D.",
        badgeEn: "Three.js & 2D",
        badgeVi: "Three.js & 2D",
        importPath: 'import { Swarm3D, SwarmImage } from "swarm-cursor/react"',
        items: mediaItems,
      },
      {
        key: "subsystems",
        titleEn: "WASM & CSS",
        titleVi: "WASM & CSS",
        subtitleEn: "Rust/WASM SIMD128 kernels, ECS scheduler, and CSS tokens.",
        subtitleVi: "Lõi Rust/WASM SIMD128, bộ lập lịch ECS và biến CSS.",
        badgeEn: "SIMD128",
        badgeVi: "SIMD128",
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

  const handleViewModeChange = (nextMode: SiteViewMode) => {
    setViewMode(nextMode);
    if (nextMode === "artboard") {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
    scrollMainToTop();
  };

  const handleSelectCatalog = () => {
    setViewMode("docs");
    setSidebarCollapsed(false);
    setActivePageId("catalog");
    scrollMainToTop();
  };

  const handleSelectModule = (modKey: HubModuleKey) => {
    const found = modules.find((m) => m.key === modKey);
    if (found && found.items.length > 0) {
      setViewMode("docs");
      setSidebarCollapsed(false);
      setActivePageId(found.items[0].id);
      scrollMainToTop();
    }
  };

  const handleSelectSection = (secId: string) => {
    setViewMode("docs");
    setSidebarCollapsed(false);
    setActivePageId(secId);
    scrollMainToTop();
  };

  const handleLangChange = (nextLang: Lang) => {
    setLang(nextLang);
    if (typeof window !== "undefined" && window.history?.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", nextLang);
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div className="hub-shell">
      <HubSidebar
        lang={lang}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(true)}
        onRestoreFromBottomLeft={() => {
          setViewMode("docs");
          setSidebarCollapsed(false);
          scrollMainToTop();
        }}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        activePageId={activePageId}
        activeModule={activeModule}
        modules={modules}
        onSelectCatalog={handleSelectCatalog}
        onSelectModule={handleSelectModule}
        onSelectSection={handleSelectSection}
        onLangChange={handleLangChange}
      />

      <div
        className={`hub-workspace ${
          sidebarCollapsed || viewMode === "artboard" ? "is-sidebar-collapsed" : ""
        } ${viewMode === "artboard" ? "is-artboard-mode" : ""}`}
      >
        <div className="hub-aurora" aria-hidden="true" />

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
          onViewModeChange={handleViewModeChange}
          onLangChange={handleLangChange}
        />

        <main id="main" ref={mainScrollRef} className="hub-main">
          {viewMode === "docs" ? (
            activePageId === "catalog" || !activeSection ? (
              <HubCatalogView
                lang={lang}
                bundle={bundle}
                modules={modules}
                onSelectModule={handleSelectModule}
                onSelectSection={handleSelectSection}
                onOpenArtboard={() => handleViewModeChange("artboard")}
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
            )
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

        {viewMode === "docs" && (
          <footer className="hub-footer">
            <div className="hub-footer-inner">
              <span>{bundle.ui.footer.title}</span>
              <span>{bundle.ui.footer.subtitle}</span>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
