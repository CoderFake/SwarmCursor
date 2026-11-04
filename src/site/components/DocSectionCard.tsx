import React, { useState } from "react";
import type { DocSection, DocsUI, Lang } from "../types";
import { getShortNavLabel } from "./DocsNavbar";
import { Interactive3DSandbox, InteractiveImageSandbox } from "./InteractiveSandboxes";

function renderHighlightedLine(line: string): React.ReactNode {
  const trimmed = line.trim();
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("*")
  ) {
    return <span className="tok-comment">{line}</span>;
  }
  const parts = line.split(
    /(".*?"|'.*?'|`.*?`|\b(?:import|from|export|function|return|const|let|type|interface|true|false|null|undefined|async|await|new)\b|<\/?[A-Z][A-Za-z0-9]*|\b\d+(?:\.\d+)?\b)/g
  );
  return parts.map((part, idx) => {
    if (!part) return null;
    if (/^["'`]/.test(part)) {
      return (
        <span key={idx} className="tok-string">
          {part}
        </span>
      );
    }
    if (
      /^(import|from|export|function|return|const|let|type|interface|async|await|new)$/.test(
        part
      )
    ) {
      return (
        <span key={idx} className="tok-keyword">
          {part}
        </span>
      );
    }
    if (/^(true|false|null|undefined|\d+(?:\.\d+)?)$/.test(part)) {
      return (
        <span key={idx} className="tok-literal">
          {part}
        </span>
      );
    }
    if (/^<\/?[A-Z]/.test(part)) {
      return (
        <span key={idx} className="tok-component">
          {part}
        </span>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function DocSectionCard({
  lang,
  section,
  ui,
  prevSection,
  nextSection,
  onBackToCatalog,
  onNavigateSection,
}: {
  lang: Lang;
  section: DocSection;
  ui: DocsUI;
  prevSection: DocSection | null;
  nextSection: DocSection | null;
  onBackToCatalog: () => void;
  onNavigateSection: (id: string) => void;
}) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1600);
    }
  };

  return (
    <div id={section.id} className="hub-page-stack">
      <div id={`${section.id}-overview`} className="hub-page-title">
        <div className="hub-page-title-main">
          <button
            type="button"
            className="hub-back-inline"
            onClick={onBackToCatalog}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>{lang === "vi" ? "Kho Module" : "All Modules"}</span>
          </button>

          <h1>{getShortNavLabel(section.id, section.title, lang)}</h1>
          <p className="hub-page-desc">{section.summary}</p>
        </div>

        <div className="hub-page-title-actions">
          <span className="hub-badge is-brand">{section.badge}</span>
        </div>
      </div>

      {section.steps && section.steps.length > 0 && (
        <section id={`${section.id}-steps`} className="hub-panel">
          <div className="hub-panel-header">
            <div>
              <h2>
                {lang === "vi" ? "Kiến trúc & Quy trình" : "Architecture & Workflow"}
              </h2>
            </div>
          </div>
          <div className="hub-panel-body">
            <div className="hub-steps-grid">
              {section.steps.map((step, i) => (
                <div key={i} className="hub-step-item">
                  <div className="hub-step-head">
                    <div className="hub-step-title-row">
                      <span className="hub-step-num">{i + 1}</span>
                      <h3>{step.title}</h3>
                    </div>
                    <span className="hub-badge is-soft">{step.badge}</span>
                  </div>
                  <p className="hub-step-text">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {section.sandbox === "3d" && (
        <section id={`${section.id}-sandbox`} className="hub-panel">
          <div className="hub-panel-header">
            <div>
              <h2>
                {lang === "vi" ? "3D & WASM Sandbox" : "Live 3D & WASM Sandbox"}
              </h2>
              <p>{ui.sandbox.threeTitle}</p>
            </div>
          </div>
          <div className="hub-panel-body">
            <Interactive3DSandbox ui={ui} />
          </div>
        </section>
      )}

      {section.sandbox === "image" && (
        <section id={`${section.id}-sandbox`} className="hub-panel">
          <div className="hub-panel-header">
            <div>
              <h2>
                {lang === "vi" ? "2D Image Sandbox" : "Live 2D Image Sandbox"}
              </h2>
              <p>{ui.sandbox.imageTitle}</p>
            </div>
          </div>
          <div className="hub-panel-body">
            <InteractiveImageSandbox ui={ui} />
          </div>
        </section>
      )}

      <section id={`${section.id}-code`} className="hub-panel">
        <div className="hub-panel-header">
          <div>
            <h2>{lang === "vi" ? "Ví dụ mã nguồn" : "Code Examples"}</h2>
          </div>
        </div>
        <div className="hub-panel-body">
          {section.codeExamples.map((ex, idx) => {
            const lines = ex.code.split("\n");
            const isCopied = copiedIdx === idx;
            return (
              <div key={idx} className="hub-code-card">
                <div className="hub-code-bar">
                  <div className="hub-code-title">
                    <span className="dot-red" />
                    <span className="dot-amber" />
                    <span className="dot-green" />
                    <strong>{ex.title}</strong>
                  </div>
                  <div className="hub-code-actions">
                    <span className="hub-code-file">{ex.filename}</span>
                    <button
                      type="button"
                      className={`hub-copy-btn ${isCopied ? "is-copied" : ""}`}
                      onClick={() => handleCopy(ex.code, idx)}
                    >
                      {isCopied
                        ? ui.table.copiedBtn.replace("✓ ", "")
                        : ui.table.copyBtn}
                    </button>
                  </div>
                </div>
                <pre className="hub-code-pre">
                  <code>
                    {lines.map((ln, lIdx) => (
                      <div key={lIdx} className="hub-code-line">
                        <span className="hub-line-num">{lIdx + 1}</span>
                        <span className="hub-line-text">
                          {renderHighlightedLine(ln)}
                        </span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            );
          })}
        </div>
      </section>

      {section.propsTable && (
        <section id={`${section.id}-props`} className="hub-panel is-flush">
          <div className="hub-panel-header is-flush">
            <div>
              <h2>{section.propsTable.title}</h2>
            </div>
          </div>
          <div className="hub-table-wrap">
            <table className="hub-data-table">
              <thead>
                <tr>
                  <th>{ui.table.nameCol}</th>
                  <th>{ui.table.typeCol}</th>
                  <th>{ui.table.defaultCol}</th>
                  <th>{ui.table.descCol}</th>
                </tr>
              </thead>
              <tbody>
                {section.propsTable.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td data-label={ui.table.nameCol}>
                      <code className="hub-prop-name">{row.name}</code>
                    </td>
                    <td data-label={ui.table.typeCol}>
                      <code className="hub-prop-type">{row.type}</code>
                    </td>
                    <td data-label={ui.table.defaultCol}>
                      <code className="hub-prop-default">{row.defaultVal}</code>
                    </td>
                    <td data-label={ui.table.descCol} className="is-stacked">
                      {row.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="hub-pager">
        {prevSection ? (
          <button
            type="button"
            className="hub-pager-card"
            onClick={() => onNavigateSection(prevSection.id)}
          >
            <small>← {lang === "vi" ? "Trước" : "Previous"}</small>
            <strong>{getShortNavLabel(prevSection.id, prevSection.title, lang)}</strong>
          </button>
        ) : (
          <button
            type="button"
            className="hub-pager-card"
            onClick={onBackToCatalog}
          >
            <small>← {lang === "vi" ? "Quay lại" : "Back to"}</small>
            <strong>{lang === "vi" ? "Kho Module" : "Catalog"}</strong>
          </button>
        )}

        {nextSection && (
          <button
            type="button"
            className="hub-pager-card is-next"
            onClick={() => onNavigateSection(nextSection.id)}
          >
            <small>{lang === "vi" ? "Tiếp theo" : "Next"} →</small>
            <strong>{getShortNavLabel(nextSection.id, nextSection.title, lang)}</strong>
          </button>
        )}
      </div>
    </div>
  );
}
