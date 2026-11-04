import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import {
  SwarmCanvas,
  SwarmProvider,
  SwarmElement,
  SwarmControls,
  SwarmFollower,
  SwarmAgentPill,
} from "../src/react";
import {
  AI_AGENT_ICONS,
  buildSwarmLandingScene,
  createSwarmAgentPill,
  createSwarmFollower,
} from "../src";

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
    expect(html).not.toContain("swarm-agent-pill");

    const follower = createSwarmFollower({ count: 12 });
    expect(follower.engine.cursors.length).toBe(12);
    follower.engine.mouse = { x: 500, y: 400 };
    follower.engine.follow(0.03, follower.engine.cursors, undefined, 1);
    follower.destroy();
  });

  it("renders SwarmAgentPill only when declared, caps at 5 icons, and formats '{N} agents'", () => {
    expect(AI_AGENT_ICONS.length).toBe(9);

    const optInHtml = renderToString(
      <SwarmFollower count={30} agentPill={{ maxIcons: 8 }} />
    );
    expect(optInHtml).toContain("swarm-agent-pill");
    expect(optInHtml).toContain("30 agents");
    const avatarMatches = optInHtml.match(/class="swarm-agent-avatar/g) ?? [];
    expect(avatarMatches.length).toBe(5);

    const standaloneHtml = renderToString(<SwarmAgentPill count={42} />);
    expect(standaloneHtml).toContain("42 agents");

    const vanillaPill = createSwarmAgentPill({ count: 18, maxIcons: 5 });
    expect(vanillaPill.element?.textContent).toBe("18 agents");
    expect(
      vanillaPill.element?.querySelectorAll(".swarm-agent-avatar").length
    ).toBe(5);
    vanillaPill.destroy();
  });
});
