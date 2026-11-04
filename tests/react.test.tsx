import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import {
  SwarmCanvas,
  SwarmProvider,
  SwarmElement,
  SwarmControls,
} from "../src/react";
import { buildSwarmLandingScene } from "../src/presets/swarm-landing";

describe("React Adapter (SwarmCanvas, SwarmProvider, SwarmElement, SwarmControls)", () => {
  it("renders SwarmProvider and SwarmElement safely in SSR (renderToString)", () => {
    const html = renderToString(
      <SwarmProvider scrollMode="hybrid" controls>
        <SwarmElement id="hero" tool="text" grow snapAxis="x">
          <h1>Portfolio V3</h1>
        </SwarmElement>
        <SwarmControls />
      </SwarmProvider>
    );
    expect(html).toContain("Portfolio V3");
    expect(html).toContain('data-swarm-id="hero"');
  });

  it("renders SwarmCanvas with the swarm-landing preset", () => {
    const html = renderToString(
      <SwarmCanvas scene={buildSwarmLandingScene} scrollMode="auto" />
    );
    expect(html).toBeDefined();
  });
});
