import React from "react";
import {
  SwarmProvider,
  SwarmElement,
  Swarm3D,
  SwarmImage,
} from "swarm-cursor/react";
import "swarm-cursor/styles.css";

export default function App() {
  return (
    <SwarmProvider
      scrollMode="manual"
      deepScan={true}
      fastMode={true}
      controls={true}
      controlsPosition="bottom-left"
      showRulers={true}
      agentPill={{ position: "bottom-center", maxIcons: 5 }}
    >
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "72px 24px" }}>
        <SwarmElement id="hero-badge" tool="rect">
          <span>SwarmCursor 2.0 · Rust/WASM SIMD128</span>
        </SwarmElement>

        <SwarmElement id="hero-title" tool="text" grow snapAxis="x" deps={["hero-badge"]}>
          <h1>Multi-Agent UI Construction</h1>
        </SwarmElement>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 32 }}>
          <Swarm3D
            id="hero-3d-orb"
            buildMode="all"
            squadSize={4}
            deps={["hero-title"]}
          >
            <div style={{ height: 320, borderRadius: 24 }} />
          </Swarm3D>

          <SwarmImage
            id="hero-preview-img"
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=80"
            alt="Architecture Preview"
            buildMode="all"
            height={320}
            radius={24}
          />
        </div>
      </main>
    </SwarmProvider>
  );
}
