import React, { useEffect, useMemo, useState } from "react";
import {
  SwarmCanvas,
  SwarmControls,
  SwarmElement,
  SwarmFollower,
  SwarmProvider,
  useSwarm,
} from "../react";
import { buildSwarmLandingScene } from "../presets/swarm-landing";
import { CoderFakeLogo } from "./components/CoderFakeLogo";
import { DocSectionCard } from "./components/DocSectionCard";
import { DocsNavbar, type SiteViewMode } from "./components/DocsNavbar";
import { getDocsLocale } from "./locales";
import type { DocsLocaleBundle, Lang } from "./types";

function DocsInnerStage({
  bundle,
  activeId,
  onSelectSection,
  replaySignal,
}: {
  bundle: DocsLocaleBundle;
  activeId: string;
  onSelectSection: (id: string) => void;
  replaySignal: number;
}) {
  const { engine, start, reset } = useSwarm();
  const { ui, gettingStarted, components, subsystems } = bundle;
  const allSections = useMemo(
    () => [...gettingStarted, ...components, ...subsystems],
    [gettingStarted, components, subsystems]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      start();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [start]);

  useEffect(() => {
    if (replaySignal > 0) {
      reset();
      window.setTimeout(() => {
        start();
      }, 60);
    }
  }, [replaySignal, reset, start, engine]);

  const scrollToSection = (id: string) => {
    onSelectSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      start();
    }
  };

  return (
    <div id="top" className="docs-shell">
      {/* Hero Banner choreographed by SwarmCursor */}
      <section
        id="docs-hero"
        className="docs-hero"
        data-swarm="rect"
        data-swarm-deep="true"
      >
        <div className="docs-hero-left">
          <div className="docs-hero-pill-row">
            <CoderFakeLogo size={44} />
            <span className="docs-hero-tag">{ui.hero.tag}</span>
          </div>
          <SwarmElement id="docs-hero-h1" tool="text" grow snapAxis="x">
            <h1 className="docs-hero-title">{ui.hero.title}</h1>
          </SwarmElement>
          <p className="docs-hero-lead">{ui.hero.lead}</p>
          <div className="docs-hero-cta-row">
            <code className="docs-install-cmd">
              npm install git+https://github.com/CoderFake/SwarmCursor.git
            </code>
            <a href="#installation" className="docs-primary-btn">
              {ui.hero.ctaStart}
            </a>
          </div>
        </div>

        <div id="docs-hero-stats" className="docs-hero-stats" data-swarm="rect">
          {ui.hero.stats.map((st, idx) => (
            <div key={idx} className="docs-stat-box">
              <strong>{st.title}</strong>
              <span>{st.subtitle}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Two-Column Layout: Sticky Sidebar + Modular Guide Sections */}
      <div className="docs-body-grid">
        <aside className="docs-sidebar">
          <div className="docs-sidebar-sticky">
            <div className="docs-nav-group">
              <div className="docs-nav-group-title">{ui.sidebar.gettingStarted}</div>
              {gettingStarted.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`docs-nav-link ${activeId === s.id ? "is-active" : ""}`}
                  onClick={() => scrollToSection(s.id)}
                >
                  {s.title}
                </button>
              ))}
            </div>

            <div className="docs-nav-group">
              <div className="docs-nav-group-title">{ui.sidebar.components}</div>
              {components.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`docs-nav-link ${activeId === s.id ? "is-active" : ""}`}
                  onClick={() => scrollToSection(s.id)}
                >
                  {s.title}
                </button>
              ))}
            </div>

            <div className="docs-nav-group">
              <div className="docs-nav-group-title">{ui.sidebar.subsystems}</div>
              {subsystems.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`docs-nav-link ${activeId === s.id ? "is-active" : ""}`}
                  onClick={() => scrollToSection(s.id)}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="docs-main-column">
          {allSections.map((section) => (
            <DocSectionCard key={section.id} section={section} ui={ui} />
          ))}

          <footer className="docs-footer" data-swarm="rect">
            <div className="docs-footer-brand">
              <CoderFakeLogo size={32} />
              <div>
                <strong>{ui.footer.title}</strong>
                <p>{ui.footer.subtitle}</p>
              </div>
            </div>
            <a
              href="https://github.com/CoderFake/SwarmCursor"
              target="_blank"
              rel="noreferrer"
              className="docs-github-btn"
            >
              github.com/CoderFake/SwarmCursor ↗
            </a>
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
    return "vi";
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
        <>
          <SwarmProvider
            key={`docs-provider-${lang}-${replaySignal}`}
            scrollMode="manual"
            autoScrollSpeed={180}
            deepScan={true}
            fastMode={true}
            showCursorLabels={true}
            agentPill={{ maxIcons: 5, position: "bottom-center" }}
          >
            <DocsInnerStage
              bundle={bundle}
              activeId={activeId}
              onSelectSection={setActiveId}
              replaySignal={replaySignal}
            />
            <SwarmControls position="bottom-right" />
          </SwarmProvider>
          <SwarmFollower count={14} radiusScale={0.85} zIndex={45} />
        </>
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
