import { addons } from "storybook/internal/manager-api";
import { okklyTheme } from "./theme";

addons.setConfig({
  theme: okklyTheme,
  sidebar: {
    showRoots: true,
  },
  toolbar: {
    // Design system is dark-only — hide the default theme/background noise.
  },
});
