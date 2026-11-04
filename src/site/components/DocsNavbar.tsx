import React from "react";
import type { DocsUI, Lang } from "../types";
import { CoderFakeLogo } from "./CoderFakeLogo";

export type SiteViewMode = "docs" | "artboard";
export type ResponsivePreviewMode = "full" | "desktop" | "tablet" | "mobile";
export type DocsCategoryKey =
  | "all"
  | "getting-started"
  | "dom-components"
  | "media-builders"
  | "subsystems";

export interface CategoryMeta {
  key: DocsCategoryKey;
  labelEn: string;
  labelVi: string;
  count: number;
}

export const DOCS_CATEGORIES: CategoryMeta[] = [
  { key: "all", labelEn: "All Guides", labelVi: "Tất cả", count: 10 },
  { key: "getting-started", labelEn: "Getting Started", labelVi: "Bắt đầu", count: 2 },
  { key: "dom-components", labelEn: "DOM & React", labelVi: "DOM & React", count: 4 },
  { key: "media-builders", labelEn: "3D & Image", labelVi: "3D & Ảnh 2D", count: 2 },
  { key: "subsystems", labelEn: "WASM & CSS", labelVi: "WASM & CSS", count: 2 },
];

export function DocsNavbar({
  lang,
  ui,
  onLangChange,
  viewMode,
  onViewModeChange,
  onReplaySwarm,
  activeCategory,
  onSelectCategory,
  responsiveMode,
  onResponsiveModeChange,
  mobileMenuOpen,
  onToggleMobileMenu,
  currentSectionTitle,
}: {
  lang: Lang;
  ui: DocsUI;
  onLangChange: (lang: Lang) => void;
  viewMode: SiteViewMode;
  onViewModeChange: (mode: SiteViewMode) => void;
  onReplaySwarm: () => void;
  activeCategory: DocsCategoryKey;
  onSelectCategory: (cat: DocsCategoryKey) => void;
  responsiveMode: ResponsivePreviewMode;
  onResponsiveModeChange: (mode: ResponsivePreviewMode) => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  currentSectionTitle: string;
}) {
  return (
    <header className="docs-navbar" data-swarm-ignore="true">
      {/* Primary Top Bar */}
      <div className="docs-navbar-inner">
        <div className="docs-brand-cluster">
          {viewMode === "docs" && (
            <button
              type="button"
              className="docs-mobile-menu-btn"
              onClick={onToggleMobileMenu}
              aria-label="Toggle navigation sidebar"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="15" y2="18" />
                </svg>
              )}
            </button>
          )}

          <a
            href="#top"
            className="docs-brand"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <CoderFakeLogo size={34} />
            <div className="docs-brand-text">
              <div className="docs-brand-title-row">
                <strong>SwarmCursor</strong>
                <span className="docs-version-pill">v2.0</span>
              </div>
              <span className="docs-brand-sub">{ui.nav.subtitle}</span>
            </div>
          </a>

          <div className="docs-telemetry-badge" title="Rust/WASM SIMD128 Runtime">
            <span className="docs-pulse-dot" />
            <span>60 FPS · SIMD128</span>
          </div>
        </div>

        <div className="docs-navbar-actions">
          {/* Docs vs Artboard Switcher */}
          <div className="docs-segmented" role="tablist" aria-label="View Mode">
            <button
              type="button"
              className={`docs-seg-btn ${viewMode === "docs" ? "is-active" : ""}`}
              onClick={() => onViewModeChange("docs")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              <span className="docs-hide-xs">{ui.nav.docsMode}</span>
            </button>
            <button
              type="button"
              className={`docs-seg-btn ${viewMode === "artboard" ? "is-active" : ""}`}
              onClick={() => onViewModeChange("artboard")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
              <span className="docs-hide-xs">{ui.nav.artboardMode}</span>
            </button>
          </div>

          {viewMode === "docs" && (
            <button
              type="button"
              className="docs-replay-btn"
              onClick={onReplaySwarm}
              title={ui.nav.replayTooltip}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
              <span className="docs-hide-sm">{ui.nav.replayBtn}</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="docs-segmented docs-lang-switch" role="group" aria-label="Language">
            <button
              type="button"
              className={`docs-seg-btn ${lang === "en" ? "is-active" : ""}`}
              onClick={() => onLangChange("en")}
            >
              <span className="docs-lang-code">EN</span>
              <span className="docs-hide-md">English</span>
            </button>
            <button
              type="button"
              className={`docs-seg-btn ${lang === "vi" ? "is-active" : ""}`}
              onClick={() => onLangChange("vi")}
            >
              <span className="docs-lang-code">VI</span>
              <span className="docs-hide-md">Tiếng Việt</span>
            </button>
          </div>

          <a
            href="https://github.com/CoderFake/SwarmCursor"
            target="_blank"
            rel="noreferrer"
            className="docs-github-btn"
            aria-label="GitHub Repository"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="docs-hide-sm">GitHub</span>
          </a>
        </div>
      </div>

      {/* Secondary Sub-Navbar: Category Tabs + Responsive Breakpoint Switcher */}
      {viewMode === "docs" && (
        <div className="docs-subnav">
          <div className="docs-subnav-inner">
            {/* Mobile Sidebar Trigger + Breadcrumb */}
            <button
              type="button"
              className="docs-mobile-breadcrumb-btn"
              onClick={onToggleMobileMenu}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              <span>{lang === "vi" ? "Danh mục" : "Sidebar"}:</span>
              <strong>{currentSectionTitle}</strong>
            </button>

            {/* Category Pills */}
            <div className="docs-category-tabs" role="tablist" aria-label="Documentation Categories">
              {DOCS_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`docs-cat-tab ${activeCategory === cat.key ? "is-active" : ""}`}
                  onClick={() => onSelectCategory(cat.key)}
                >
                  <span>{lang === "vi" ? cat.labelVi : cat.labelEn}</span>
                  <span className="docs-cat-count">{cat.count}</span>
                </button>
              ))}
            </div>

            {/* Responsive Viewport Frame Tester */}
            <div className="docs-responsive-switcher" title={lang === "vi" ? "Chế độ khung nhìn Responsive" : "Responsive Viewport Tester"}>
              <span className="docs-resp-label">
                {lang === "vi" ? "Khung nhìn:" : "Viewport:"}
              </span>
              <button
                type="button"
                className={`docs-resp-btn ${responsiveMode === "full" ? "is-active" : ""}`}
                onClick={() => onResponsiveModeChange("full")}
                title="Auto / 100% Fluid"
              >
                <span>Auto</span>
              </button>
              <button
                type="button"
                className={`docs-resp-btn ${responsiveMode === "desktop" ? "is-active" : ""}`}
                onClick={() => onResponsiveModeChange("desktop")}
                title="Desktop (1280px)"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <span>Desktop</span>
              </button>
              <button
                type="button"
                className={`docs-resp-btn ${responsiveMode === "tablet" ? "is-active" : ""}`}
                onClick={() => onResponsiveModeChange("tablet")}
                title="Tablet (768px)"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                <span>Tablet</span>
              </button>
              <button
                type="button"
                className={`docs-resp-btn ${responsiveMode === "mobile" ? "is-active" : ""}`}
                onClick={() => onResponsiveModeChange("mobile")}
                title="Mobile (390px)"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                <span>Mobile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
