import React from "react";
import type { DocsUI, Lang } from "../types";
import { CoderFakeLogo } from "./CoderFakeLogo";

export type SiteViewMode = "docs" | "artboard";

export function DocsNavbar({
  lang,
  ui,
  onLangChange,
  viewMode,
  onViewModeChange,
  onReplaySwarm,
}: {
  lang: Lang;
  ui: DocsUI;
  onLangChange: (lang: Lang) => void;
  viewMode: SiteViewMode;
  onViewModeChange: (mode: SiteViewMode) => void;
  onReplaySwarm: () => void;
}) {
  return (
    <header className="docs-navbar">
      <div className="docs-navbar-inner">
        <a
          href="#top"
          className="docs-brand"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <CoderFakeLogo size={36} />
          <div className="docs-brand-text">
            <strong>SwarmCursor 2.0</strong>
            <span>{ui.nav.subtitle}</span>
          </div>
        </a>

        <div className="docs-navbar-actions">
          <div className="docs-segmented" role="tablist" aria-label="View Mode">
            <button
              type="button"
              className={`docs-seg-btn ${viewMode === "docs" ? "is-active" : ""}`}
              onClick={() => onViewModeChange("docs")}
            >
              {ui.nav.docsMode}
            </button>
            <button
              type="button"
              className={`docs-seg-btn ${viewMode === "artboard" ? "is-active" : ""}`}
              onClick={() => onViewModeChange("artboard")}
            >
              {ui.nav.artboardMode}
            </button>
          </div>

          {viewMode === "docs" && (
            <button
              type="button"
              className="docs-replay-btn"
              onClick={onReplaySwarm}
              title={ui.nav.replayTooltip}
            >
              ↻ {ui.nav.replayBtn}
            </button>
          )}

          <div className="docs-segmented" role="group" aria-label="Language">
            <button
              type="button"
              className={`docs-seg-btn ${lang === "vi" ? "is-active" : ""}`}
              onClick={() => onLangChange("vi")}
            >
              🇻🇳 Tiếng Việt
            </button>
            <button
              type="button"
              className={`docs-seg-btn ${lang === "en" ? "is-active" : ""}`}
              onClick={() => onLangChange("en")}
            >
              🇬🇧 English
            </button>
          </div>

          <a
            href="https://github.com/CoderFake/SwarmCursor"
            target="_blank"
            rel="noreferrer"
            className="docs-github-btn"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </header>
  );
}
