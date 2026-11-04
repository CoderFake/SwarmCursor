import React from "react";
import type { DocSection, DocsUI, Lang } from "../types";
import { CoderFakeLogo } from "./CoderFakeLogo";

export type SiteViewMode = "docs" | "artboard";
export type HubModuleKey =
  | "getting-started"
  | "dom-components"
  | "media-builders"
  | "subsystems";

export interface HubModuleGroup {
  key: HubModuleKey;
  titleEn: string;
  titleVi: string;
  subtitleEn: string;
  subtitleVi: string;
  badgeEn: string;
  badgeVi: string;
  importPath: string;
  items: DocSection[];
}

function ModuleIcon({
  moduleKey,
  size = 18,
}: {
  moduleKey: HubModuleKey | "catalog" | "artboard";
  size?: number;
}) {
  switch (moduleKey) {
    case "catalog":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "getting-started":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "dom-components":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case "media-builders":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case "subsystems":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="14" x2="4" y2="14" />
        </svg>
      );
    case "artboard":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      );
  }
}

export { ModuleIcon };

export function HubSidebar({
  lang,
  collapsed,
  onToggleCollapse,
  onRestoreFromBottomLeft,
  mobileOpen,
  onCloseMobile,
  viewMode,
  onViewModeChange,
  activePageId,
  activeModule,
  modules,
  activeSection,
  onSelectCatalog,
  onSelectModule,
  onSelectSection,
  onScrollToAnchor,
  onLangChange,
}: {
  lang: Lang;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onRestoreFromBottomLeft: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  viewMode: SiteViewMode;
  onViewModeChange: (mode: SiteViewMode) => void;
  activePageId: string;
  activeModule: HubModuleGroup | null;
  modules: HubModuleGroup[];
  activeSection: DocSection | null;
  onSelectCatalog: () => void;
  onSelectModule: (modKey: HubModuleKey) => void;
  onSelectSection: (sectionId: string) => void;
  onScrollToAnchor: (anchorId: string) => void;
  onLangChange: (lang: Lang) => void;
}) {
  // When in Artboard Showcase mode OR when sidebar is collapsed into icon mode,
  // render the floating bottom-left icon launcher (`góc trái dưới`).
  const isMinimizedToCorner = viewMode === "artboard" || collapsed;

  const renderNavContent = (onNavClick?: () => void) => (
    <>
      <nav className="hub-nav" aria-label="Main Navigation">
        {activeModule && activePageId !== "catalog" && viewMode === "docs" ? (
          <>
            <button
              type="button"
              className="hub-back-btn"
              onClick={() => {
                onSelectCatalog();
                onNavClick?.();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>{lang === "vi" ? "Kho Module (Catalog)" : "Back to Module Hub"}</span>
            </button>

            <div className="hub-module-card">
              <span className="hub-module-card-icon">
                <ModuleIcon moduleKey={activeModule.key} size={19} />
              </span>
              <div className="hub-module-card-text">
                <small>{lang === "vi" ? "KHÔNG GIAN MODULE" : "MODULE WORKSPACE"}</small>
                <strong>{lang === "vi" ? activeModule.titleVi : activeModule.titleEn}</strong>
              </div>
            </div>

            <div className="hub-nav-group">
              <p className="hub-nav-group-label">
                {lang === "vi" ? "TÀI LIỆU TRONG MODULE" : "MODULE GUIDES"}
              </p>
              {activeModule.items.map((sec) => {
                const isActive = activePageId === sec.id && viewMode === "docs";
                return (
                  <button
                    key={sec.id}
                    type="button"
                    className={`hub-nav-item ${isActive ? "is-active" : ""}`}
                    onClick={() => {
                      onSelectSection(sec.id);
                      onNavClick?.();
                    }}
                  >
                    <ModuleIcon moduleKey={activeModule.key} size={17} />
                    <span>{sec.title}</span>
                  </button>
                );
              })}
            </div>

            {activeSection && (
              <div className="hub-nav-group">
                <p className="hub-nav-group-label">
                  {lang === "vi" ? "MỤC TRONG TRANG" : "ON THIS PAGE"}
                </p>
                <button
                  type="button"
                  className="hub-subnav-item"
                  onClick={() => {
                    onScrollToAnchor(`${activeSection.id}-overview`);
                    onNavClick?.();
                  }}
                >
                  <span className="hub-subnav-dot" />
                  <span>{lang === "vi" ? "Tổng quan & Quy trình" : "Overview & Workflow"}</span>
                </button>
                {activeSection.sandbox && (
                  <button
                    type="button"
                    className="hub-subnav-item is-accent"
                    onClick={() => {
                      onScrollToAnchor(`${activeSection.id}-sandbox`);
                      onNavClick?.();
                    }}
                  >
                    <span className="hub-subnav-dot" />
                    <span>{lang === "vi" ? "Live Sandbox tương tác" : "Live Interactive Sandbox"}</span>
                  </button>
                )}
                <button
                  type="button"
                  className="hub-subnav-item"
                  onClick={() => {
                    onScrollToAnchor(`${activeSection.id}-code`);
                    onNavClick?.();
                  }}
                >
                  <span className="hub-subnav-dot" />
                  <span>
                    {lang === "vi" ? "Ví dụ mã nguồn" : "Code Examples"} ({activeSection.codeExamples.length})
                  </span>
                </button>
                {activeSection.propsTable && (
                  <button
                    type="button"
                    className="hub-subnav-item"
                    onClick={() => {
                      onScrollToAnchor(`${activeSection.id}-props`);
                      onNavClick?.();
                    }}
                  >
                    <span className="hub-subnav-dot" />
                    <span>{lang === "vi" ? "Bảng thuộc tính & API" : "Props & API Reference"}</span>
                  </button>
                )}
              </div>
            )}

            <div className="hub-nav-group">
              <p className="hub-nav-group-label">
                {lang === "vi" ? "CHUYỂN NHANH MODULE" : "SWITCH MODULE"}
              </p>
              {modules
                .filter((m) => m.key !== activeModule.key)
                .map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    className="hub-nav-item"
                    onClick={() => {
                      onSelectModule(m.key);
                      onNavClick?.();
                    }}
                  >
                    <ModuleIcon moduleKey={m.key} size={17} />
                    <span>{lang === "vi" ? m.titleVi : m.titleEn}</span>
                  </button>
                ))}
            </div>
          </>
        ) : (
          <>
            <div className="hub-nav-group">
              <p className="hub-nav-group-label">
                {lang === "vi" ? "TRUNG TÂM TÀI LIỆU" : "DOCUMENTATION HUB"}
              </p>
              <button
                type="button"
                className={`hub-nav-item ${
                  activePageId === "catalog" && viewMode === "docs" ? "is-active" : ""
                }`}
                onClick={() => {
                  onViewModeChange("docs");
                  onSelectCatalog();
                  onNavClick?.();
                }}
              >
                <ModuleIcon moduleKey="catalog" size={18} />
                <span>{lang === "vi" ? "Kho Module (Catalog)" : "Module Catalog"}</span>
              </button>

              <button
                type="button"
                className={`hub-nav-item ${viewMode === "artboard" ? "is-active" : ""}`}
                onClick={() => {
                  onViewModeChange("artboard");
                  onNavClick?.();
                }}
              >
                <ModuleIcon moduleKey="artboard" size={18} />
                <span>Artboard Showcase</span>
              </button>
            </div>

            <div className="hub-nav-group">
              <p className="hub-nav-group-label">
                {lang === "vi" ? "DANH MỤC HƯỚNG DẪN" : "MODULE WORKSPACES"}
              </p>
              {modules.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  className="hub-nav-item"
                  onClick={() => {
                    onViewModeChange("docs");
                    onSelectModule(m.key);
                    onNavClick?.();
                  }}
                >
                  <ModuleIcon moduleKey={m.key} size={18} />
                  <span className="hub-nav-item-flex">
                    <span>{lang === "vi" ? m.titleVi : m.titleEn}</span>
                    <small className="hub-nav-count">{m.items.length}</small>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="hub-sidebar-note">
        <span className="hub-sidebar-note-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </span>
        <div className="hub-sidebar-note-text">
          <strong>Rust/WASM SIMD128</strong>
          <span>60fps Multi-Agent Engine</span>
        </div>
      </div>

      <div className="hub-sidebar-footer">
        <div className="hub-user-info">
          <CoderFakeLogo size={32} />
          <div className="hub-user-meta">
            <strong>CoderFake</strong>
            <span>v2.0.0 · MIT</span>
          </div>
        </div>
        <div className="hub-footer-actions">
          <button
            type="button"
            className="hub-lang-mini"
            onClick={() => onLangChange(lang === "en" ? "vi" : "en")}
            title={lang === "en" ? "Switch to Tiếng Việt" : "Chuyển sang Tiếng Anh"}
          >
            {lang.toUpperCase()}
          </button>
          <a
            href="https://github.com/CoderFake/SwarmCursor"
            target="_blank"
            rel="noreferrer"
            className="hub-icon-btn"
            title="GitHub Repository"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* When in Showcase or Collapsed: Floating Bottom-Left Icon Button (Góc trái dưới) */}
      {isMinimizedToCorner ? (
        <button
          type="button"
          className="hub-corner-launcher"
          onClick={onRestoreFromBottomLeft}
          title={
            lang === "vi"
              ? "Mở lại Sidebar & Tài liệu"
              : "Restore Sidebar & Documentation"
          }
          aria-label="Restore Sidebar & Documentation"
          data-swarm-ignore="true"
        >
          <CoderFakeLogo size={28} />
          <span className="hub-corner-launcher-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <polyline points="13 9 16 12 13 15" />
            </svg>
          </span>
        </button>
      ) : (
        /* Normal Expanded Left Sidebar */
        <aside className="hub-sidebar" data-swarm-ignore="true">
          <div className="hub-sidebar-top">
            <button
              type="button"
              className="hub-brand-btn"
              onClick={() => {
                onViewModeChange("docs");
                onSelectCatalog();
              }}
            >
              <CoderFakeLogo size={40} />
              <div className="hub-brand-meta">
                <strong>SwarmCursor</strong>
                <span>Documentation Hub</span>
              </div>
            </button>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hub-collapse-btn"
              aria-label="Collapse sidebar to bottom-left icon"
              title={
                lang === "vi"
                  ? "Thu gọn Sidebar xuống góc trái dưới"
                  : "Minimize sidebar to bottom-left icon"
              }
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <polyline points="14 9 11 12 14 15" />
              </svg>
            </button>
          </div>

          <div className="hub-sidebar-scroll">{renderNavContent()}</div>
        </aside>
      )}

      {/* Mobile / Tablet Modal Drawer */}
      {mobileOpen && (
        <div className="hub-mobile-overlay" data-swarm-ignore="true">
          <div className="hub-mobile-backdrop" onClick={onCloseMobile} />
          <div className="hub-mobile-dialog" role="dialog" aria-modal="true">
            <div className="hub-sidebar-top">
              <button
                type="button"
                className="hub-brand-btn"
                onClick={() => {
                  onViewModeChange("docs");
                  onSelectCatalog();
                  onCloseMobile();
                }}
              >
                <CoderFakeLogo size={38} />
                <div className="hub-brand-meta">
                  <strong>SwarmCursor</strong>
                  <span>Documentation Hub</span>
                </div>
              </button>
              <button
                type="button"
                onClick={onCloseMobile}
                className="hub-collapse-btn"
                aria-label="Close navigation"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="hub-sidebar-scroll">
              {renderNavContent(onCloseMobile)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function HubTopbar({
  lang,
  ui,
  viewMode,
  activePageId,
  activeModule,
  activeSection,
  onOpenMobile,
  onSelectCatalog,
  onSelectModule,
  onViewModeChange,
  onReplaySwarm,
  onLangChange,
}: {
  lang: Lang;
  ui: DocsUI;
  viewMode: SiteViewMode;
  activePageId: string;
  activeModule: HubModuleGroup | null;
  activeSection: DocSection | null;
  onOpenMobile: () => void;
  onSelectCatalog: () => void;
  onSelectModule: (modKey: HubModuleKey) => void;
  onViewModeChange: (mode: SiteViewMode) => void;
  onReplaySwarm: () => void;
  onLangChange: (lang: Lang) => void;
}) {
  // In Artboard Showcase mode, hide the topbar so the showcase is 100% clean,
  // controlled via the bottom-left icon launcher!
  if (viewMode === "artboard") return null;

  return (
    <header className="hub-topbar" data-swarm-ignore="true">
      <div className="hub-topbar-left">
        <button
          type="button"
          className="hub-mobile-trigger"
          onClick={onOpenMobile}
          aria-label="Open navigation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="15" y2="18" />
          </svg>
        </button>

        {/* Floating Pill Breadcrumbs */}
        <div className="hub-breadcrumb-pill">
          <nav className="hub-breadcrumbs" aria-label="Breadcrumb">
            <button
              type="button"
              className="hub-crumb-link"
              onClick={() => {
                onViewModeChange("docs");
                onSelectCatalog();
              }}
            >
              SwarmCursor Hub
            </button>
            <span className="hub-crumb-sep">/</span>
            {activePageId === "catalog" || !activeModule ? (
              <strong className="hub-crumb-current">
                {lang === "vi" ? "Kho Module & Tài liệu" : "Module Catalog"}
              </strong>
            ) : (
              <>
                <button
                  type="button"
                  className="hub-crumb-link"
                  onClick={() => onSelectModule(activeModule.key)}
                >
                  {lang === "vi" ? activeModule.titleVi : activeModule.titleEn}
                </button>
                {activeSection && (
                  <>
                    <span className="hub-crumb-sep">/</span>
                    <strong className="hub-crumb-current">
                      {activeSection.title}
                    </strong>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="hub-topbar-right">
        <span className="hub-status-pill">
          <i className="hub-status-dot" />
          <span>SwarmCursor 2.0 · SIMD128</span>
        </span>

        <button
          type="button"
          className="hub-action-pill"
          onClick={onReplaySwarm}
          title={ui.nav.replayTooltip}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          <span className="hub-hide-sm">{ui.nav.replayBtn}</span>
        </button>

        <button
          type="button"
          className="hub-action-pill"
          onClick={() => onViewModeChange("artboard")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          <span>{ui.nav.artboardMode}</span>
        </button>

        <div className="hub-lang-pill" role="group" aria-label="Language">
          <button
            type="button"
            className={lang === "en" ? "is-active" : ""}
            onClick={() => onLangChange("en")}
          >
            EN
          </button>
          <button
            type="button"
            className={lang === "vi" ? "is-active" : ""}
            onClick={() => onLangChange("vi")}
          >
            VI
          </button>
        </div>
      </div>
    </header>
  );
}
