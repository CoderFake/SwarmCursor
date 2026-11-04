import React, { useState } from "react";
import { SwarmElement } from "../../react";
import type { DocSection, DocsUI } from "../types";
import { Interactive3DSandbox, InteractiveImageSandbox } from "./InteractiveSandboxes";

export function DocSectionCard({
  section,
  ui,
}: {
  section: DocSection;
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

  return (
    <section
      id={section.id}
      className="docs-section-card"
      data-swarm="rect"
      data-swarm-id={`sec-${section.id}`}
      data-swarm-deep="true"
    >
      <div className="docs-section-header">
        <span className="docs-section-badge">{section.badge}</span>
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
        <div className="docs-steps-grid">
          {section.steps.map((step, i) => (
            <div
              key={i}
              id={`step-${section.id}-${i}`}
              className="docs-step-card"
              data-swarm="rect"
            >
              <span className="docs-step-badge">{step.badge}</span>
              <h3 className="docs-step-title">{step.title}</h3>
              <p className="docs-step-body">{step.body}</p>
            </div>
          ))}
        </div>
      )}

      {section.sandbox === "3d" && <Interactive3DSandbox ui={ui} />}
      {section.sandbox === "image" && <InteractiveImageSandbox ui={ui} />}

      <div className="docs-code-list">
        {section.codeExamples.map((ex, idx) => (
          <div
            key={idx}
            id={`code-${section.id}-${idx}`}
            className="docs-code-block"
            data-swarm="rect"
          >
            <div className="docs-code-topbar">
              <div className="docs-code-dots">
                <span />
                <span />
                <span />
                <strong>{ex.title}</strong>
              </div>
              <div className="docs-code-actions">
                <span className="docs-code-filename">{ex.filename}</span>
                <button
                  type="button"
                  className="docs-copy-btn"
                  onClick={() => handleCopy(ex.code, idx)}
                >
                  {copiedIdx === idx ? ui.table.copiedBtn : ui.table.copyBtn}
                </button>
              </div>
            </div>
            <pre className="docs-code-pre">
              <code>{ex.code}</code>
            </pre>
          </div>
        ))}
      </div>

      {section.propsTable && (
        <div
          id={`table-${section.id}`}
          className="docs-table-wrap"
          data-swarm="rect"
        >
          <div className="docs-table-header">
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
                    <td>{row.desc}</td>
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
