/**
 * Plugin entry (main thread). Shows the control panel and runs the pipeline in
 * response to UI messages.
 */

import { generate } from "./pipeline";

interface UIMessage {
  type: "generate" | "close";
}

figma.showUI(__html__, { width: 360, height: 460, themeColors: true, title: "Vizitka Generator" });

figma.ui.onmessage = async (msg: UIMessage) => {
  if (msg.type === "close") {
    figma.closePlugin();
    return;
  }

  if (msg.type === "generate") {
    const started = Date.now();
    try {
      await generate((step) => figma.ui.postMessage({ type: "progress", step }));
      const secs = ((Date.now() - started) / 1000).toFixed(1);
      figma.ui.postMessage({ type: "done", secs });
      figma.notify(`Vizitka generated in ${secs}s ✓`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      figma.ui.postMessage({ type: "error", message });
      figma.notify(`Generation failed: ${message}`, { error: true, timeout: 6000 });
    }
  }
};
