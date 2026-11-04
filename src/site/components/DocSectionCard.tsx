import React, { useState } from "react";
import { SwarmElement } from "../../react";
import type { DocSection, DocsUI } from "../types";
import { Interactive3DSandbox, InteractiveImageSandbox } from "./InteractiveSandboxes";

function renderHighlightedLine(line: string): React.ReactNode {
  const trimmed = line.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
    return <span className="tok-comment">{line}</span>;
  }
  const parts = line.split(/(".*?"|'.*?'|`.*?`|\b(?:import|from|export|function|return|const|let|type|interface|true|false|null|undefined|async|await|new)\b|<\/?[A-Z][A-Za-z0-9]*|\b\d+(?:\.\d+)?\b)/g);
  return parts.map((part, idx) => {
    if (!part) return null;
    if (/^["'`]/.test(part)) {
      return <span key={idx} className="tok-string">{part}</span>;
    }
    if (/^(import|from|export|function|return|const|let|type|interface|async|await|new)$/.test(part)) {
      return <span key={idx} className="tok-keyword">{part}</span>;
    }
    if (/^(true|false|null|undefined|\d+(?:\.\d+)?)$/.test(part)) {
      return <span key={idx} className="tok-literal">{part}</span>;
    }
    if (/^<\/?[A-Z]/.test(part)) {
      return <span key={idx} className="tok-component">{part}</span>;
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function DocSectionCard({
  section,
  index,
  ui,
}: {
  section: DocSection;
  index: number;
  ui: DocsUI;
}) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1600);
    }
  };

  const sectionNum = String(index + 1).padStart(2, "0");

  return (
    <section id={section.id} className="docs-section-card">
      <div id={`${section.id}-overview`} className="docs-section-header">
        <div className="docs-section-meta-row">
          <span className="docs-section-index">#{sectionNum}</span>
          <span className="docs-section-badge">{section.badge}</span>
        </div>
        <SwarmElement
          id={`title-${section.id}`}
          tool="text"
          grow
          snapAxis="x"
        >
          <h2 className="docs-section-title">{section.title}</h2>
        </SwarmElement>
        <p className="docs-section-summary">{section.summary}</p>
      </div>

      {section.steps && section.steps.length > 0 && (
        <div id={`${section.id}-steps`} className="docs-steps-grid">
          {section.steps.map((step, i) => (
            <div
              key={i}
              id={`step-${section.id}-${i}`}
              className="docs-step-card"
              data-swarm="rect"
            >
              <div className="docs-step-top">
                <span className="docs-step-badge">{step.badge}</span>
                <span className="docs-step-index">0{i + 1}</span>
              </div>
              <h3 className="docs-step-title">{step.title}</h3>
              <p className="docs-step-body">{step.body}</p>
            </div>
          ))}
        </div>
      )}

      {section.sandbox === "3d" && (
        <div id={`${section.id}-sandbox`}>
          <Interactive3DSandbox ui={ui} />
        </div>
      )}
      {section.sandbox === "image" && (
        <div id={`${section.id}-sandbox`}>
          <InteractiveImageSandbox ui={ui} />
        </div>
      )}

      <div id={`${section.id}-code`} className="docs-code-list">
        {section.codeExamples.map((ex, idx) => {
          const lines = ex.code.split("\n");
          const isCopied = copiedIdx === idx;
          return (
            <div
              key={idx}
              id={`${section.id}-code-${idx}`}
              className="docs-code-block"
              data-swarm="rect"
            >
              <div className="docs-code-topbar">
                <div className="docs-code-dots">
                  <span className="dot-red" />
                  <span className="dot-amber" />
                  <span className="dot-green" />
                  <strong>{ex.title}</strong>
                </div>
                <div className="docs-code-actions">
                  <span className="docs-code-filename">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    {ex.filename}
                  </span>
                  <button
                    type="button"
                    className={`docs-copy-btn ${isCopied ? "is-copied" : ""}`}
                    onClick={() => handleCopy(ex.code, idx)}
                  >
                    {isCopied ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{ui.table.copiedBtn.replace("✓ ", "")}</span>
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>{ui.table.copyBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <pre className="docs-code-pre">
                <code>
                  {lines.map((ln, lIdx) => (
                    <div key={lIdx} className="docs-code-line">
                      <span className="docs-line-num">{lIdx + 1}</span>
                      <span className="docs-line-content">{renderHighlightedLine(ln)}</span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          );
        })}
      </div>

      {section.propsTable && (
        <div
          id={`${section.id}-props`}
          className="docs-table-wrap"
          data-swarm="rect"
        >
          <div className="docs-table-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <h4>{section.propsTable.title}</h4>
          </div>
          <div className="docs-table-scroll">
            <table className="docs-table">
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
                    <td>
                      <code className="docs-prop-name">{row.name}</code>
                    </td>
                    <td>
                      <code className="docs-prop-type">{row.type}</code>
                    </td>
                    <td>
                      <code className="docs-prop-default">{row.defaultVal}</code>
                    </td>
                    <td className="docs-prop-desc">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
