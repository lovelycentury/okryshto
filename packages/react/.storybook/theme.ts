/**
 * Okryshto Storybook chrome theme — mirrors `@okryshto/design-system` tokens.
 *
 * Brand mark: Header lockup from Figma Static Logo Lockups
 * https://www.figma.com/design/3YsJJl5QukJZPkjoOOZahx/?node-id=422-168
 * Drop a replacement at `.storybook/brand/logo.svg` (or `.png` + update `brandImage`).
 */
import { create } from "storybook/internal/theming";

export const okryshtoTheme = create({
  base: "dark",

  // Brand — Figma header lockup (422:179) as default
  brandTitle: "okryshto.dev",
  brandUrl: "./",
  brandImage: "/brand/logo.svg",
  brandTarget: "_self",

  // Accents — indigo for chrome + selected tree item
  colorPrimary: "#818cf8", // --okryshto-accent-secondary (indigo)
  colorSecondary: "#818cf8", // selected tree surface (text stays black via manager-head)

  // Surfaces
  appBg: "#0a0a0b", // --okryshto-bg-canvas
  appContentBg: "#0f0f12", // --okryshto-bg-surface
  appPreviewBg: "#0a0a0b",
  appBorderColor: "rgba(255, 255, 255, 0.12)", // --okryshto-border-default
  appBorderRadius: 10,

  // Typography
  fontBase: '"Inter", system-ui, sans-serif',
  fontCode: '"JetBrains Mono", ui-monospace, monospace',
  textColor: "#f5f5f7", // --okryshto-text-primary
  textInverseColor: "#000000", // selected tree item label on indigo
  textMutedColor: "#6e6e78", // --okryshto-text-muted

  // Toolbar
  barTextColor: "#a9a9b2", // --okryshto-text-secondary
  barSelectedColor: "#818cf8",
  barHoverColor: "#818cf8",
  barBg: "#0f0f12",

  // Inputs / controls
  inputBg: "#16161a", // --okryshto-bg-surface-raised
  inputBorder: "rgba(255, 255, 255, 0.12)",
  inputTextColor: "#f5f5f7",
  inputBorderRadius: 10,

  // Buttons
  buttonBg: "#16161a",
  buttonBorder: "rgba(255, 255, 255, 0.12)",
  booleanBg: "#16161a",
  booleanSelectedBg: "#818cf8",
});
