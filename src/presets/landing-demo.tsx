import React from "react";
import { createRoot } from "react-dom/client";
import { DocsApp } from "../site/DocsApp";

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<DocsApp />);
}
