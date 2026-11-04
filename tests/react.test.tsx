import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import {
  SwarmCanvas,
  SwarmProvider,
  SwarmElement,
  SwarmControls,
  SwarmFollower,
} from "../src/react";
import { buildSwarmLandingScene, createSwarmFollower } from "../src";

describe("React Adapter (SwarmCanvas, SwarmProvider, SwarmElement, SwarmControls, SwarmFollower)", () => {
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

  it("renders standalone SwarmFollower and steps mouse follow + circular orbit physics", () => {
    const html = renderToString(<SwarmFollower count={24} radiusScale={1} />);
    expect(html).toContain('class="cursors"');

    const follower = createSwarmFollower({ count: 12 });
    expect(follower.engine.cursors.length).toBe(12);
    follower.engine.mouse = { x: 500, y: 400 };
    follower.engine.follow(0.03, follower.engine.cursors, undefined, 1);
    follower.destroy();
  });
});
