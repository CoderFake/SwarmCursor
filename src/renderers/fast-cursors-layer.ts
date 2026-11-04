import { ARROW_CURSOR_PATH, CURSOR_HOTSPOTS } from "../core/constants";
import type { SwarmEngine } from "../core/engine";
import type { CursorShape } from "../core/types";

export interface FastCursorLayerOptions {
  showLabels?: boolean;
}

interface PooledCursorNode {
  root: HTMLDivElement;
  svg: SVGSVGElement;
  label: HTMLDivElement | null;
  lastShape: CursorShape | "";
  lastColor: string;
}

function buildCursorSvgInner(shape: CursorShape, color: string): string {
  switch (shape) {
    case "arrow":
      return `<path d="${ARROW_CURSOR_PATH}" fill="${color}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>`;
    case "dup":
      return `<path d="${ARROW_CURSOR_PATH}" transform="translate(4 3.5)" fill="#fff" stroke="${color}" stroke-width="1.3" stroke-linejoin="round"/><path d="${ARROW_CURSOR_PATH}" fill="${color}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>`;
    case "pen":
    case "pen-add":
    case "pen-close": {
      const extra =
        shape === "pen-add"
          ? `<g stroke-linecap="round"><path d="M23 19.5 V26.5 M19.5 23 H26.5" stroke="#fff" stroke-width="3.4"/><path d="M23 19.5 V26.5 M19.5 23 H26.5" stroke="#1E1E1E" stroke-width="1.3"/></g>`
          : shape === "pen-close"
            ? `<circle cx="23" cy="23" r="2.8" fill="none" stroke="#fff" stroke-width="3.2"/><circle cx="23" cy="23" r="2.8" fill="none" stroke="#1E1E1E" stroke-width="1.2"/>`
            : "";
      return `<path d="M17.4 10.6 L20.6 13.8 L13.8 20.6 L10.6 17.4 Z" fill="${color}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><path d="M3 3 L13.1 6.3 L17.4 10.6 L10.6 17.4 L6.3 13.1 Z" fill="${color}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><path d="M3.6 3.6 L8.9 8.9" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/><circle cx="10.2" cy="10.2" r="1.75" fill="none" stroke="#fff" stroke-width="1.2"/>${extra}`;
    }
    case "cross":
      return `<g stroke-linecap="round"><path d="M12 3.5 V20.5 M3.5 12 H20.5" stroke="#fff" stroke-width="3.6"/><path d="M12 3.5 V20.5 M3.5 12 H20.5" stroke="${color}" stroke-width="1.5"/></g>`;
    case "ibeam": {
      const d =
        "M8.5 4.5 H10.5 Q12 4.5 12 6 Q12 4.5 13.5 4.5 H15.5 M12 6 V18 M8.5 19.5 H10.5 Q12 19.5 12 18 Q12 19.5 13.5 19.5 H15.5";
      return `<g fill="none" stroke-linecap="round"><path d="${d}" stroke="#fff" stroke-width="3.6"/><path d="${d}" stroke="${color}" stroke-width="1.5"/></g>`;
    }
    case "ew":
    case "ns":
      return `<path d="M2.5 12 L7 7.5 V10.4 H17 V7.5 L21.5 12 L17 16.5 V13.6 H7 V16.5 Z" ${
        shape === "ns" ? 'transform="rotate(90 12 12)"' : ""
      } fill="${color}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>`;
  }
}

/**
 * Zero-React-Tick Direct-DOM Cursor Pool.
 * Updates cursor positions at 60-120Hz via GPU-composited `translate3d(...)`
 * without triggering React reconciliation.
 */
export class FastCursorLayerController {
  private container: HTMLElement;
  private showLabels: boolean;
  private pool = new Map<number, PooledCursorNode>();

  constructor(container: HTMLElement, options: FastCursorLayerOptions = {}) {
    this.container = container;
    this.showLabels = !!options.showLabels;
  }

  public sync(engine: SwarmEngine): void {
    const { s, left } = engine.vp;
    const activeIds = new Set<number>();

    for (const c of engine.cursors) {
      activeIds.add(c.id);
      let entry = this.pool.get(c.id);
      if (!entry) {
        const root = document.createElement("div");
        root.className = "cursor";
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "28");
        svg.setAttribute("height", "28");
        svg.setAttribute("viewBox", "0 0 28 28");
        root.appendChild(svg);

        let label: HTMLDivElement | null = null;
        if (this.showLabels) {
          label = document.createElement("div");
          label.className = "cursor-label";
          label.style.left = "16px";
          label.style.top = "14px";
          label.style.background = c.color;
          label.style.color = "#fff";
          label.textContent = c.name;
          root.appendChild(label);
        }

        this.container.appendChild(root);
        entry = {
          root,
          svg,
          label,
          lastShape: "",
          lastColor: "",
        };
        this.pool.set(c.id, entry);
      }

      if (entry.lastShape !== c.shape || entry.lastColor !== c.color) {
        entry.svg.innerHTML = buildCursorSvgInner(c.shape, c.color);
        entry.lastShape = c.shape;
        entry.lastColor = c.color;
      }

      const [hx, hy] = CURSOR_HOTSPOTS[c.shape];
      const scale = 1 - c.press * 0.12;
      const X = left + c.x * s;
      const Y = (c.y + (c.sticky ? engine.stick : 0)) * s;

      entry.root.style.transform = `translate3d(${X.toFixed(1)}px, ${Y.toFixed(1)}px, 0)`;
      entry.svg.style.transformOrigin = `${hx}px ${hy}px`;
      entry.svg.style.transform = `translate(${-hx}px, ${-hy}px) rotate(${c.angle.toFixed(1)}deg) scale(${scale.toFixed(2)})`;
    }

    for (const [id, entry] of this.pool.entries()) {
      if (!activeIds.has(id)) {
        entry.root.remove();
        this.pool.delete(id);
      }
    }
  }

  public destroy(): void {
    for (const entry of this.pool.values()) {
      entry.root.remove();
    }
    this.pool.clear();
  }
}
