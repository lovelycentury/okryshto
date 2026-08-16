import type { StorybookConfig } from "@storybook/react-vite";
import type { PluginOption } from "vite";

/** vite-plugin-dts registers itself as `vite:dts`. */
const isDtsPlugin = (plugin: unknown): boolean =>
  !!plugin &&
  typeof plugin === "object" &&
  "name" in plugin &&
  (plugin as { name: string }).name === "vite:dts";

/** `plugins` may contain nested arrays, so flatten before filtering. */
const withoutDts = (plugins: PluginOption[]): PluginOption[] =>
  plugins.flat(Infinity as 1).filter((plugin) => !isDtsPlugin(plugin));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  /** Serves `.storybook/brand/*` at `/brand/*` (logo for the sidebar header). */
  staticDirs: ["./favicon", { from: "./brand", to: "/brand" }],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  /**
   * The package's vite.config.ts is a *library* build. Storybook needs an app
   * build, so strip the library-only pieces while keeping the React plugin:
   *   - `build.lib` / `rollupOptions` keep react external, leaving it unresolved
   *     at runtime; the workbench has to bundle it.
   *   - `vite:dts` emits the published .d.ts and errors out here (it
   *     looks for an api-extractor config that only exists for the lib build).
   */
  viteFinal: (config) => ({
    ...config,
    plugins: withoutDts(config.plugins ?? []),
    build: { ...config.build, lib: false as const, rollupOptions: undefined },
  }),
};

export default config;
