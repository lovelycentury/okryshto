import type { Preview } from "@storybook/react";
import "@okkly/design-system/styles/index.scss";
// Storybook-only sizing for text controls — see the file for why it is not in
// the design system.
import "./preview.css";
import "./docs-template.scss";
import { okklyTheme } from "./theme";
import docsTemplate from "./docs-template.mdx";
import { StaticBackground } from "../src/components/StaticBackground/StaticBackground";

/**
 * Components consume design tokens as CSS custom properties (`--okkly-*`),
 * not SCSS `$variables` — they're runtime values. Load the token root once
 * globally here; real apps do the same at their entry point.
 *
 * Dark-only: the design system has no light palette yet. Every story sits on
 * `StaticBackground` instead of a flat canvas colour (except the background
 * stories themselves, which demo the scene).
 *
 * Docs follow the sit-onyx pattern: global autodocs, expanded controls, and a
 * shared docs page template (Title → Description → Primary → Controls → Stories).
 */
const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
      // Match onyx: show prop descriptions in a single story, required first.
      expanded: true,
      sort: "requiredFirst",
      exclude: ["ref", "key", "className", "style"],
    },
    backgrounds: { disable: true },
    // No Storybook chrome padding — the stage must be edge-to-edge.
    layout: "fullscreen",
    docs: {
      theme: okklyTheme,
      page: docsTemplate,
      toc: {
        title: "Table of Contents",
        headingSelector: ".sb-anchor > h3, #properties-and-events, #examples",
      },
      codePanel: true,
    },
    options: {
      storySort: {
        order: [
          "Introduction",
          [
            "Overview",
            "Color",
            "Type, space, elevation",
            "Guidelines",
            "Icon set",
            "Component showcase",
          ],
          "Brand",
          ["Logo", "AnimatedLogo"],
          "Control",
          "Navigation",
          "Feedback",
          "Overlays",
          "Data",
          "Media",
          "Transitions",
          "*",
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      // Brand docs (every Introduction entry): see preview-head.html —
      // `--brand-docs` class makes this canvas the only scrollport.
      const isBrandDocs = Boolean(context.parameters.brandDocs);
      const isDocs = context.viewMode === "docs";
      const skipScene =
        context.title === "Media/AnimatedBackground" || context.title === "Media/StaticBackground";

      return (
        <div
          className={[
            "okkly-storybook-stage",
            isDocs && "okkly-storybook-stage--docs",
            isBrandDocs && "okkly-storybook-stage--brand-docs",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {!skipScene && (
            <div className="okkly-storybook-bg" aria-hidden="true">
              <StaticBackground preset="aurora" quality="medium" scrim />
            </div>
          )}
          <div
            className={[
              "okkly-storybook-canvas",
              isBrandDocs && "okkly-storybook-canvas--brand-docs",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              color: "var(--okkly-text-primary)",
              fontFamily: "var(--okkly-font-family-sans)",
              boxSizing: "border-box",
            }}
          >
            <Story />
          </div>
        </div>
      );
    },
  ],
};

export default preview;
